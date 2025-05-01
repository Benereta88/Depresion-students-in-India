// Hämta distinkta sömnkategorier
let sleepCategories = (await dbQuery(`
  SELECT DISTINCT sleep_duration FROM results
`)).map(x => x.sleep_duration);

// Skapa dropdown för att filtrera en viss sömngrupp
let selectedSleep = addDropdown('Sömnkategori', sleepCategories, '7-8 hours');

addMdToPage(`## Andel depression per ålder för sömngruppen "${selectedSleep}"`);

let dataForChart = (await dbQuery(`
 SELECT age, 
         AVG(CAST(depression AS FLOAT)) * 100 AS depression_rate
  FROM results
  WHERE sleep_duration = '${selectedSleep}'
  GROUP BY age
  ORDER BY age
`)).map(x => ({ ...x, age: +x.age }));

drawGoogleChart({
  type: 'LineChart',
  data: makeChartFriendly(dataForChart, 'ålder', `% depression`),
  options: {
    height: 500,
    chartArea: { left: 50, right: 0 },
    curveType: 'function',
    pointSize: 5,
    vAxis: { format: '#%', title: '% med depression' },
    hAxis: { title: 'Ålder' },
    title: `Depressionstrend per ålder (${selectedSleep})`,
    trendlines: { 0: { color: 'red', pointSize: 0 } }
  }
});
