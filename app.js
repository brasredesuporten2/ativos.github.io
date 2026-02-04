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

/* CAIXA ALTA */
document.addEventListener("input", e => {
  if (e.target.classList.contains("text-uppercase")) {
    e.target.value = e.target.value.toUpperCase();
  }
});

/* ADICIONAR EQUIPAMENTO */
function adicionarEquipamento() {
  document.getElementById("listaEquipamentos").insertAdjacentHTML("beforeend", `
    <div class="row g-2 mb-2 equipamento-item">
      <div class="col-md-5">
        <input class="form-control equipamento text-uppercase" placeholder="Equipamento">
      </div>
      <div class="col-md-5">
        <input class="form-control serial text-uppercase" placeholder="Nº de Série">
      </div>
      <div class="col-md-2 d-grid">
        <button class="btn btn-outline-danger" onclick="this.closest('.equipamento-item').remove()">−</button>
      </div>
    </div>
  `);
}

/* REGISTRAR */
async function registrarEntrega() {
  if (!funcionario.value || !dataEntrega.value) {
    alert("Informe funcionário e data");
    return;
  }

  const itens = document.querySelectorAll(".equipamento-item");
  const registros = [];

  itens.forEach(i => {
    const eq = i.querySelector(".equipamento").value.trim();
    const se = i.querySelector(".serial").value.trim();

    if (eq) {
      registros.push({
        funcionario: funcionario.value,
        setor: setor.value,
        equipamento: eq,
        serial: se || null,
        data_entrega: dataEntrega.value,
        status: "EM USO",
        usuario
      });
    }
  });

  if (!registros.length) {
    alert("Adicione pelo menos um equipamento");
    return;
  }

  const { error } = await supabaseClient.from("entregas").insert(registros);
  if (error) return alert("Erro ao salvar");

  alert("Entrega registrada");
  carregarTabela();
}

/* CARREGAR + FILTROS */
async function carregarTabela(f = {}) {
  let q = supabaseClient.from("entregas").select("*").order("id", { ascending:false });

  if (f.func) q = q.ilike("funcionario", `%${f.func}%`);
  if (f.setor) q = q.ilike("setor", `%${f.setor}%`);
  if (f.equip) q = q.ilike("equipamento", `%${f.equip}%`);
  if (f.serial) q = q.ilike("serial", `%${f.serial}%`);
  if (f.data) q = q.eq("data_entrega", f.data);

  const { data, error } = await q;
  if (error) return console.error(error);

  tabela.innerHTML = "";

  data.forEach(d => {
    tabela.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${new Date(d.data_entrega).toLocaleDateString("pt-BR")}</td>
        <td>${d.data_devolucao ? new Date(d.data_devolucao).toLocaleDateString("pt-BR") : "-"}</td>
        <td>${d.status}</td>
        <td>
          ${d.status === "EM USO"
            ? `<button class="btn btn-sm btn-warning" onclick="devolverEquipamento(${d.id})">Devolver</button>`
            : "-"}
        </td>
      </tr>
    `;
  });
}

function aplicarFiltros() {
  carregarTabela({
    func: fFunc.value,
    setor: fSetor.value,
    equip: fEquip.value,
    serial: fSerial.value,
    data: fData.value
  });
}

/* DEVOLVER */
async function devolverEquipamento(id) {
  if (!confirm("Confirmar devolução?")) return;

  const hoje = new Date().toISOString().split("T")[0];

  await supabaseClient
    .from("entregas")
    .update({ status:"DEVOLVIDO", data_devolucao: hoje })
    .eq("id", id);

  carregarTabela();
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", carregarTabela);
