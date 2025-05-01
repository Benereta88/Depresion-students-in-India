addMdToPage("✅ Din analysfil `one-year.js` är korrekt laddad!");


// Kontrollera att dbQuery fungerar
let rows = await dbQuery("SELECT * FROM results LIMIT 5");
console.log("Testdata:", rows);
