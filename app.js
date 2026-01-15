/* =========================
   LOGIN
========================= */
const usuarioLogado = localStorage.getItem("usuarioLogado");
if (!usuarioLogado) {
  window.location.href = "index.html";
}

/* =========================
   SUPABASE (ÚNICA VEZ)
========================= */
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    "https://dehcelrslysgnfbulaer.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw"
  );
}

const db = window.supabaseClient;

/* =========================
   ELEMENTOS
========================= */
const $ = id => document.getElementById(id);

const funcionario = $("funcionario");
const setor       = $("setor");
const equipamento = $("equipamento");
const serial      = $("serial");
const dataEntrega = $("dataEntrega");
const tabela      = $("tabela");
const usuarioEl   = $("usuario");

/* =========================
   USUÁRIO
========================= */
if (usuarioEl) {
  usuarioEl.innerText = "Usuário: " + usuarioLogado;
}

/* =========================
   REGISTRAR ENTREGA
========================= */
window.registrarEntrega = async function () {
  if (!funcionario || !equipamento || !dataEntrega) {
    alert("Erro: campos não encontrados");
    return;
  }

  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await db.from("entregas").insert([{
    funcionario: funcionario.value,
    setor: setor?.value || null,
    equipamento: equipamento.value,
    serial: serial?.value || null,
    data_entrega: dataEntrega.value,
    status: "EM USO",
    usuario: usuarioLogado
  }]);

  if (error) {
    console.error("Supabase:", error);
    alert("Erro ao salvar");
    return;
  }

  limparFormulario();
  carregarTabela();
};

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
  const { error } = await db
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

  const { data, error } = await db
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

