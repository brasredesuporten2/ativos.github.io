function exportarExcel(tabelaId) {
  const tabela = document.getElementById(tabelaId);

  if (!tabela) {
    alert("Tabela não encontrada para exportação");
    return;
  }

  let csv = [];
  const linhas = tabela.closest("table").querySelectorAll("tr");

  linhas.forEach(linha => {
    let dados = [];
    linha.querySelectorAll("th, td").forEach(coluna => {
      let texto = coluna.innerText.replace(/\n/g, " ").trim();
      dados.push(`"${texto}"`);
    });
    csv.push(dados.join(";"));
  });

  const csvContent = csv.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "exportacao_" + new Date().toISOString().slice(0,10) + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
