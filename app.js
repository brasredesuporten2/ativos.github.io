/* 1. CONFIGURAÇÃO E INICIALIZAÇÃO (SEMPRE NO TOPO) */
const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

// Inicializa o cliente primeiro para evitar erros de ReferenceError
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variável global para o nome do usuário logado
let usuarioLogadoNome = "";
let todosDadosEntregas = [];

/* 2. CONTROLE DE ACESSO E AUTENTICAÇÃO */
async function verificarAcesso() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    // Se não houver sessão ativa, redireciona para o login
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    // Extrai o nome do e-mail
    usuarioLogadoNome = session.user.email.split('@')[0].toUpperCase();
    
    // Atualiza a interface com o nome do usuário
    const elementoUsuario = document.getElementById("usuario");
    if (elementoUsuario) {
        elementoUsuario.innerText = "Usuário: " + usuarioLogadoNome;
    }

    // Após confirmar o acesso, carrega os dados da tabela
    carregarTabela();
}

// Executa a verificação assim que o script carrega
verificarAcesso();

async function logout() {
    // Encerra a sessão no servidor do Supabase
    await supabaseClient.auth.signOut();
    // Limpa dados locais
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}

/* 3. LÓGICA DO SISTEMA DE ENTREGAS */

// Listener para converter texto em caixa alta
document.addEventListener("input", e => {
    if (e.target.classList.contains("text-uppercase")) {
        e.target.value = e.target.value.toUpperCase();
    }
});

function adicionarEquipamento() {
    const container = document.getElementById("listaEquipamentos");
    container.insertAdjacentHTML("beforeend", `
    <div class="row g-2 mb-2 equipamento-item">
      <div class="col-md-5">
        <input class="form-control text-uppercase equipamento" placeholder="Equipamento">
      </div>
      <div class="col-md-5">
        <input class="form-control text-uppercase serial" placeholder="Serial">
      </div>
      <div class="col-md-2 d-grid">
        <button type="button" class="btn btn-outline-danger" onclick="this.closest('.equipamento-item').remove()">–</button>
      </div>
    </div>
  `);
}

async function registrarEntrega() {
    const funcionario = document.getElementById("funcionario");
    const dataEntrega = document.getElementById("dataEntrega");
    const setor = document.getElementById("setor");

    if (!funcionario.value || !dataEntrega.value) {
        alert("Informe o funcionário e a data da entrega");
        return;
    }

    const itens = document.querySelectorAll(".equipamento-item");
    const registros = [];

    itens.forEach(item => {
        const equip = item.querySelector(".equipamento").value.trim();
        const serial = item.querySelector(".serial").value.trim();

        if (equip) {
            registros.push({
                funcionario: funcionario.value.toUpperCase(),
                setor: setor.value.toUpperCase(),
                equipamento: equip.toUpperCase(),
                serial: serial || null,
                data_entrega: dataEntrega.value,
                status: "EM USO",
                usuario: usuarioLogadoNome // Usa o nome vindo da sessão do Auth
            });
        }
    });

    if (registros.length === 0) {
        alert("Adicione pelo menos um equipamento");
        return;
    }

    const { error } = await supabaseClient
        .from("entregas")
        .insert(registros);

    if (error) {
        alert("Erro ao registrar no banco de dados. Verifique se as permissões RLS estão ativas.");
        console.error(error);
        return;
    }

    limparFormulario();
    carregarTabela();
}

function limparFormulario() {
    document.getElementById("funcionario").value = "";
    document.getElementById("setor").value = "";
    document.getElementById("dataEntrega").value = "";

    document.getElementById("listaEquipamentos").innerHTML = `
    <div class="row g-2 mb-2 equipamento-item">
      <div class="col-md-5">
        <input class="form-control text-uppercase equipamento" placeholder="Equipamento">
      </div>
      <div class="col-md-5">
        <input class="form-control text-uppercase serial" placeholder="Serial">
      </div>
      <div class="col-md-2 d-grid">
        <button type="button" class="btn btn-outline-success" onclick="adicionarEquipamento()">+</button>
      </div>
    </div>
  `;
}

async function carregarTabela() {
    const { data, error } = await supabaseClient
        .from("entregas")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Erro ao carregar tabela:", error);
        return;
    }

    todosDadosEntregas = data;
    exibirTabelaEntregas(data);
    configurarFiltrosEntrega();
}

function exibirTabelaEntregas(dados) {
    const tabelaBody = document.getElementById("tabelaEntregas");
    tabelaBody.innerHTML = "";

    dados.forEach(d => {
        tabelaBody.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${new Date(d.data_entrega).toLocaleDateString("pt-BR")}</td>
        <td>${d.data_devolucao ? new Date(d.data_devolucao).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${d.status}</td>
        <td>
          ${
            d.status === "EM USO"
              ? `<button class="btn btn-sm btn-warning" onclick="devolver(${d.id})">Devolver</button>`
              : "-"
          }
        </td>
      </tr>
    `;
    });
}

async function devolver(id) {
    if (!confirm("Confirmar devolução do equipamento?")) return;

    const hoje = new Date().toISOString().split("T")[0];

    const { error } = await supabaseClient
        .from("entregas")
        .update({
            status: "DEVOLVIDO",
            data_devolucao: hoje
        })
        .eq("id", id);

    if (error) {
        alert("Erro ao realizar devolução.");
        console.error(error);
        return;
    }

    carregarTabela();
}

/* 4. FILTROS */
function configurarFiltrosEntrega() {
    const filtrosIds = [
        "filtroFuncionarioEntrega",
        "filtroSetorEntrega", 
        "filtroEquipamentoEntrega",
        "filtroDataInicioEntrega",
        "filtroDataFimEntrega"
    ];

    filtrosIds.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener("keyup", aplicarFiltrosEntrega);
            elemento.addEventListener("change", aplicarFiltrosEntrega);
        }
    });
}

function aplicarFiltrosEntrega() {
    const funcFiltro = document.getElementById("filtroFuncionarioEntrega")?.value.toLowerCase() || "";
    const setorFiltro = document.getElementById("filtroSetorEntrega")?.value.toLowerCase() || "";
    const equipFiltro = document.getElementById("filtroEquipamentoEntrega")?.value.toLowerCase() || "";
    const dataInicio = document.getElementById("filtroDataInicioEntrega")?.value;
    const dataFim = document.getElementById("filtroDataFimEntrega")?.value;

    const filtrados = todosDadosEntregas.filter(item => {
        if (funcFiltro && !item.funcionario?.toLowerCase().includes(funcFiltro)) return false;
        if (setorFiltro && !item.setor?.toLowerCase().includes(setorFiltro)) return false;
        if (equipFiltro && !item.equipamento?.toLowerCase().includes(equipFiltro)) return false;
        
        if (dataInicio || dataFim) {
            const dataItem = item.data_entrega;
            if (!dataItem) return false;
            if (dataInicio && dataItem < dataInicio) return false;
            if (dataFim && dataItem > dataFim) return false;
        }
        return true;
    });

    exibirTabelaEntregas(filtrados);
}

function limparFiltrosEntrega() {
    document.getElementById("filtroFuncionarioEntrega").value = "";
    document.getElementById("filtroSetorEntrega").value = "";
    document.getElementById("filtroEquipamentoEntrega").value = "";
    document.getElementById("filtroDataInicioEntrega").value = "";
    document.getElementById("filtroDataFimEntrega").value = "";
    exibirTabelaEntregas(todosDadosEntregas);
}
