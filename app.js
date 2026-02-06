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

/* ADICIONAR NOVO EQUIPAMENTO */
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

/* REGISTRAR ENTREGA (MÚLTIPLOS ITENS) */
async function registrarEntrega() {
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
        funcionario: funcionario.value,
        setor: setor.value,
        equipamento: equip,
        serial: serial || null,
        data_entrega: dataEntrega.value,
        status: "EM USO",
        usuario: usuario
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
    alert("Erro ao registrar");
    console.error(error);
    return;
  }

  limparFormulario();
  carregarTabela();
}

/* LIMPAR FORMULÁRIO */
function limparFormulario() {
  funcionario.value = "";
  setor.value = "";
  dataEntrega.value = "";

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

/* CARREGAR TABELA */
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

/* DEVOLVER */
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
    alert("Erro ao devolver");
    console.error(error);
    return;
  }

  carregarTabela();
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", carregarTabela);
