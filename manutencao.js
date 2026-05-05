/* 1. CONFIGURAÇÃO E INICIALIZAÇÃO (SEMPRE NO TOPO) */
const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

// Inicializa o cliente primeiro para evitar ReferenceError
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuarioLogadoNome = "";
let todosDadosManutencoes = [];

/* 2. CONTROLE DE ACESSO E AUTENTICAÇÃO */
async function verificarAcesso() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    // Se não houver sessão ativa no Supabase, volta para o login
    if (error || !session) {
        window.location.href = "index.html";
        return;
    }

    // Extrai o nome do usuário da sessão atual
    usuarioLogadoNome = session.user.email.split('@')[0].toUpperCase();
    
    const elementoUsuario = document.getElementById("usuario");
    if (elementoUsuario) {
        elementoUsuario.innerText = "Usuário: " + usuarioLogadoNome;
    }

    // Carrega os dados após confirmar o acesso
    carregarTabela();
}

// Executa a verificação imediatamente
verificarAcesso();

async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}

/* 3. LÓGICA DO MÓDULO DE MANUTENÇÃO */

// Caixa alta em tempo real
document.addEventListener("input", e => {
    if (e.target.classList.contains("text-uppercase")) {
        e.target.value = e.target.value.toUpperCase();
    }
});

async function registrarManutencao() {
    const func = document.getElementById("funcionario");
    const equip = document.getElementById("equipamento");
    const dataM = document.getElementById("dataManutencao");

    if (!func.value || !equip.value || !dataM.value) {
        alert("Preencha os campos obrigatórios");
        return;
    }

    const registro = {
        funcionario: func.value.toUpperCase(),
        setor: document.getElementById("setor").value.toUpperCase(),
        cidade: document.getElementById("cidade").value.toUpperCase(),
        equipamento: equip.value.toUpperCase(),
        serial: document.getElementById("serial").value.toUpperCase() || null,
        tipo: document.getElementById("tipo").value,
        descricao: document.getElementById("descricao").value.toUpperCase(),
        custo: document.getElementById("custo").value || null,
        data_manutencao: dataM.value,
        usuario: usuarioLogadoNome // Usa o nome da sessão ativa
    };

    const { error } = await supabaseClient
        .from("manutencoes")
        .insert([registro]);

    if (error) {
        alert("Erro ao registrar manutenção no banco.");
        console.error(error);
        return;
    }

    limparFormulario();
    carregarTabela();
}

function limparFormulario() {
    document.getElementById("funcionario").value = "";
    document.getElementById("setor").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("equipamento").value = "";
    document.getElementById("serial").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("custo").value = "";
    document.getElementById("dataManutencao").value = "";
}

async function carregarTabela() {
    const { data, error } = await supabaseClient
        .from("manutencoes")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Erro ao buscar dados:", error);
        return;
    }

    todosDadosManutencoes = data;
    exibirTabelaManutencoes(data);
    configurarFiltrosManutencao();
}

function exibirTabelaManutencoes(dados) {
    const tabelaBody = document.getElementById("tabelaManutencao");
    tabelaBody.innerHTML = "";

    dados.forEach(d => {
        tabelaBody.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.cidade || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${d.tipo || "-"}</td>
        <td class="descricao">${d.descricao || "-"}</td>
        <td>${d.custo ? "R$ " + d.custo : "-"}</td>
        <td>${new Date(d.data_manutencao).toLocaleDateString("pt-BR")}</td>
        <td>${d.usuario}</td>
      </tr>
    `;
    });
}

/* 4. FILTROS */
function configurarFiltrosManutencao() {
    const filtrosIds = [
        "filtroFuncionarioManutencao",
        "filtroSetorManutencao",
        "filtroCidadeManutencao",
        "filtroEquipamentoManutencao",
        "filtroDataInicioManutencao",
        "filtroDataFimManutencao"
    ];

    filtrosIds.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener("keyup", aplicarFiltrosManutencao);
            elemento.addEventListener("change", aplicarFiltrosManutencao);
        }
    });
}

function aplicarFiltrosManutencao() {
    const funcF = document.getElementById("filtroFuncionarioManutencao")?.value.toLowerCase() || "";
    const setorF = document.getElementById("filtroSetorManutencao")?.value.toLowerCase() || "";
    const cidadeF = document.getElementById("filtroCidadeManutencao")?.value.toLowerCase() || "";
    const equipF = document.getElementById("filtroEquipamentoManutencao")?.value.toLowerCase() || "";
    const dataIni = document.getElementById("filtroDataInicioManutencao")?.value;
    const dataFim = document.getElementById("filtroDataFimManutencao")?.value;

    const filtrados = todosDadosManutencoes.filter(item => {
        if (funcF && !item.funcionario?.toLowerCase().includes(funcF)) return false;
        if (setorF && !item.setor?.toLowerCase().includes(setorF)) return false;
        if (cidadeF && !item.cidade?.toLowerCase().includes(cidadeF)) return false;
        if (equipF && !item.equipamento?.toLowerCase().includes(equipF)) return false;
        
        if (dataIni || dataFim) {
            const dataItem = item.data_manutencao;
            if (!dataItem) return false;
            if (dataIni && dataItem < dataIni) return false;
            if (dataFim && dataItem > dataFim) return false;
        }
        return true;
    });

    exibirTabelaManutencoes(filtrados);
}

function limparFiltrosManutencao() {
    document.getElementById("filtroFuncionarioManutencao").value = "";
    document.getElementById("filtroSetorManutencao").value = "";
    document.getElementById("filtroCidadeManutencao").value = "";
    document.getElementById("filtroEquipamentoManutencao").value = "";
    document.getElementById("filtroDataInicioManutencao").value = "";
    document.getElementById("filtroDataFimManutencao").value = "";
    exibirTabelaManutencoes(todosDadosManutencoes);
}
