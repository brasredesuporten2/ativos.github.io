function exportarExcel() {
  let csv = "Funcionário,Equipamento,Serial,Entrega,Devolução,Status,Usuário\n";

  dados.forEach(d => {
    csv += `${d.funcionario},${d.equipamento},${d.serial},${d.dataEntrega},${d.dataDevolucao},${d.status},${d.usuario}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "controle_ativos_internos.csv";
  link.click();
}

function backupDados() {
  const blob = new Blob(
    [JSON.stringify(dados, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "backup_controle_ativos.json";
  link.click();
}

function restaurarBackup() {
  const file = document.getElementById("arquivoBackup").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    dados = JSON.parse(e.target.result);
    localStorage.setItem("dados", JSON.stringify(dados));
    carregarTabela();
    alert("Backup restaurado com sucesso!");
  };
  reader.readAsText(file);
}
