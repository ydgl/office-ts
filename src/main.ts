import { dateToDay, Tnt } from './tnt.js';

const transitions = [
    ["ID", "Status", "From", "To", "Type", "TransitionDate", "TransitionID", "RandomBoolean"],
    // AD-101: Chronological Flow
    ["AD-101", "Fermée", "Open", "Conception Fonctionnelle", "Story", dateToDay(new Date("2023-01-01T08:00:00Z")).toString(), 1001, Math.random() < 0.5],
    ["AD-101", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", dateToDay(new Date("2023-01-02T08:00:00Z")).toString(), 1002, Math.random() < 0.5],
    ["AD-101", "Fermée", "À réaliser", "Réalisation en cours", "Story", dateToDay(new Date("2023-01-03T08:00:00Z")).toString(), 1003, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisation en cours", "Réalisée", "Story", dateToDay(new Date("2023-01-04T08:00:00Z")).toString(), 1004, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisée", "Fermée", "Story", dateToDay(new Date("2023-01-05T08:00:00Z")).toString(), 1005, Math.random() < 0.5],

    // AD-102: Transition Flow (deux passage par "Réalisation en cours")
    ["AD-102", "Fermée", "Open", "À réaliser", "Story", dateToDay(new Date("2023-01-01T08:00:00Z")).toString(), 2001, Math.random() < 0.5],
    ["AD-102", "Fermée", "À réaliser", "Réalisation en cours", "Story", dateToDay(new Date("2023-01-02T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisation en cours", "À réaliser", "Story", dateToDay(new Date("2023-01-03T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "À réaliser", "Réalisation en cours", "Story", dateToDay(new Date("2023-01-04T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisée", "À valider", "Story", dateToDay(new Date("2023-01-06T08:00:00Z")).toString(), 2004, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisation en cours", "Réalisée", "Story", dateToDay(new Date("2023-01-05T08:00:00Z")).toString(), 2003, Math.random() < 0.5],
    ["AD-102", "Fermée", "À valider", "Fermée", "Story", dateToDay(new Date("2023-01-07T08:00:00Z")).toString(), 2005, Math.random() < 0.5],

    // AD-103: Loops and Duplicates
    ["AD-103", "Fermée", "Open", "Conception Fonctionnelle", "Story", dateToDay(new Date("2023-01-01T08:00:00Z")).toString(), 3001, Math.random() < 0.5],
    ["AD-103", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", dateToDay(new Date("2023-01-02T08:00:00Z")).toString(), 3002, Math.random() < 0.5],
    ["AD-103", "Fermée", "À réaliser", "Réalisation en cours", "Story", dateToDay(new Date("2023-01-03T08:00:00Z")).toString(), 3003, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisation en cours", "À réaliser", "Story", dateToDay(new Date("2023-01-04T08:00:00Z")).toString(), 3004, Math.random() < 0.5], // Loop Transition
    ["AD-103", "Fermée", "Réalisation en cours", "Réalisée", "Story", dateToDay(new Date("2023-01-05T08:00:00Z")).toString(), 3005, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisée", "Fermé-eer", "Story", dateToDay(new Date("2023-01-06T08:00:00Z")).toString(), 3006, Math.random() < 0.5],
];

const scope = [
    ["ID", "Status", "Detected", "Missing", "Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider", "Fermée","Error"],
    ["AD-101", "À réaliser", 45667.66, "", 10, 0, 0, 0, 0, 0],
    ["AD-102", "Open", 45667.66, "", 0, 0, 10, 0, 0, 0],
    ["AD-miss", "Open", 45667.66, "", 0, 0, 10, 0, 0, 0],
];



/**
 * Compute the number of days between two dates, 1 = 1 day
 * @param workerProfile name of worker
 * @param status status of the task
 * @param from beginning in days
 * @param to  begining in days
 * @returns time in days
 */
function computeDaysStatusDuration(workerProfile: string, status: string, from: number, to: number | null): number {
    if (to === null) {
        to = dateToDay();
    }
    return (to - from);
}



function computeStatusDurationFromJiraStatusTransitionsHistory(sc: Tnt, trans: Tnt) {

    // Name of Column Name (CN) for state transition
    const stDateCN = "TransitionDate";
    const stFromCN = "From";
    const stToCN = "To";
    const stIdCN = "TransitionID";

    const stCNs = ["ID", "Status", stFromCN, stToCN, "Type", stDateCN, stIdCN];

    const stDateIdx = stCNs.indexOf(stDateCN);
    const stToIdx = stCNs.indexOf(stToCN);

    const ssCNs = ["Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider", "Fermée","Error"];


    sc.getColumnValues("ID").forEach((k) => {
        sc.setValues(k.toString(),ssCNs,[0,0,0,0,0,0,0]);
        let scopeTrans: Tnt = trans.filterRowsAndCols(stCNs, k.toString());
        if (scopeTrans.getRowCount() > 0) {
            scopeTrans.orderRowsBy([stDateCN, stIdCN]);
            scopeTrans.forEachRowPair((r0, r1) => {
                let duration = computeDaysStatusDuration("workerProfile",
                    r0[stToIdx].toString(),
                    r0[stDateIdx] as number,
                    (r1 == null) ? null : (r1[stDateIdx] as number));
                sc.addValue(k.toString(), r0[stToIdx].toString(), duration,"Error");
                console.log(`compute time for ${k} for status "${r0[stToIdx]}" from ${r0[stDateIdx]} to ${r1 == null ? "null" : r1[stDateIdx]} = ${Math.floor(duration*24*60)} minutes`);
            });
        }
    });

}


// MAIN ______________________________________________________________________________________

let trans = new Tnt(transitions[0] as string[], "ID");
trans.setWorkSheetData(transitions);

let sc = new Tnt(scope[0] as string[], "ID");
sc.setWorkSheetData(scope);

sc.upsertRowsWithColumns(trans, ["ID", "Status"], "Detected", "Missing");

trans.log();

computeStatusDurationFromJiraStatusTransitionsHistory(sc, trans);

sc.log();

