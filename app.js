/* =========================
   LOGIN SIMPLES
========================= */
const usuarioLogado = localStorage.getItem("usuarioLogado");
if (!usuarioLogado) {
  window.location.href = "index.html";
}

/* =========================
   SUPABASE
========================= */
const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_ANON_PUBLICA_AQUI";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================
   EXPOR SUPABASE GLOBAL
   (export.js precisa disso)
========================= */
window.supabase = supabase;

/* =========================
   ELEMENTOS (SEGURO)
========================= */
const el = id => document.getElementById(id);

const funcionario = el("funcionario");
const setor       = el("setor");
const equipamento = el("equipamento");
const serial      = el("serial");
const dataEntrega = el("dataEntrega");
const tabela      = el("tabela");
const usuarioEl   = el("usuario");

/* =========================
   USUÁRIO
========================= */
if (usuarioEl) {
  usuarioEl.innerText = "Usuário: " + usuarioLogado;
}

/* =========================
   REGISTRAR ENTREGA
========================= */
async function registrarEntrega() {
  if (!funcionario || !equipamento || !dataEntrega) {
    alert("Erro: campos do formulário não encontrados");
    return;
  }

  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabase.from("entregas").insert([{
    funcionario: funcionario.value,
    setor: setor?.value || null,
    equipamento: equipamento.value,
    serial: serial?.value || null,
    data_entrega: dataEntrega.value,
    status: "EM USO",
    usuario: usuarioLogado
  }]);

  if (error) {
    console.error("Erro Supabase:", error);
    alert("Erro ao salvar");
    return;
  }

  limparFormulario();
  carregarTabela();
}

/* =========================
   LIMPAR FORM
========================= */
function limparFormulario() {
  if (funcionario) funcionario.value = "";
  if (setor) setor.value = "";
  if (equipamento) equipamento.value = "";
  if (serial) serial.value = "";
  if (dataEntrega) dataEntrega.value = "";
}

/* =========================
   DEVOLVER
========================= */
window.devolver = async function (id) {
  const { error } = await supabase
    .from("entregas")
    .update({
      status: "DEVOLVIDO",
      data_devolucao: new Date().toISOString().split("T")[0]
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao devolver");
    return;
  }

  carregarTabela();
};

/* =========================
   CARREGAR TABELA
========================= */
async function carregarTabela() {
  if (!tabela) return;

  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro ao carregar:", error);
    return;
  }

  tabela.innerHTML = "";

  data.forEach(d => {
    tabela.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${new Date(d.data_entrega).toLocaleDateString("pt-BR")}</td>
        <td>${d.data_devolucao
          ? new Date(d.data_devolucao).toLocaleDateString("pt-BR")
          : "-"}</td>
        <td>${d.status}</td>
        <td>
          ${d.status === "EM USO"
            ? `<button onclick="devolver(${d.id})">Devolver</button>`
            : ""}
        </td>
      </tr>
    `;
  });
}

/* =========================
   LOGOUT (GLOBAL)
========================= */
window.logout = function () {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", carregarTabela);
