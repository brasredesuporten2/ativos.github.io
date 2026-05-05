const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

// Use 'supabase' em vez de 'window.supabase' para garantir compatibilidade
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
  const userField = document.getElementById("usuario").value.toLowerCase().trim();
  const senha = document.getElementById("senha").value;
  const erroMensagem = document.getElementById("erro");

  // Verifica se os campos estão preenchidos antes de tentar o login
  if (!userField || !senha) {
    erroMensagem.innerText = "Preencha usuário e senha";
    return;
  }

  const emailMascarado = userField.includes("@") ? userField : userField + "@sistema.local";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: emailMascarado,
      password: senha,
    });

    if (error) {
      erroMensagem.innerText = "Usuário ou senha inválidos";
      console.error("Erro Auth:", error.message);
    } else {
      const nomeApenas = data.user.email.split('@')[0];
      localStorage.setItem("usuarioLogado", nomeApenas); 
      window.location.href = "sistema.html";
    }
  } catch (err) {
    erroMensagem.innerText = "Erro ao conectar com o servidor";
    console.error("Erro Crítico:", err);
  }
}
