async function verificarAcesso() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    window.location.href = "index.html";
    return;
  }

  // Extrai o nome do e-mail (robson@sistema.local -> robson)
  const nomeExibicao = session.user.email.split('@')[0];
  document.getElementById("usuario").innerText = "Usuário: " + nomeExibicao.toUpperCase();
}

// Executa a verificação
verificarAcesso();

// Atualize sua função de logout
async function logout() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

/* VARIÁVEL PARA ARMAZENAR TODOS OS DADOS DA TABELA */
let todosDadosManutencoes = [];

/* CAIXA ALTA EM TEMPO REAL */
document.addEventListener("input", e => {
  if (e.target.classList.contains("text-uppercase")) {
    e.target.value = e.target.value.toUpperCase();
  }
});

async function registrarManutencao() {
  if (!funcionario.value || !equipamento.value || !dataManutencao.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabaseClient.from("manutencoes").insert([{
    funcionario: funcionario.value,
    setor: setor.value,
    cidade: cidade.value,
    equipamento: equipamento.value,
    serial: serial.value || null,
    tipo: tipo.value,
    descricao: descricao.value,
    custo: custo.value || null,
    data_manutencao: dataManutencao.value,
    usuario: usuario
  }]);

  if (error) {
    alert("Erro ao registrar");
    console.error(error);
    return;
  }

  limparFormulario();
  carregarTabela();
}

function limparFormulario() {
  funcionario.value = "";
  setor.value = "";
  cidade.value = "";
  equipamento.value = "";
  serial.value = "";
  tipo.value = "";
  descricao.value = "";
  custo.value = "";
  dataManutencao.value = "";
}

async function carregarTabela() {
  const { data, error } = await supabaseClient
    .from("manutencoes")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  todosDadosManutencoes = data;
  exibirTabelaManutencoes(data);
  configurarFiltrosManutencao();
}

/* FUNÇÃO PARA EXIBIR A TABELA */
function exibirTabelaManutencoes(dados) {
  tabelaManutencao.innerHTML = "";

  dados.forEach(d => {
    tabelaManutencao.innerHTML += `
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

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

/* ========== FILTROS DO MÓDULO MANUTENÇÃO ========== */
function configurarFiltrosManutencao() {
  const filtros = [
    "filtroFuncionarioManutencao",
    "filtroSetorManutencao",
    "filtroCidadeManutencao",
    "filtroEquipamentoManutencao",
    "filtroDataInicioManutencao",
    "filtroDataFimManutencao"
  ];

  filtros.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.removeEventListener("keyup", aplicarFiltrosManutencao);
      elemento.removeEventListener("change", aplicarFiltrosManutencao);
      elemento.addEventListener("keyup", aplicarFiltrosManutencao);
      elemento.addEventListener("change", aplicarFiltrosManutencao);
    }
  });
}

function aplicarFiltrosManutencao() {
  const funcionario = document.getElementById("filtroFuncionarioManutencao")?.value.toLowerCase() || "";
  const setor = document.getElementById("filtroSetorManutencao")?.value.toLowerCase() || "";
  const cidade = document.getElementById("filtroCidadeManutencao")?.value.toLowerCase() || "";
  const equipamento = document.getElementById("filtroEquipamentoManutencao")?.value.toLowerCase() || "";
  const dataInicio = document.getElementById("filtroDataInicioManutencao")?.value;
  const dataFim = document.getElementById("filtroDataFimManutencao")?.value;

  const dadosFiltrados = todosDadosManutencoes.filter(item => {
    // Filtro de funcionário
    if (funcionario && !item.funcionario?.toLowerCase().includes(funcionario)) return false;
    
    // Filtro de setor
    if (setor && !item.setor?.toLowerCase().includes(setor)) return false;
    
    // Filtro de cidade
    if (cidade && !item.cidade?.toLowerCase().includes(cidade)) return false;
    
    // Filtro de equipamento
    if (equipamento && !item.equipamento?.toLowerCase().includes(equipamento)) return false;
    
    // Filtro de período
    if (dataInicio || dataFim) {
      const dataManutencao = item.data_manutencao;
      if (!dataManutencao) return false;
      
      if (dataInicio && dataManutencao < dataInicio) return false;
      if (dataFim && dataManutencao > dataFim) return false;
    }
    
    return true;
  });

  exibirTabelaManutencoes(dadosFiltrados);
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

document.addEventListener("DOMContentLoaded", carregarTabela);
