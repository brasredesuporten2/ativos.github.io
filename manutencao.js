if (!localStorage.getItem("usuarioLogado")) {
  location.href = "index.html";
}

const SUPABASE_URL = "https://dehcelrslysgnfbulaer.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGNlbHJzbHlzZ25mYnVsYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTIxMTksImV4cCI6MjA4Mzk2ODExOX0.2BPHu1yLi7rB5O4BlgoTOAk4diXGa_nXO3HSdBHFtFw";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const usuario = localStorage.getItem("usuarioLogado");
document.getElementById("usuario").innerText = "Usuário: " + usuario;

async function registrarManutencao() {
  if (!funcionario.value || !equipamento.value || !dataManutencao.value) {
    alert("Campos obrigatórios não preenchidos");
    return;
  }

  await supabaseClient.from("manutencoes").insert([{
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

  limpar();
  carregarTabela();
}

function limpar() {
  document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
}

async function carregarTabela() {
  let query = supabaseClient.from("manutencoes").select("*");

  if (fFuncionario.value) query = query.ilike("funcionario", `%${fFuncionario.value}%`);
  if (fSetor.value) query = query.ilike("setor", `%${fSetor.value}%`);
  if (fCidade.value) query = query.ilike("cidade", `%${fCidade.value}%`);
  if (fEquipamento.value) query = query.ilike("equipamento", `%${fEquipamento.value}%`);
  if (fTipo.value) query = query.eq("tipo", fTipo.value);
  if (dataIni.value) query = query.gte("data_manutencao", dataIni.value);
  if (dataFim.value) query = query.lte("data_manutencao", dataFim.value);

  const { data } = await query.order("id", { ascending: false });

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
        <td class="descricao">${d.descricao}</td>
        <td>${d.custo ? "R$ " + d.custo : "-"}</td>
        <td>${new Date(d.data_manutencao).toLocaleDateString("pt-BR")}</td>
        <td>${d.usuario}</td>
      </tr>
    `;
  });
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", carregarTabela);
