
type ColumnType = string | number;

// In office TS "any" is not allowed
function logTntLib(msg: string): void {
    console.log(msg);
}

/**
 * Convertion functions between linux conventional date (1 = 1ms) and worksheet days date (1 = 1 day) 
 * Javascript Date are stored as UTC timestamp and displayed in local timezone
 * Excel Date are stored in local days (0 = 30/12/1899 00:00 local) and display in local timezone
 * To enforce this behavior, we name JS Date "UTC Date" and Excel Date "Local Days"
 */
export function localDaysToUTCDate(days: number): Date {
    // Date de référence : 30 décembre 1899 00:00:00 
    const referenceDate = new Date(Date.UTC(1899, 11, 30));

    // Calculer le nombre de millisecondes correspondant aux jours donnés
    const millisecondsInDay = 24 * 60 * 60 * 1000; // Nombre de millisecondes dans une journée
    const localDateInMilliseconds = referenceDate.getTime() + (days * millisecondsInDay);

    // Créer une nouvelle date à partir du nombre de millisecondes
    const resultDate = new Date(localDateInMilliseconds);

    // Ajuster pour la timezone locale
    const timezoneOffset = resultDate.getTimezoneOffset() * 60 * 1000; // Décalage en millisecondes
    const localDate = new Date(resultDate.getTime() + timezoneOffset);

    return localDate;
}

export function utcDateToLocalDays(date: Date): number {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch (December 30, 1899)
    const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

    // Calculate the number of days between the given date and the Excel epoch
    const daysSinceExcelEpoch = Math.floor((date.getTime() - excelEpoch.getTime()) / msPerDay);

    // Add the fractional part for the time of day
    const fractionalDay = (date.getHours() / 24) + (date.getMinutes() / 1440) + (date.getSeconds() / 86400);

    return daysSinceExcelEpoch + fractionalDay;
}

export function localDaysToLocalHoursString(days: number): string {
    // Local days to local hours
    let dayFractionSeconds = (days - Math.floor(days)) * 24 * 60 * 60;
    let hours = Math.floor(dayFractionSeconds / (60 * 60));
    let minutes = Math.floor((dayFractionSeconds / 60) % 60);
    let seconds = Math.floor(dayFractionSeconds % 60);

    return `${hours}:${minutes}:${seconds}`;
}


export function roundDaysToMinute(days: number): number {
    let r = Math.round(days * 1440) / 1440;
    return r;
}



// Typed & Named Table
export class Tnt {

    private rows: ColumnType[][] = [];
    private colNames: string[];
    private colFormat: string[];
    private keyColName: string;
    private keyIndex: number = -1;

    /**
     * @param columnNames names of columns
     * @param keyColName key column name, may by a uk or not
     */
    constructor(columnNames: string[], keyColName: string) {
        this.colNames = columnNames;
        this.keyColName = keyColName;
        this.colFormat = [];
        this.keyIndex = this.colNames.indexOf(keyColName);
    }

    addRow(newRow: ColumnType[]): void {
        this.rows.push(newRow);
    }

    addValue(keyValue: string, colName: string, value: ColumnType, errorColName: string): void {
        const row = this.findRowByKey(keyValue);
        if (row) {
            const colIndex = this.colNames.indexOf(colName);
            const errorColIndex = this.colNames.indexOf(errorColName);
            if (colIndex !== -1) {
                if (typeof row[colIndex] === 'number' && typeof value === 'number')
                    (row[colIndex] as number) += (value as number);
                else {
                    if (typeof row[colIndex] === 'string')
                        (row[colIndex] as string) += value.toString;
                    else {
                        logTntLib(`Cannot add ${value} (a string) to column ${colName} which is a number.`);
                    }
                }
            } else {
                logTntLib(`Column ${colName} does not exist, ${value} not set.`);
                if (typeof value === 'number')
                    (row[errorColIndex] as number) += value;
            }
        } else {
            logTntLib(`Row with key ${keyValue} does not exist, ${value} not set.`);
        }
    }

    diffValueOnKey(keyValue: string, otherTnt: Tnt, colNamesToDiff: string[]): boolean {
        let isDifferent = false;
        const row = this.findRowByKey(keyValue);
        const otherRow = otherTnt.findRowByKey(keyValue);
        if (row && otherRow) {
            for (const colName of colNamesToDiff) {
                const colIndex = this.colNames.indexOf(colName);
                const otherColIndex = otherTnt.colNames.indexOf(colName);
                if (colIndex !== -1 && otherColIndex !== -1) {
                    if (row[colIndex] !== otherRow[otherColIndex]) {
                        logTntLib(`diffValueOnKey on column ${colName} ${row[colIndex]} !== ${otherRow[otherColIndex]}`);
                        isDifferent = true;
                    }
                } else {
                    logTntLib(`diffValueOnKey Column ${colName} does not exist.`);
                    isDifferent = true;
                }
            }
        } else {
            logTntLib(`diffValueOnKey Row with key ${keyValue} does not exist.`);
            isDifferent = true;
        }

        return isDifferent;
    }

    /**
     * 
     * @param filterColumnNames names of columns to filter (to keep)
     * @param filterFirstColumnValue value of first column to filter
     * @returns new Tnt with filtered rows and cols
     */
    filterRowsAndCols(filterColumnNames: string[], filterFirstColumnValue: string): Tnt {

        const filteredData =
            this.rows.filter(r => r[this.colNames.indexOf(filterColumnNames[0])] === filterFirstColumnValue)
                .map(row => filterColumnNames.map(colName => row[this.colNames.indexOf(colName)]));

        const newTnt = new Tnt(filterColumnNames, filterColumnNames[0]);
        newTnt.setWorkSheetData([filterColumnNames, ...filteredData]);
        return newTnt;

    }

    // Find a record by key
    findRowByKey(keyValue: ColumnType): ColumnType[] | null {
        return this.rows.find(row => row[this.keyIndex] === keyValue) || null;
    }


    forEachRowPair(callback: (record0: ColumnType[], record1: ColumnType[] | null) => void): void {
        for (let i = 0; i < this.rows.length; i++) {
            if (i + 1 < this.rows.length)
                callback(this.rows[i], this.rows[i + 1]);
            else
                callback(this.rows[i], null);
        }
    }


    getValues(row: ColumnType[], columns: string[]): ColumnType[] {
        const colIndexes = columns.map(col => this.colNames.indexOf(col));
        return colIndexes.map(index => row[index]);
    }

    getColumnValues(colName: string): ColumnType[] {
        const colIndex = this.colNames.indexOf(colName);
        if (colIndex === -1) {
            throw new Error(`Column ${colName} does not exist.`);
        }
        return this.rows.map(row => row[colIndex]);
    }

    getLowerRightCellAddress(): string {
        const worksheetData = this.getWorksheetData();
        const numRows = worksheetData.length;
        const numCols = worksheetData[0].length;

        const colLetter = this.getColumnLetter(numCols);
        return `${colLetter}${numRows}`;
    }

    getWorksheetData(): (string | number | boolean)[][] {
        let ret: (string | number | boolean)[][] = [];
        ret.push(this.colNames);
        ret.push(...this.rows.map(row =>
            row.map(cell => {
                if (cell === "_TRUE_") {
                    return true;
                } else if (cell === "_FALSE_") {
                    return false;
                } else {
                    return cell;
                }
            })
        ));
        return ret;
    }


    private getColumnLetter(colNum: number): string {
        let letter = '';
        while (colNum > 0) {
            let remainder = (colNum - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            colNum = Math.floor((colNum - 1) / 26);
        }
        return letter;
    }

    getRowCount(): number {
        return this.rows.length
    }

    log(): void {
        console.log(this.colNames);
        console.log(this.rows);
    }

    orderRowsBy(columns: string[]): void {
        const colIndexes = columns.map(col => this.colNames.indexOf(col));

        this.rows.sort((a, b) => {
            for (let i = 0; i < colIndexes.length; i++) {
                const colIndex = colIndexes[i];
                if (a[colIndex] < b[colIndex]) {
                    return -1;
                } else if (a[colIndex] > b[colIndex]) {
                    return 1;
                }
            }
            return 0;
        });
    }

    setValue(keyValue: string, colName: string, value: ColumnType): void {
        const row = this.findRowByKey(keyValue);
        if (row) {
            const colIndex = this.colNames.indexOf(colName);
            if (colIndex !== -1) {
                row[colIndex] = value;
            } else {
                logTntLib(`Column ${colName} does not exist, ${value} not set.`);
            }
        } else {
            logTntLib(`Row with key ${keyValue} does not exist, ${value} not set.`);
        }
    }

    setValues(keyValue: string, columns: string[], values: ColumnType[]): void {
        const row = this.findRowByKey(keyValue);
        if (row) {
            columns.forEach((colName, index) => {
                const colIndex = this.colNames.indexOf(colName);
                if (colIndex !== -1) {
                    row[colIndex] = values[index];
                } else {
                    logTntLib(`Column ${colName} does not exist, ${values[index]} not set.`);
                }
            });
        } else {
            logTntLib(`Row with key ${keyValue} does not exist, values not set.`);
        }
    }

    setWorkSheetData(worksheetData: (string | number | boolean)[][]): void {
        this.colNames = worksheetData[0].map((colName) => colName.toString());
        this.keyIndex = this.colNames.indexOf(this.keyColName);

        let dataTmp: ColumnType[][] = worksheetData.slice(1).map(row =>
            row.map(cell => {
                if (typeof cell === 'boolean') {
                    return cell ? "_TRUE_" : "_FALSE_";
                } else {
                    return cell as ColumnType;
                }
            })
        );

        this.rows = dataTmp;
    }

    /**
     * Upsert rows from src into this table.
     * @param src 
     * @param columnsToUpdate columns to update always with src value (if not null or empty)
     * @param upsertAddDateColumn column indicaying the date of insertion
     * @param upsertMissingDateColumn column indicating last time src does not contain info about this row
     */
    upsertRowsWithColumns(src: Tnt, columnsToUpdate: string[], upsertAddDateColumn: string, upsertMissingDateColumn: string): void {
        const colIndexesAlways = columnsToUpdate.map(col => this.colNames.indexOf(col));
        const addDateIndex = this.colNames.indexOf(upsertAddDateColumn);
        const missingDateIndex = this.colNames.indexOf(upsertMissingDateColumn);
        const todayDays = utcDateToLocalDays(new Date(Date.now()));

        // Track existing keys to identify missing records
        const existingKeys = new Set(this.rows.map(record => record[this.keyIndex]));

        src.rows.forEach(record => {
            const key = record[src.keyIndex];
            const existingRecord = this.findRowByKey(key);
            if (existingRecord) {
                colIndexesAlways.forEach((colIndex, i) => {
                    const valueToUpdate = record[src.colNames.indexOf(columnsToUpdate[i])];
                    if ((typeof valueToUpdate === 'string' && valueToUpdate !== "") ||
                        (typeof valueToUpdate === 'number' && !isNaN(valueToUpdate)))
                        existingRecord[colIndex] = valueToUpdate;
                });


                existingKeys.delete(key);
            } else {
                const newRecord: ColumnType[] = new Array(this.colNames.length).fill(null) as ColumnType[];
                newRecord[this.keyIndex] = key;
                colIndexesAlways.forEach((colIndex, i) => {
                    newRecord[colIndex] = record[src.colNames.indexOf(columnsToUpdate[i])];
                });

                if (addDateIndex !== -1) {
                    newRecord[addDateIndex] = todayDays;
                }
                this.addRow(newRecord);
            }
        });

        // Update missing date columns for records that were not found in src
        let s = `upsertRowsWithColumns: ${src.rows.length} rows added/updated.`;
        existingKeys.forEach(key => {
            const existingRecord = this.findRowByKey(key);
            if (existingRecord && missingDateIndex !== -1) {
                existingRecord[missingDateIndex] = todayDays;
            }
        });
    }

}
