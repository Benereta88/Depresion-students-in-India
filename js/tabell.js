
// Lägg till markdown-text till sidan
addMdToPage("# Här är en lista över databasen Results i SQLite");

// Hämta data från Results-tabellen i SQLite
let county = await dbQuery("SELECT * FROM Results");

console.log('County data:', county); // Detta ska visa datan från SQL i konsolen

// Skapa en tabell från de hämtade resultaten
tableFromData({ data: county });

