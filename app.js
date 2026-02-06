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

/* CAIXA ALTA EM TEMPO REAL */
document.addEventListener("input", e => {
  if (e.target.classList.contains("text-uppercase")) {
    e.target.value = e.target.value.toUpperCase();
  }
});

async function registrarEntrega() {
  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabaseClient.from("entregas").insert([{
    funcionario: funcionario.value,
    setor: setor.value,
    equipamento: equipamento.value,
    serial: serial.value || null,
    data_entrega: dataEntrega.value,
    status: "EM USO",
    usuario: usuario
  }]);

  if (error) {
    alert("Erro ao registrar");
    console.error(error);
    return;
  }

  funcionario.value = "";
  setor.value = "";
  equipamento.value = "";
  serial.value = "";
  dataEntrega.value = "";

  carregarTabela();
}

async function carregarTabela() {
  const { data, error } = await supabaseClient
    .from("entregas")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  tabelaEntregas.innerHTML = "";

  data.forEach(d => {
    tabelaEntregas.innerHTML += `
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
    .update({ status: "DEVOLVIDO", data_devolucao: hoje })
    .eq("id", id);

  if (error) {
    alert("Erro ao devolver");
    console.error(error);
    return;
  }

  carregarTabela();
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", carregarTabela);
