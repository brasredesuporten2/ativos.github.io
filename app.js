/* =========================
   PROTEÇÃO DE LOGIN
========================= */
if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

/* =========================
   SUPABASE
========================= */
const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_ANON_PUBLICA";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* =========================
   ELEMENTOS
========================= */
const funcionario = document.getElementById("funcionario");
const setor       = document.getElementById("setor");
const equipamento = document.getElementById("equipamento");
const serial      = document.getElementById("serial");
const dataEntrega = document.getElementById("dataEntrega");
const tabela      = document.getElementById("tabela");

/* =========================
   USUÁRIO
========================= */
const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

/* =========================
   REGISTRAR ENTREGA
========================= */
async function registrarEntrega() {
  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabase.from("entregas").insert([{
    funcionario: funcionario.value,
    setor: setor.value || null,
    equipamento: equipamento.value,
    serial: serial.value || null,
    data_entrega: dataEntrega.value,
    status: "EM USO",
    usuario: usuario
  }]);

  if (error) {
    console.error(error);
    alert("Erro ao registrar entrega");
    return;
  }

  limparFormulario();
  carregarTabela();
}

/* =========================
   LIMPAR FORM
========================= */
function limparFormulario() {
  funcionario.value = "";
  setor.value = "";
  equipamento.value = "";
  serial.value = "";
  dataEntrega.value = "";
}

/* =========================
   DEVOLVER
========================= */
async function devolver(id) {
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
}

/* =========================
   CARREGAR TABELA
========================= */
async function carregarTabela() {
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
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
        <td>
          <span class="badge ${d.status === "EM USO" ? "bg-warning" : "bg-success"}">
            ${d.status}
          </span>
        </td>
        <td>
          ${d.status === "EM USO"
            ? `<button class="btn btn-sm btn-success" onclick="devolver(${d.id})">Devolver</button>`
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
