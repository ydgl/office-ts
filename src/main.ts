import { Tnt } from './tnt.js';

const transitions = [
    ["ID", "Status", "From", "To", "Type", "Start", "End", "TransitionID", "RandomBoolean"],
    // AD-101: Chronological Flow
    ["AD-101", "Fermée", "Open", "Conception Fonctionnelle", "Story", "2023-01-01 08:00", "2023-01-02 10:00", 1001, Math.random() < 0.5],
    ["AD-101", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", "2023-01-01 08:00", "2023-01-03 12:00", 1002, Math.random() < 0.5],
    ["AD-101", "Fermée", "À réaliser", "Réalisation en cours", "Story", "2023-01-01 08:00", "2023-01-04 09:00", 1003, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisation en cours", "Réalisée", "Story", "2023-01-01 08:00", "2023-01-05 14:00", 1004, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisée", "Fermée", "Story", "2023-01-01 08:00", "2023-01-06 16:00", 1005, Math.random() < 0.5],

    // AD-102: Transition Flow
    ["AD-102", "Fermée", "Open", "À réaliser", "Story", "2023-01-01 08:00", "2023-01-02 10:00", 2001, Math.random() < 0.5],
    ["AD-102", "Fermée", "À réaliser", "Développement", "Story", "2023-01-01 08:00", "2023-01-03 12:00", 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "Développement", "Test Intégration", "Story", "2023-01-01 08:00", "2023-01-04 09:00", 2003, Math.random() < 0.5],
    ["AD-102", "Fermée", "Test Intégration", "À valider", "Story", "2023-01-01 08:00", "2023-01-05 14:00", 2004, Math.random() < 0.5],
    ["AD-102", "Fermée", "À valider", "Fermée", "Story", "2023-01-01 08:00", "2023-01-06 16:00", 2005, Math.random() < 0.5],

    // AD-103: Loops and Duplicates
    ["AD-103", "Fermée", "Open", "Conception Fonctionnelle", "Story", "2023-01-02 10:00", 3001, Math.random() < 0.5],
    ["AD-103", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", "2023-01-01 08:00", "2023-01-02 10:00", 3002, Math.random() < 0.5],
    ["AD-103", "Fermée", "À réaliser", "Réalisation en cours", "Story", "2023-01-01 08:00", "2023-01-02 10:00", 3003, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisation en cours", "À réaliser", "Story", "2023-01-01 08:00", "2023-01-03 12:00", 3004, Math.random() < 0.5], // Loop Transition
    ["AD-103", "Fermée", "Réalisation en cours", "Réalisée", "Story", "2023-01-01 08:00", "2023-01-04 09:00", 3005, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisée", "Fermée", "Story", "2023-01-01 08:00", "2023-01-05 14:00", 3006, Math.random() < 0.5],
];

const scope = [
    ["ID",     "Status",        "Detected", "Missing", "Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "Fermée"],
    ["AD-101", "À réaliser",    45667.66,      "",      10,                         0,            0,                      0,          0],
    ["AD-102", "Open",          45667.66,       "",      0,                          0,            10,                     0,          0],
    ["AD-miss","Open",          45667.66,       "",      0,                          0,            10,                     0,          0],
];

let trans = new Tnt(transitions[0] as string[], "ID");
trans.setWorkSheetData(transitions);

let sc = new Tnt(scope[0] as string[], "ID");
sc.setWorkSheetData(scope);

sc.log();

sc.upsertDataWithColumns(trans, ["ID","Status"], "Detected", "Missing");

sc.log();



// upsertScope_new(tickets, tracking, ["Clé"]);

// function upsertScope_new(ticketsTable: TableSheet, scopeTable: TableSheet, keys: string[]) {

//     let ticketKeys = ticketsTable.keyValues;
  
//     let scopeKeys = new Set(scopeTable.keyValues);
  
//     // Initialiser array for new scope keys
//     let newScopeKeys: string[] = [];
//     let newScopeKeyTimestamps: (string | number | boolean) [] = [];
  
//     // Build table of newKey
//     for (let i = 0; i < ticketKeys.length; i++) {
//       let value = ticketKeys[i];
//       if (value && !scopeKeys.has(value)) {
//         newScopeKeys.push(value);
//         let updateDate: (string | number | boolean)[] = getRowValues(ticketsTable, value, ["Mise à jour"]);
//         newScopeKeyTimestamps.push(updateDate[0]); // Ajouter l'heure et la date actuelles
//         scopeKeys.add(value); // Ajouter au Set pour éviter les doublons futurs
//       }
//     }
  
//     // Add new entries to scope
//     if (newScopeKeys.length > 0) {
//       let lastRow = scopeTable.sheet.getUsedRange()?.getRowCount() || 1; // Inclure A1 si vide
//       let targetRow = Math.max(lastRow, 1) + 1; // S'assurer de commencer à partir de A2
  
//       setColumnValues(scopeTable, "Clé", newScopeKeys, targetRow,"url");
  
//       setColumnValues(scopeTable, "Added", newScopeKeyTimestamps, targetRow,"date");
//     }
  
//     reconstructTableSheetCache(scopeTable);
  
//     //console.log("update");
  
//     scopeTable.keyValues.forEach((k) => {
//       console.log(k + " > ligne : " + ticketKeys.indexOf(k));
//       if ((ticketKeys.indexOf(k)) < 0) {
//         console.log("Disapeared");
//         setValue(scopeTable, k, "Disapeared", dateToExcelDate());
//       } else {
//         const colNames = ["Story point estimate", "Type de ticket", "Personne assignée", "État"];
//         //console.log("get values");
//         let v = getRowValues(ticketsTable, k, colNames);
//         //console.log("getRowValues = " + v);
//         setRowValues(scopeTable, k, colNames, v);
//       }
//       //console.log("fin");
//     });
  
  
//     function reconstructTableSheetCache(ts: TableSheet) {
  
//       let lastColumn = ts.sheet.getUsedRange()?.getColumnCount() || 0;
  
//       // Get the range for the first row dynamically
//       let firstRowRange = ts.sheet.getRangeByIndexes(0, 0, 1, lastColumn); // Row 0, all columns
//       let cols = firstRowRange.getValues()[0].map((cell) => cell?.toString() || "");
  
//       let rk = ts.sheet.getRangeByIndexes(1, cols.indexOf(ts.keyColName), ts.sheet.getUsedRange(true).getRowCount() - 1, 1);
//       let v = rk.getColumn(0).getValues();
//       let kv = v.map((cell) => cell?.toString() || "");
  
//       ts.colNames = cols;
//       ts.keyValues = kv;
  
//     }
  
  
//   }