// Definiera sömnintervall i timmar
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

  // Visa hypotesen och analysen
  addMdToPage(`
    ## Hypotes: Sömnens påverkan på depression
    Vi hypoteserar att sömnens längd har en direkt påverkan på depressionens förekomst. 
    - Kortare sömn (<5 timmar) kan vara en bidragande orsak till högre nivåer av depression.
    - Längre sömn (>8 timmar) kan indikera andra faktorer som påverkar depression, t.ex. överdriven sömnrelaterad inaktivitet.

    **Syftet med denna analys är att undersöka sambandet mellan sömn och depression genom olika åldersgrupper.**
  `);

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

  // Om ingen data finns, visa exempeldata
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

  // Slutsats baserat på sömnintervall
  addMdToPage(`
    ## Slutsats: Sömnens påverkan på depression

Analysen visar att sömnens längd kan ha en märkbar effekt på depressionens förekomst, men en intressant observation är att personer mellan **30 och 40 år** tenderar att ha de **högsta nivåerna av depression**, oavsett hur mycket eller lite de sover. Detta tyder på att det finns en annan faktor som påverkar depressionen för den åldersgruppen, vilket kan vara stress eller livsstilsrelaterade problem.

- **För personer som sover mindre än 5 timmar** om dagen (kort sömn), är depressionen generellt högre, vilket tyder på att **sömnbrist** är en riskfaktor för depression.
- **För personer som sover mer än 8 timmar** (lång sömn), ses också en hög nivå av depression, vilket kan tyda på andra faktorer, såsom **sömnstörningar** eller **inaktivitet**, som kan leda till en ökad risk för depression.
- **Personer mellan 30 och 40 år** uppvisar konsekvent de högsta nivåerna av depression, vilket kan innebära att den här åldersgruppen är särskilt utsatt för de psykiska påfrestningar som är förknippade med karriär och familjeliv. Dessa faktorer kan ha en större inverkan på deras psykiska hälsa än mängden sömn de får.

Dessa resultat tyder på vikten av att inte bara fokusera på **sömnens längd** när vi analyserar depression, utan också på andra livsstils- och sociala faktorer, särskilt för den åldersgrupp som verkar vara mest utsatt.

Sammanfattningsvis kan **för lite eller för mycket sömn** vara riskfaktorer för depression, men för personer i åldern 30–40 år tyder resultaten på att andra faktorer, såsom **stress och livsstilsproblem**, kan spela en mer avgörande roll för depressionen.

  `);
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
