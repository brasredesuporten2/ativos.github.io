function exportarExcel(tabelaId) {
  const tabela = document.getElementById(tabelaId);
  if (!tabela) return;

  let csv = [];
  const linhas = tabela.closest("table").querySelectorAll("tr");

  linhas.forEach(linha => {
    let dados = [];
    linha.querySelectorAll("th, td").forEach(col => {
      dados.push(`"${col.innerText.replace(/\n/g, " ")}"`);
    });
    csv.push(dados.join(";"));
  });

  const blob = new Blob(["\uFEFF" + csv.join("\n")], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ativos_manut_" + new Date().toISOString().slice(0,10) + ".csv";
  link.click();
}

