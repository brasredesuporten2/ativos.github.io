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

/* REGISTRAR */
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

  alert("Manutenção registrada");
  carregarTabela();
}

/* CARREGAR + FILTROS */
async function carregarTabela(f = {}) {
  let q = supabaseClient.from("manutencoes").select("*").order("id", { ascending: false });

  if (f.func) q = q.ilike("funcionario", `%${f.func}%`);
  if (f.setor) q = q.ilike("setor", `%${f.setor}%`);
  if (f.cidade) q = q.ilike("cidade", `%${f.cidade}%`);
  if (f.equip) q = q.ilike("equipamento", `%${f.equip}%`);
  if (f.serial) q = q.ilike("serial", `%${f.serial}%`);
  if (f.tipo) q = q.eq("tipo", f.tipo);
  if (f.ini) q = q.gte("data_manutencao", f.ini);
  if (f.fim) q = q.lte("data_manutencao", f.fim);

  const { data, error } = await q;
  if (error) return console.error(error);

  tabela.innerHTML = "";

  data.forEach(d => {
    tabela.innerHTML += `
      <tr>
        <td>${d.funcionario}</td>
        <td>${d.setor || "-"}</td>
        <td>${d.cidade || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${d.tipo}</td>
        <td>${d.descricao}</td>
        <td>${d.custo ? "R$ " + d.custo : "-"}</td>
        <td>${new Date(d.data_manutencao).toLocaleDateString("pt-BR")}</td>
      </tr>
    `;
  });
}

/* APLICAR FILTROS */
function aplicarFiltros() {
  carregarTabela({
    func: fFunc.value,
    setor: fSetor.value,
    cidade: fCidade.value,
    equip: fEquip.value,
    serial: fSerial.value,
    tipo: fTipo.value,
    ini: fInicio.value,
    fim: fFim.value
  });
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", carregarTabela);
