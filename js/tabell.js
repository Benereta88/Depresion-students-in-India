// Lägg till markdown-text till sidan
addMdToPage("# Här är en lista över databasen Results i SQLite");

// Använd korrekt databas
dbQuery.use('sqlite-databas.db');

// Hämta data från Results-tabellen i SQLite
let county = await dbQuery("SELECT * FROM Results");

// Logga datan för att se om vi får korrekt resultat
console.log('county:', county);

