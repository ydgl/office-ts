// BEGIN LIBRARY _____________________________________________________________
type ColumnType = string | number;

// Typed & Named Table
export class Tnt {

    upsertDataWithColumns(src: Tnt, upsertColumns: string[], upsertAddDateColumn: string, upsertMissingDateColumn: string): void {
        const colIndexes = upsertColumns.map(col => this.colNames.indexOf(col));
        const addDateIndex = this.colNames.indexOf(upsertAddDateColumn);
        const missingDateIndex = this.colNames.indexOf(upsertMissingDateColumn);
        const now = this.getExcelDate(new Date());

        // Track existing keys to identify missing records
        const existingKeys = new Set(this.data.map(record => record[this.keyIndex]));

        src.data.forEach(record => {
            const key = record[src.keyIndex];
            const existingRecord = this.findRecordByKey(key);
            if (existingRecord) {
                colIndexes.forEach((colIndex, i) => {
                    existingRecord[colIndex] = record[src.colNames.indexOf(upsertColumns[i])];
                });

                existingKeys.delete(key);
            } else {
                const newRecord: ColumnType[] = new Array(this.colNames.length).fill(null) as ColumnType[];
                newRecord[this.keyIndex] = key;
                colIndexes.forEach((colIndex, i) => {
                    newRecord[colIndex] = record[src.colNames.indexOf(upsertColumns[i])];
                });
                if (addDateIndex !== -1) {
                    newRecord[addDateIndex] = now;
                }
                this.addRecord(newRecord);
            }
        });

        // Update missing date columns for records that were not found in src
        existingKeys.forEach(key => {
            const existingRecord = this.findRecordByKey(key);
            if (existingRecord && missingDateIndex !== -1) {
                existingRecord[missingDateIndex] = now;
            }
        });
    }

    private getExcelDate(date: Date): number {
        const startDate = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch date
        const diff = date.getTime() - startDate.getTime();
        return diff / (1000 * 60 * 60 * 24);
    }

    private data: ColumnType[][] = [];
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

    // Add a new record
    addRecord(record: ColumnType[]): void {
        this.data.push(record);
    }

    // Find a record by key
    findRecordByKey(keyValue: ColumnType): ColumnType[] | null {
        return this.data.find(row => row[this.keyIndex] === keyValue) || null;
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

        this.data = dataTmp;
    }


    getWorksheetData(): (string | number | boolean)[][] {
        let ret: (string | number | boolean)[][] = [];
        ret.push(this.colNames);
        ret.push(...this.data.map(row =>
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


    getLowerRightCellAddress(): string {
        const worksheetData = this.getWorksheetData();
        const numRows = worksheetData.length;
        const numCols = worksheetData[0].length;

        const colLetter = this.getColumnLetter(numCols);
        return `${colLetter}${numRows}`;
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

    log(): void {
        console.log(this.colNames);
        console.log(this.data);
    }


    // Delete a record by primary key
    // deleteRecordByKey(keyValue: ColumnType): void {
    //     const index = this.data.findIndex(row => row[this.keyColName] === keyValue);
    //     if (index !== -1) {
    //         this.data.splice(index, 1);
    //     } else {
    //         throw new Error(`Record with key "${keyValue}" not found.`);
    //     }
    // }
}


// END LIBRARY _______________________________________________________________

