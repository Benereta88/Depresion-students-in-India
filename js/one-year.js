// Visualisering av depression i relation till genetisk bakgrund och suicidaltankegångar

let familyData = await dbQuery(`
  SELECT family_history_of_mental_illnes AS category, AVG(depression) * 100 AS avg_depression
  FROM results
  WHERE family_history_of_mental_illnes IS NOT NULL AND depression IS NOT NULL
  GROUP BY category
`);

let suicideData = await dbQuery(`
  SELECT have_you_ever_had_suicidal_thoughts AS category, AVG(depression) * 100 AS avg_depression
  FROM results
  WHERE have_you_ever_had_suicidal_thoughts IS NOT NULL AND depression IS NOT NULL
  GROUP BY category
`);

addMdToPage(`## Depression och familjehistorik av psykisk ohälsa
Här visas genomsnittlig andel med depression baserat på om individen har en familjehistorik av psykisk ohälsa.`);

for (let row of familyData) {
    addMdToPage(`- ${row.category}: **${row.avg_depression.toFixed(1)}%** med depression`);
}

drawGoogleChart({
    type: 'PieChart',
    data: makeChartFriendly(familyData, 'Familjehistorik', 'Depression %'),
    options: {
        title: 'Depression och familjehistorik',
        height: 400,
        colors: ['#f44336', '#4caf50']
    },
    elementId: 'chart-container-1'
});

addMdToPage(`## Depression och suicidaltankegångar
Här visas andelen med depression beroende på om personen haft suicidaltankegångar.`);

for (let row of suicideData) {
    addMdToPage(`- ${row.category}: **${row.avg_depression.toFixed(1)}%** med depression`);
}

drawGoogleChart({
    type: 'PieChart',
    data: makeChartFriendly(suicideData, 'Suicidaltankar', 'Depression %'),
    options: {
        title: 'Depression och suicidaltankar',
        height: 400,
        colors: ['#ff9800', '#2196f3']
    },
    elementId: 'chart-container-2'
});

