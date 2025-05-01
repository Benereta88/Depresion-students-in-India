// Definiera presskategorier och etiketter inklusive sömn
const pressTypes = [
  { column: 'academic_pressure', label: 'Akademisk press' },
  { column: 'work_pressure', label: 'Jobbpress' },
];

// Skapa dropdowns för kategori och kön
let selectedPress = addDropdown('Välj kategori:', pressTypes.map(p => p.label), 'Akademisk press', updateChart);
let selectedGender = addDropdown('Välj kön:', ['Alla', 'Man', 'Kvinna'], 'Alla', updateChart);

// Initiera visning
await updateChart();

// Huvudfunktion för att uppdatera vyn
async function updateChart() {
  document.querySelector('#chart-container')?.remove();
  document.querySelector('#table-container')?.remove();
  document.querySelector('#legend-container')?.remove();

  let pressObj = pressTypes.find(p => p.label === selectedPress);
  let pressColumn = pressObj.column;
  let pressLabel = pressObj.label;

  let genderCondition = '';
  if (selectedGender === 'Man') genderCondition = "AND gender = 'Male'";
  if (selectedGender === 'Kvinna') genderCondition = "AND gender = 'Female'";

  let sql = `
    SELECT CAST(${pressColumn} AS TEXT) AS pressure_label, COUNT(*) AS count
    FROM results
    WHERE ${pressColumn} IS NOT NULL AND depression = 1
    ${genderCondition}
    GROUP BY pressure_label
    ORDER BY pressure_label
  `;

  let data = await dbQuery(sql);

  // Textsammanfattning
  addMdToPage(`## Andel med depression per ${pressLabel.toLowerCase()} (${selectedGender.toLowerCase()})\n`);

  if (!data.length) {
    addMdToPage(`❗ Ingen data hittades för kombinationen "${pressLabel}" och kön "${selectedGender}".`);
    return;
  }

  for (let row of data) {
    addMdToPage(`- ${pressLabel} ${row.pressure_label}: **${row.count} personer** med depression`);
  }

  // Färgspektrum röd → orange → gul → ljusgrön → grön → mörkgrön
  const gradientColors = ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c', '#81c784', '#aed581'];

  // Sortera data efter värde (antal)
  const sorted = [...data].sort((a, b) => a.count - b.count);
  const colorMap = data.map(row => {
    const index = sorted.findIndex(r => r.pressure_label === row.pressure_label);
    return gradientColors[index % gradientColors.length];
  });

  // Konvertera till rätt format för BarChart
  const chartData = [['Kategori', 'Antal', { role: 'style' }]].concat(
    data.map((row, i) => [String(row.pressure_label), row.count, colorMap[i]])
  );

  drawGoogleChart({
    type: 'BarChart',
    data: chartData,
    options: {
      title: `Depression per ${pressLabel.toLowerCase()} (${selectedGender.toLowerCase()})`,
      height: 400,
      legend: 'none',
      bar: { groupWidth: '60%' },
      hAxis: { title: 'Antal personer med depression' },
      vAxis: { title: pressLabel }
    },
    elementId: 'chart-container'
  });

  // Visa färglegend
  addMdToPage(`\n<div id="legend-container">
    <strong>Färgförklaring:</strong>
    <ul>
      <li><span style="color:#d32f2f">■</span> Högst andel depression</li>
      <li><span style="color:#f57c00">■</span> Nästan hög</li>
      <li><span style="color:#fbc02d">■</span> Medel</li>
      <li><span style="color:#388e3c">■</span> Nästan låg</li>
      <li><span style="color:#81c784">■</span> Låg</li>
      <li><span style="color:#aed581">■</span> Lägst andel depression</li>
    </ul>
  </div>`);

  // Visa tabell med data
  tableFromData(data, {
    columns: [pressLabel, 'Antal'],
    elementId: 'table-container'
  });
}
