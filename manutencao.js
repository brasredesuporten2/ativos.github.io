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

  tabelaManutencao.innerHTML = "";

  data.forEach(d => {
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

document.addEventListener("DOMContentLoaded", carregarTabela);
