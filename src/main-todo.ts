import { utcDateToLocalDays, localDaysToUTCDate, localDaysToLocalHoursString, Tnt, roundDaysToMinute } from './tnt.js';


// Use Tnt to test on "2do" list item

// Date are in UTC because they are stored in UTC, if the data set is defined in another timezone, we need to convert them to UTC

const todoCol = ["Cmd","Step","Task Description","Status","Reminder","Prio","Délai","Ano/Cycle","POM","Create","start work","stop work","Done","Time spent"];

const todo = [
    todoCol,
    ["", "Obj1", "do A", "Todo", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 12, 45, "", 1],
    ["", "Obj1", "do B", "Todo", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 12, 45, "", 1],
];






// MAIN ______________________________________________________________________________________




function test_Tnt() {
    let td = new Tnt(todo[0] as string[], "Task Description");
    td.setWorkSheetData(todo);


    let b = ["", "Obj1", "do A", "Todo", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 12, 45, "", 1];


    /**
     * sheetapp : get row number by range value (oldKey)
     * Tnt : sync sheet --> data  (only data cell) [EVOL]
     *      Trash column that start with =
     * Tnt : filterColumns (on supprime les colonne de fonctions) --> Tnt2
     * Tnt2 : check new key does not exists [OK]
     * sheetapp : insert row before in sheet [TODO]
     * sheetapp : copy row src --> dest sheetapp
     * sheetapp : copy dest (computed by sheet application) only data cell --> newRowValue
     * Tnt2 : insertRowBefore before oldkey with newValue [TODO]
     * Tnt2 : sync data --> sheet (only data cell)
     */

    //let a = td.getRowValues(0,bColToCopy);
    let a = td.findRowByKey(0);

    if (a) {
        const bColToCopy : string[]            = ["Task Description","Status","Reminder","Ano/Cycle","POM","Create"];
        const bNewVal : (string|number|null)[] = ["new Task",        "todo",   null,      null,       2,    new Date().toLocaleDateString()];

        let b = td.filterRowValue(a, bColToCopy);
        // Task Description
        b[1]="new Task";
        // Create Date
        b[6]=new Date().toLocaleDateString();
        td.addRow(a);
        td.setValues

    }




    console.log(a);

    if (a != null) {
        td.addRow(a);
    }
}



test_Tnt();
