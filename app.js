/* =============================
   PROTEÇÃO DE LOGIN
============================= */
if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

/* =============================
   SUPABASE
============================= */
const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =============================
   USUÁRIO LOGADO
============================= */
const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

/* =============================
   REGISTRAR ENTREGA
============================= */
async function registrarEntrega() {
  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabaseClient
    .from("entregas")
    .insert([{
      funcionario: funcionario.value,
      setor: setor.value,
      equipamento: equipamento.value,
      serial: serial.value || null,
      data_entrega: dataEntrega.value,
      status: "EM USO",
      usuario: usuario
    }]);

  if (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao registrar entrega");
    return;
  }

  alert("Entrega registrada com sucesso");
  limparFormulario();
  carregarTabela();
}

/* =============================
   LIMPAR FORMULÁRIO
============================= */
function limparFormulario() {
  funcionario.value = "";
  setor.value = "";
  equipamento.value = "";
  serial.value = "";
  dataEntrega.value = "";
}

/* =============================
   CARREGAR TABELA
============================= */
async function carregarTabela() {
  const { data, error } = await supabaseClient
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
      </tr>
    `;
  });
}

/* =============================
   LOGOUT (FUNCIONA)
============================= */
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

/* =============================
   INICIAR SISTEMA
============================= */
document.addEventListener("DOMContentLoaded", carregarTabela);
