let years = (await dbQuery(
  'SELECT DISTINCT year FROM dataWithMonths'
)).map(x => x.year);

let year1 = addDropdown('År 1', years, 1964);
let year2 = addDropdown('År 2', years, 2024);

addMdToPage(`
  ## Medeltemperaturer i Malmö, jämförelse mellan år ${year1} och år ${year2}
`);

// in order to get the two years to compare
// we perform a join between two subselects
let dataForChart = await dbQuery(`
  SELECT monthName1 AS monthName, temp1, temp2 FROM
    (SELECT monthNameShort AS monthName1, temperatureC AS temp1 FROM dataWithMonths WHERE year = '${year1}') AS t1,
    (SELECT monthNameShort AS monthName2, temperatureC AS temp2 FROM dataWithMonths WHERE year = '${year2}') AS t2
  WHERE t1.monthName1 = t2.monthName2
`);

drawGoogleChart({
  type: 'LineChart',
  data: makeChartFriendly(dataForChart, 'månad', `°C ${year1}`, `°C ${year2}`),
  options: {
    height: 500,
    chartArea: { left: 50, right: 0 },
    curveType: 'function',
    pointSize: 5,
    pointShape: 'circle',
    vAxis: { format: '# °C' },
    title: `Medeltemperatur per månad i Malmö, jämförelse mellan år ${year1} och ${year2} (°C)`
  }
});

// the same db query as before, but with the long month names
let dataForTable = await dbQuery(`
  SELECT monthName1 AS monthName, temp1, temp2 FROM
    (SELECT monthName AS monthName1, temperatureC AS temp1 FROM dataWithMonths WHERE year = '${year1}') AS t1,
    (SELECT monthName AS monthName2, temperatureC AS temp2 FROM dataWithMonths WHERE year = '${year2}') AS t2
  WHERE t1.monthName1 = t2.monthName2
`);

tableFromData({
  data: dataForTable,
  columnNames: ['Månad', `Medeltemperatur (°C) ${year1}`, `Medeltemperatur (°C) ${year2}`]
});