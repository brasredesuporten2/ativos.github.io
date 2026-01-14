const usuarios = [
  { usuario: "robson", senha: "SUPr1yot" },
  { usuario: "fernando", senha: "SUPr1yot" }
];

function login() {
  const u = document.getElementById("usuario").value;
  const s = document.getElementById("senha").value;

  const valido = usuarios.find(user => user.usuario === u && user.senha === s);

  if (valido) {
    localStorage.setItem("usuarioLogado", u);
    window.location.href = "sistema.html";
  } else {
    document.getElementById("erro").innerText = "Usuário ou senha inválidos";
  }
}
