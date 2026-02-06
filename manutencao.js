if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = "index.html";
}

const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_ANON_AQUI";

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

/* REGISTRAR MANUTENÇÃO */
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
    console.error(error);
    alert("Erro ao registrar manutenção");
    return;
  }

  alert("Manutenção registrada com sucesso");

  limparFormularioManutencao();
  carregarTabela();
}

/* LIMPAR FORMULÁRIO */
function limparFormularioManutencao() {
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

/* CARREGAR HISTÓRICO */
async function carregarTabela(f = {}) {
  let q = supabaseClient
    .from("manutencoes")
    .select("*")
    .order("id", { ascending: false });

  if (f.func) q = q.ilike("funcionario", `%${f.func}%`);
  if (f.setor) q = q.ilike("setor", `%${f.setor}%`);
  if (f.cidade) q = q.ilike("cidade", `%${f.cidade}%`);
  if (f.equip) q = q.ilike("equipamento", `%${f.equip}%`);
  if (f.serial) q = q.ilike("serial", `%${f.serial}%`);
  if (f.tipo) q = q.eq("tipo", f.tipo);
  if (f.ini) q = q.gte("data_manutencao", f.ini);
  if (f.fim) q = q.lte("data_manutencao", f.fim);

  const { data, error } = await q;
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
        <td>${d.cidade || "-"}</td>
        <td>${d.equipamento}</td>
        <td>${d.serial || "-"}</td>
        <td>${d.tipo || "-"}</td>
        <td class="descricao">${d.descricao || "-"}</td>
        <td>${d.custo ? "R$ " + d.custo : "-"}</td>
        <td>${new Date(d.data_manutencao).toLocaleDateString("pt-BR")}</td>
        <td>${d.usuario || "-"}</td>
      </tr>
    `;
  });
}

/* FILTROS */
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
