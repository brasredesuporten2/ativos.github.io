if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

const supabase = supabaseJs.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

let dados = JSON.parse(localStorage.getItem("dados")) || [];

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
}

async function registrarEntrega() {
  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabase
    .from("entregas")
    .insert([{
      funcionario: funcionario.value,
      setor: setor.value,
      equipamento: equipamento.value,
      serial: serial.value,
      data_entrega: dataEntrega.value,
      status: "EM USO",
      usuario: usuario
    }]);

  if (error) {
    alert("Erro ao salvar");
    console.error(error);
  } else {
    alert("Entrega registrada com sucesso");
    carregarTabela();
  }
}


  const registro = {
    funcionario: funcionario.value,
    setor: setor.value,
    equipamento: equipamento.value,
    serial: serial.value,
    dataEntrega: new Date(dataEntrega.value).toLocaleDateString("pt-BR"),
    dataDevolucao: "",
    status: "EM USO",
    usuario: usuario
  };


function devolver(index) {
  dados[index].status = "DEVOLVIDO";
  dados[index].dataDevolucao = new Date().toLocaleDateString("pt-BR");
  salvar();
  carregarTabela();
}

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
        <td>${d.serial}</td>
        <td>${new Date(d.data_entrega).toLocaleDateString("pt-BR")}</td>
        <td>${d.data_devolucao
          ? new Date(d.data_devolucao).toLocaleDateString("pt-BR")
          : "-"}</td>
        <td>
          <span class="badge ${d.status === "EM USO" ? "bg-warning" : "bg-success"}">
            ${d.status}
          </span>
        </td>
      </tr>
    `;
  });
}


function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}


carregarTabela();
