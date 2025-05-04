// Definiera presskategorier och etiketter
const pressTypes = [
  { column: 'academic_pressure', label: 'Akademisk press' },
  { column: 'work_pressure', label: 'Jobbpress' },
];

// Skapa dropdowns för kategori och kön
let selectedPress = addDropdown('Välj kategori:', pressTypes.map(p => p.label), 'Akademisk press', updateChart);
let selectedGender = addDropdown('Välj kön:', ['Alla', 'Man', 'Kvinna', 'Visa jämförelse'], 'Alla', updateChart);


// Lägg till hypotes överst på sidan
addMdToPage(`
  ### Hypotes
  > Personer som upplever hög akademisk eller jobbrelaterad press löper större risk att drabbas av depression.  
  > Det kan även finnas könsskillnader i hur denna press påverkar individen.
  `);


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

  let sql = '';

  // SQL-fråga beroende på könsval
  if (selectedGender === 'Visa jämförelse') {
    sql = `
      SELECT gender, CAST(${pressColumn} AS TEXT) AS pressure_label, COUNT(*) AS count
      FROM results
      WHERE ${pressColumn} IS NOT NULL AND depression = 1
      GROUP BY gender, pressure_label
      ORDER BY pressure_label, gender
    `;
  } else {
    let genderCondition = '';
    if (selectedGender === 'Man') genderCondition = "AND gender = 'Male'";
    if (selectedGender === 'Kvinna') genderCondition = "AND gender = 'Female'";

    sql = `
      SELECT CAST(${pressColumn} AS TEXT) AS pressure_label, COUNT(*) AS count
      FROM results
      WHERE ${pressColumn} IS NOT NULL AND depression = 1
      ${genderCondition}
      GROUP BY pressure_label
      ORDER BY pressure_label
    `;
  }

  const data = await dbQuery(sql);

  // Textsammanfattning
  addMdToPage(`## Andel med depression per ${pressLabel.toLowerCase()} (${selectedGender.toLowerCase()})\n`);

  if (!data.length) {
    addMdToPage(`❗ Ingen data hittades för kombinationen "${pressLabel}" och kön "${selectedGender}".`);
    return;
  }

  // Visa textdata
  if (selectedGender === 'Visa jämförelse') {
    const grouped = {};
    for (let row of data) {
      if (!grouped[row.pressure_label]) grouped[row.pressure_label] = {};
      grouped[row.pressure_label][row.gender] = row.count;
    }

    for (let key in grouped) {
      const man = grouped[key]['Male'] || 0;
      const woman = grouped[key]['Female'] || 0;
      addMdToPage(`- ${pressLabel} ${key}: **${man} män**, **${woman} kvinnor** med depression`);
    }
  } else {
    for (let row of data) {
      addMdToPage(`- ${pressLabel} ${row.pressure_label}: **${row.count} personer** med depression`);
    }
  }

  // Bygg datan till diagram
  let chartData;

  if (selectedGender === 'Visa jämförelse') {
    const labels = [...new Set(data.map(row => row.pressure_label))];
    chartData = [['Kategori', 'Man', 'Kvinna']];

    for (let label of labels) {
      const maleRow = data.find(r => r.pressure_label === label && r.gender === 'Male');
      const femaleRow = data.find(r => r.pressure_label === label && r.gender === 'Female');
      chartData.push([
        label,
        maleRow ? maleRow.count : 0,
        femaleRow ? femaleRow.count : 0
      ]);
    }
  } else {
    // Färgspektrum
    const gradientColors = ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c', '#81c784', '#aed581'];
    const sorted = [...data].sort((a, b) => a.count - b.count);
    const colorMap = data.map(row => {
      const index = sorted.findIndex(r => r.pressure_label === row.pressure_label);
      return gradientColors[index % gradientColors.length];
    });

    chartData = [['Kategori', 'Antal', { role: 'style' }]].concat(
      data.map((row, i) => [String(row.pressure_label), row.count, colorMap[i]])
    );
  }

  // Rita diagram
  drawGoogleChart({
    type: selectedGender === 'Visa jämförelse' ? 'ColumnChart' : 'BarChart',
    data: chartData,
    options: {
      title: `Depression per ${pressLabel.toLowerCase()} (${selectedGender.toLowerCase()})`,
      height: 400,
      legend: selectedGender === 'Visa jämförelse' ? { position: 'top' } : 'none',
      bar: { groupWidth: '60%' },
      hAxis: { title: selectedGender === 'Visa jämförelse' ? 'Antal' : 'Antal personer med depression' },
      vAxis: { title: pressLabel }
    },
    elementId: 'chart-container'
  });

  // Visa färglegend bara för enkel vy
  if (selectedGender !== 'Visa jämförelse') {
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
  }

  // Visa tabell
  if (selectedGender === 'Visa jämförelse') {
    tableFromData(chartData.slice(1).map(row => ({
      Kategori: row[0],
      Man: row[1],
      Kvinna: row[2]
    })), {
      columns: ['Kategori', 'Man', 'Kvinna'],
      elementId: 'table-container'
    });
  } else {
    tableFromData(data, {
      columns: [pressLabel, 'Antal'],
      elementId: 'table-container'
    });
  }
}

  addMdToPage(`
    
### Slutsats
> Resultatet visar att det finns ett samband mellan upplevd press och depression.  
> Generellt syns fler med depression vid högre pressnivåer.  
> 
> Vid jämförelse mellan kön tyder datan på att **kvinnor är mer benägna att rapportera depression** vid höga pressnivåer än män.
`);
