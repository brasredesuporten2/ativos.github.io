if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}


const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

let dados = JSON.parse(localStorage.getItem("dados")) || [];

function salvar() {
  localStorage.setItem("dados", JSON.stringify(dados));
}

function registrarEntrega() {
  if (!funcionario.value || !equipamento.value || !dataEntrega.value) {
    alert("Preencha todos os campos obrigatórios.");
    return;
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

  dados.push(registro);
  salvar();
  carregarTabela();

  funcionario.value = "";
  setor.value = "";
  equipamento.value = "";
  serial.value = "";
  dataEntrega.value = "";
}


function devolver(index) {
  dados[index].status = "DEVOLVIDO";
  dados[index].dataDevolucao = new Date().toLocaleDateString("pt-BR");
  salvar();
  carregarTabela();
}

function carregarTabela() {
  tabela.innerHTML = "";

  dados.forEach((d, i) => {
    tabela.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial}</td>
        <td>${d.dataEntrega}</td>
        <td>${d.dataDevolucao || "-"}</td>
        <td>
          <span class="badge ${d.status === "EM USO" ? "bg-warning" : "bg-success"}">
            ${d.status}
          </span>
        </td>
        <td>
          ${d.status === "EM USO"
            ? `<button class="btn btn-sm btn-danger" onclick="devolver(${i})">Devolver</button>`
            : "-"}
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
