async function exportarExcel() {
  const { data, error } = await supabaseClient
    .from("entregas")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    alert("Erro ao exportar dados");
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    alert("Nenhum dado para exportar");
    return;
  }

  let csv = "Funcionário;Setor;Equipamento;Serial;Data Entrega;Data Devolução;Status;Usuário\n";

  data.forEach(d => {
    csv += `"${d.funcionario}";`;
    csv += `"${d.setor || ""}";`;
    csv += `"${d.equipamento}";`;
    csv += `"${d.serial || ""}";`;
    csv += `"${formatarData(d.data_entrega)}";`;
    csv += `"${formatarData(d.data_devolucao)}";`;
    csv += `"${d.status}";`;
    csv += `"${d.usuario}"\n`;
  });

  baixarCSV(csv, "controle_ativos.csv");
}

/* =============================
   FUNÇÕES AUXILIARES
============================= */
function formatarData(data) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR");
}

function baixarCSV(conteudo, nomeArquivo) {
  const blob = new Blob(["\ufeff" + conteudo], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
