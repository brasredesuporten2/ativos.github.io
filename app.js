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
   FORÇAR CAIXA ALTA EM TEMPO REAL
============================= */
function forcarCaixaAlta(elemento) {
  elemento.addEventListener("input", () => {
    elemento.value = elemento.value.toUpperCase();
  });
}

/* =============================
   REGISTRAR ENTREGA
============================= */
async function registrarEntrega() {
  if (!funcionario.value || !dataEntrega.value) {
    alert("Informe o funcionário e a data da entrega");
    return;
  }

  const itens = document.querySelectorAll(".equipamento-item");
  const registros = [];

  itens.forEach(item => {
    const equipamento = item.querySelector(".equipamento").value.trim();
    const serial = item.querySelector(".serial").value.trim();

    if (equipamento) {
      registros.push({
        funcionario: funcionario.value.toUpperCase(),
        setor: setor.value.toUpperCase(),
        equipamento: equipamento.toUpperCase(),
        serial: serial ? serial.toUpperCase() : null,
        data_entrega: dataEntrega.value,
        status: "EM USO",
        usuario: usuario.toUpperCase()
      });
    }
  });

  if (registros.length === 0) {
    alert("Adicione pelo menos um equipamento para registrar a entrega");
    return;
  }

  const { error } = await supabaseClient
    .from("entregas")
    .insert(registros);

  if (error) {
    console.error("Erro ao registrar:", error);
    alert("Erro ao registrar entregas");
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
  dataEntrega.value = "";

  const container = document.getElementById("listaEquipamentos");
  container.innerHTML = gerarLinhaEquipamento();
  aplicarCaixaAltaCampos();
}

/* =============================
   ADICIONAR EQUIPAMENTO
============================= */
function adicionarEquipamento() {
  const container = document.getElementById("listaEquipamentos");
  const div = document.createElement("div");
  div.className = "row g-2 mb-2 equipamento-item";
  div.innerHTML = gerarLinhaEquipamento(true);
  container.appendChild(div);
  aplicarCaixaAltaCampos();
}

/* =============================
   TEMPLATE LINHA EQUIPAMENTO
============================= */
function gerarLinhaEquipamento(remover = false) {
  return `
    <div class="row g-2 mb-2 equipamento-item">
      <div class="col-md-5">
        <input type="text" class="form-control equipamento"
               placeholder="Equipamento">
      </div>
      <div class="col-md-5">
        <input type="text" class="form-control serial"
               placeholder="Nº de Série">
      </div>
      <div class="col-md-2 d-grid">
        ${
          remover
            ? `<button type="button" class="btn btn-outline-danger"
                       onclick="this.closest('.equipamento-item').remove()">−</button>`
            : `<button type="button" class="btn btn-outline-success"
                       onclick="adicionarEquipamento()">+</button>`
        }
      </div>
    </div>
  `;
}

/* =============================
   APLICAR CAIXA ALTA AOS CAMPOS
============================= */
function aplicarCaixaAltaCampos() {
  forcarCaixaAlta(funcionario);
  forcarCaixaAlta(setor);

  document.querySelectorAll(".equipamento").forEach(forcarCaixaAlta);
  document.querySelectorAll(".serial").forEach(forcarCaixaAlta);
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
        <td>${
          d.data_devolucao
            ? new Date(d.data_devolucao).toLocaleDateString("pt-BR")
            : "-"
        }</td>
        <td>${d.status}</td>
        <td>
          ${
            d.status === "EM USO"
              ? `<button class="btn btn-sm btn-warning"
                         onclick="devolverEquipamento(${d.id})">
                   Devolver
                 </button>`
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

/* =============================
   DEVOLVER EQUIPAMENTO
============================= */
async function devolverEquipamento(id) {
  const confirmar = confirm(
    "Tem certeza que deseja registrar a DEVOLUÇÃO deste equipamento?\n\nEssa ação não poderá ser desfeita."
  );

  if (!confirmar) return;

  const hoje = new Date().toISOString().split("T")[0];

  const { error } = await supabaseClient
    .from("entregas")
    .update({
      status: "DEVOLVIDO",
      data_devolucao: hoje
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao devolver:", error);
    alert("Erro ao registrar devolução");
    return;
  }

  alert("Equipamento devolvido com sucesso");
  carregarTabela();
}

/* =============================
   LOGOUT
============================= */
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

/* =============================
   INICIAR SISTEMA
============================= */
document.addEventListener("DOMContentLoaded", () => {
  carregarTabela();
  aplicarCaixaAltaCampos();
});
