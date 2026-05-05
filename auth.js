const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
  const userField = document.getElementById("usuario").value.toLowerCase().trim();
  const senha = document.getElementById("senha").value;
  const erroMensagem = document.getElementById("erro");

  // Adiciona o sufixo automaticamente se o usuário não digitar
  const emailMascarado = userField.includes("@") ? userField : userField + "@sistema.local";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: emailMascarado,
    password: senha,
  });

  if (error) {
    erroMensagem.innerText = "Usuário ou senha inválidos";
    console.error(error.message);
  } else {
    // Salva apenas o nome (antes do @) para usar no sistema
    const nomeApenas = data.user.email.split('@')[0];
    localStorage.setItem("usuarioLogado", nomeApenas); 
    window.location.href = "sistema.html";
  }
}
