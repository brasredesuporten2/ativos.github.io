async function exportarExcel() {
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    alert("Erro ao exportar");
    return;
  }

  let csv = "Funcionário,Setor,Equipamento,Serial,Entrega,Devolução,Status,Usuário\n";

  data.forEach(d => {
    csv += `"${d.funcionario}","${d.setor || ""}","${d.equipamento}","${d.serial || ""}","${d.data_entrega}","${d.data_devolucao || ""}","${d.status}","${d.usuario}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "controle_ativos_internos.csv";
  link.click();
}
