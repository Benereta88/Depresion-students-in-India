// Definiera sömnintervaller i timmar
const sleepHourGroups = [
  { label: '<5', min: 0, max: 4.9 },
  { label: '5–6', min: 5.0, max: 6.9 },
  { label: '7–8', min: 7.0, max: 8.9 },
  { label: '>8', min: 9.0, max: 24.0 }
];

// Skapa dropdown och rendera första gången
let selectedLabel = addDropdown('Sömnkategori (timmar)', sleepHourGroups.map(x => x.label), '7–8', updateChart);
await updateChart(selectedLabel);

// Funktion som körs varje gång användaren väljer ny kategori
async function updateChart(selected) {
  document.querySelector('#chart-container')?.remove(); // Rensa tidigare diagram

  const selectedRange = sleepHourGroups.find(x => x.label === selected);
  if (!selectedRange) {
    addMdToPage(`Okänd sömnkategori "${selected}" – ingen data att visa.`);
    return;
  }

  addMdToPage(`## Andel depression per ålder för sömnintervallet "${selected}" timmar`);

  const sqlQuery = `
    SELECT age, 
           AVG(CAST(depression AS FLOAT)) * 100 AS depression_rate
    FROM results
    WHERE sleep_hours BETWEEN ${selectedRange.min} AND ${selectedRange.max}
    GROUP BY age
    ORDER BY age
  `;

  console.log("Kör SQL:", sqlQuery);

  let dataForChart = (await dbQuery(sqlQuery)).map(x => ({ ...x, age: +x.age }));

  if (!Array.isArray(dataForChart) || dataForChart.length === 0) {
    addMdToPage(`Ingen data hittades för "${selected}" timmar. Visar exempeldata.`);
    dataForChart = [
      { age: 20, depression_rate: 10 },
      { age: 30, depression_rate: 15 },
      { age: 40, depression_rate: 20 },
      { age: 50, depression_rate: 18 },
      { age: 60, depression_rate: 12 }
    ];
  }

  drawGoogleChart({
    type: 'LineChart',
    data: makeChartFriendly(dataForChart, 'age', 'depression_rate'),
    options: {
      height: 500,
      chartArea: { left: 50, right: 0 },
      curveType: 'function',
      pointSize: 5,
      vAxis: { format: '#%', title: '% med depression' },
      hAxis: { title: 'Ålder' },
      title: `Depression per ålder (${selected} tim sömn)`,
      trendlines: { 0: { color: 'red', pointSize: 0 } }
    },
    elementId: 'chart-container' // viktigt för att kunna rensa
  });
}

// Hjälpfunktion för att anpassa data till Google Charts
function makeChartFriendly(e$, ...t$) {
  if (!Array.isArray(e$) || e$.length === 0 || !e$[0]) {
    console.warn("makeChartFriendly: no data or invalid data");
    return [['Ingen data']];
  }
  const keys = Object.keys(e$[0]);
  t$.forEach((val, idx) => keys[idx] = val);
  return [keys, ...e$.map(item => Object.values(item))];
}
