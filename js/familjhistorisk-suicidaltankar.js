// === Förbättrad hjälpfunktion ===
function makeChartFriendly(data, categoryLabel, valueLabel) {
    const chartData = [[categoryLabel, valueLabel]];
    for (let row of data) {
        let category = row.category || 'Okänt';
        let value = parseFloat(row.avg_depression);
        if (!isNaN(value)) {
            chartData.push([category, value]);
        }
    }
    return chartData;
}

// === Hypotes ===
addMdToPage(`
## Hypotes
Vi förväntar oss att personer med en familjehistorik av psykisk ohälsa har högre risk för depression,
 då genetiska faktorer och uppväxtmiljö tros spela en roll. Dessutom förväntas personer som har haft
  suicidaltankar uppvisa en högre förekomst av depression, vilket återspeglar en starkare koppling mellan depression och suicidrisk.
`);

// === Hämta data från databasen ===
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

// === Visa och analysera familjehistorik ===
addMdToPage(`## Depression och familjehistorik av psykisk ohälsa`);

for (let row of familyData) {
    // Här använder vi samma genomsnitt för att visa i texten
    addMdToPage(`- **${row.category}**: ${row.avg_depression.toFixed(1)}% med depression`);
}

let familyChartData = makeChartFriendly(familyData, 'Familjehistorik', 'Depression %');

drawGoogleChart({
    type: familyChartData.length > 2 ? 'PieChart' : 'BarChart',
    data: familyChartData,
    options: {
        title: 'Depression och familjehistorik',
        height: 400,
        colors: ['#AEDC58', '#FE9900'],
        legend: { position: 'right' }
    },
    elementId: 'chart-container-1'
});

addMdToPage(`
**Analys:** Resultatet tyder på att personer med en familjehistorik av psykisk ohälsa uppvisar en högre genomsnittlig förekomst av depression. Det kan indikera ett genetiskt eller miljöbetingat samband, där både arv och uppväxtmiljö spelar in.
`);

// === Visa och analysera suicidaltankar ===
addMdToPage(`## Depression och suicidaltankegångar`);

for (let row of suicideData) {
    // Här använder vi samma genomsnitt för att visa i texten
    addMdToPage(`- **${row.category}**: ${row.avg_depression.toFixed(1)}% med depression`);
}

let suicideChartData = makeChartFriendly(suicideData, 'Suicidaltankar', 'Depression %');

drawGoogleChart({
    type: suicideChartData.length > 2 ? 'PieChart' : 'BarChart',
    data: suicideChartData,
    options: {
        title: 'Depression och suicidaltankar',
        height: 400,
        colors: ['#FF3232', '#32FF32'],
        legend: { position: 'right' }
    },
    elementId: 'chart-container-2'
});

addMdToPage(`
**Analys:** Personer som uppger att de haft suicidaltankegångar visar markant högre nivåer av depression. Det är ett starkt samband som betonar vikten av tidig identifiering och stöd vid sådana tankar. Resultatet är också förenligt med tidigare forskning om depressionens koppling till suicidrisk.
`);

addMdToPage(`
    
    
    ## Sammanfattande slutsats
    
    Analysen visar tydligt att **depression är vanligare hos personer med en familjehistorik av psykisk ohälsa** 
    samt hos **personer som haft suicidaltankegångar**.
    
    - Sambandet med familjehistorik antyder att både genetiska och miljömässiga faktorer kan påverka risken 
    för depression.
    - Sambandet med suicidaltankar visar hur allvarlig depressionen kan bli, och hur viktigt det är med tidig
     upptäckt och stöd.
    
    Dessa insikter understryker behovet av **förebyggande insatser** och **riktade åtgärder** 
    för grupper i riskzonen.
`);
