import { utcDateToLocalDays, localDaysToUTCDate, localDaysToLocalHoursString, Tnt, roundDaysToMinute } from './tnt.js';

const log = { detailedTimeCalc : false };

// Date are in UTC because they are stored in UTC, if the data set is defined in another timezone, we need to convert them to UTC
const transitions = [
    ["ID", "Status", "From", "To", "Type", "TransitionDate", "TransitionID", "RandomBoolean"],
    // AD-10b: Chronological Flow multiple work within several single day - timezone France 2023-01-01T08:00:00Z = 2023-01-01T09:00:00+01:00
    // Note 01/01/2023 is a sunday
    ["AD-10b", "Fermée", "Open", "Conception Fonctionnelle", "Story", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 1001, Math.random() < 0.5],
    ["AD-10b", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-02T08:00:00Z")).toString(), 1002, Math.random() < 0.5],
    ["AD-10b", "Fermée", "À réaliser", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-03T10:00:00Z")).toString(), 1003, Math.random() < 0.5],
    ["AD-10b", "Fermée", "Réalisation en cours", "Réalisée", "Story", utcDateToLocalDays(new Date("2023-01-03T17:00:00Z")).toString(), 1004, Math.random() < 0.5],
    ["AD-10b", "Fermée", "Réalisée", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-04T15:00:00Z")).toString(), 1003, Math.random() < 0.5],
    ["AD-10b", "Fermée", "Réalisation en cours", "Réalisée", "Story", utcDateToLocalDays(new Date("2023-01-04T15:30:00Z")).toString(), 1003, Math.random() < 0.5],
    ["AD-10b", "Fermée", "Réalisée", "Fermée", "Story", utcDateToLocalDays(new Date("2023-01-05T08:00:00Z")).toString(), 1005, Math.random() < 0.5],

    // AD-101: Chronological Flow
    ["AD-101", "Fermée", "Open", "Conception Fonctionnelle", "Story", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 1001, Math.random() < 0.5],
    ["AD-101", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-02T08:00:00Z")).toString(), 1002, Math.random() < 0.5],
    ["AD-101", "Fermée", "À réaliser", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-03T08:00:00Z")).toString(), 1003, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisation en cours", "Réalisée", "Story", utcDateToLocalDays(new Date("2023-01-04T08:00:00Z")).toString(), 1004, Math.random() < 0.5],
    ["AD-101", "Fermée", "Réalisée", "Fermée", "Story", utcDateToLocalDays(new Date("2023-01-05T08:00:00Z")).toString(), 1005, Math.random() < 0.5],


    // AD-102: Transition Flow (deux passage par "Réalisation en cours")
    ["AD-102", "Fermée", "Open", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 2001, Math.random() < 0.5],
    ["AD-102", "Fermée", "À réaliser", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-02T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisation en cours", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-03T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "À réaliser", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-04T08:00:00Z")).toString(), 2002, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisée", "À valider", "Story", utcDateToLocalDays(new Date("2023-01-06T08:00:00Z")).toString(), 2004, Math.random() < 0.5],
    ["AD-102", "Fermée", "Réalisation en cours", "Réalisée", "Story", utcDateToLocalDays(new Date("2023-01-05T08:00:00Z")).toString(), 2003, Math.random() < 0.5],
    ["AD-102", "Fermée", "À valider", "Fermée", "Story", utcDateToLocalDays(new Date("2023-01-07T08:00:00Z")).toString(), 2005, Math.random() < 0.5],

    // AD-103: Loops and Duplicates
    ["AD-103", "Fermée", "Open", "Conception Fonctionnelle", "Story", utcDateToLocalDays(new Date("2023-01-01T08:00:00Z")).toString(), 3001, Math.random() < 0.5],
    ["AD-103", "Fermée", "Conception Fonctionnelle", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-02T08:00:00Z")).toString(), 3002, Math.random() < 0.5],
    ["AD-103", "Fermée", "À réaliser", "Réalisation en cours", "Story", utcDateToLocalDays(new Date("2023-01-03T08:00:00Z")).toString(), 3003, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisation en cours", "À réaliser", "Story", utcDateToLocalDays(new Date("2023-01-04T08:00:00Z")).toString(), 3004, Math.random() < 0.5], // Loop Transition
    ["AD-103", "Fermée", "Réalisation en cours", "Réalisée", "Story", utcDateToLocalDays(new Date("2023-01-05T08:00:00Z")).toString(), 3005, Math.random() < 0.5],
    ["AD-103", "Fermée", "Réalisée", "Fermé-eer", "Story", utcDateToLocalDays(new Date("2023-01-06T08:00:00Z")).toString(), 3006, Math.random() < 0.5],
];

const scope = [
    ["ID", "Status", "Detected", "Missing", "Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider", "Fermée", "Error"],
    ["AD-10b", "À réaliser", 45667.66, "", 10, 0, 0, 0, 0, 0],
    ["AD-101", "À réaliser", 45667.66, "", 10, 0, 0, 0, 0, 0],
    ["AD-102", "Open", 45667.66, "", 0, 0, 10, 0, 0, 0],
    ["AD-miss", "Open", 45667.66, "", 0, 0, 10, 0, 0, 0],
];

// expected result, "Conception Fonctionnelle" occurs on sunday ==> 0 days
const expect = [
    ["ID", "Status", "Detected", "Missing", "Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider", "Fermée", "Error"],
    ["AD-10b", "À réaliser", 45667.66, "",   0,             0.3229166666666667,  0.2604166666666667, 0.23958333333333331,    0,   0,        0],
];


/**
 * Compute the number of days spent in a status providing the start and end in days
 * days are floating point numbers, 1 = 1 day
 * @param workerProfile name of worker
 * @param status status of the task
 * @param from beginning of work in days in UTC
 * @param to end of work in days in UTC
 * @returns duration in days
 */
function computeDaysStatusDuration(workerProfile: { min: number; stdMin: number; lunchMin: number; lunchMax: number; stdMax: number; max: number; isWorkingWeekend : boolean;},
    status: string, from: number, to: number): number {
    /**
     * Worker profile is expressed relatively to the user timezone (for instance lunch is at 12:30)
     * Hence, we need to convert "from" and "to" to local time to ease duration computation (and duration does not rely on timezone)
     * In case of time saving, these time shiftings occurs at night (during time off) and are not taken into account
     */

    if (log.detailedTimeCalc)
        console.log(`computeDaysStatusDuration "${status}" from ${localDaysToUTCDate(from)} to ${localDaysToUTCDate(to)}`);


    let w = 0;
    const startDay = Math.floor(from);
    const endDay = Math.floor(to);

    if (startDay === endDay) {
        w = computeWorkDurationInDay(from, to, startDay, workerProfile);
    } else {
        for (let currDay = startDay; currDay <= endDay; currDay++) {
            let nextDay = currDay + 1;
            if (currDay === endDay) nextDay = to;

            w += computeWorkDurationInDay(from, nextDay, currDay, workerProfile);

            from = nextDay;
        }

    }

    return (w);
}

/**
 * Compute work duration in one day, all days are in local time
 * @param from begin of work for day (unit is local days)
 * @param to end of work for day
 * @param dayStart begin of day within which work is done
 * @param workerProfile profile of worker
 * @returns work duration with a précision of 0.0001 (1 minutes)
 */
function computeWorkDurationInDay(from: number, to: number, dayStart: number, workerProfile: { min: number; stdMin: number; lunchMin: number; lunchMax: number; stdMax: number; max: number; isWorkingWeekend : boolean;}): number {
    const noon = (workerProfile.lunchMax + workerProfile.lunchMin) / 2;
    const fullLunchDuration = roundDaysToMinute(workerProfile.lunchMax - workerProfile.lunchMin);
    const stdDayDuration = workerProfile.stdMax - workerProfile.stdMin - fullLunchDuration;
    let w = 0;

    if (to - from >= 1) return stdDayDuration;

    // 30/12/1899 is saturday ==> days % 7 = 0 for saturdays and 1 for sundays
    if (!workerProfile.isWorkingWeekend && (dayStart % 7 < 2)) return 0;

    if (log.detailedTimeCalc)
        process.stdout.write(`  dayStart ${localDaysToUTCDate(dayStart).toLocaleDateString()} from ${localDaysToUTCDate(from).toLocaleTimeString()} to ${localDaysToUTCDate(to).toLocaleTimeString()}  > `);

    to -= dayStart;
    from -= dayStart;

    /**
     * Correct from and to
     * "from" or "to" may have been forgotten by the user, we set them to the "standard" time
     * if "from" is 00:00 we consider that the worker starts at the beginning of the day
     * if "from" is earlier than the worker's standard time, we consider that the worker started ealier
     * in other cases, we consider that the worker started at "from"
     * the same applies to "to"
     */
    if (from === 0) {
        from = workerProfile.stdMin;
    } else {
        if (from < workerProfile.min) {
            from = workerProfile.min;
        }
    }

    if (to === 1) {
        to = workerProfile.stdMax;
    } else {
        if (to > workerProfile.max) {
            to = workerProfile.max;
        }
    }

    if (log.detailedTimeCalc)
        process.stdout.write(`fixed from ${localDaysToLocalHoursString(from)} to ${localDaysToLocalHoursString(to)} > `);

    // Compute work duration
    w = to - from;

    if (log.detailedTimeCalc)
        process.stdout.write(`w=${localDaysToLocalHoursString(w)} > `);

    // Evaluate and retrieve lunch time
    if (from < workerProfile.lunchMin && to > workerProfile.lunchMax) {
        if (log.detailedTimeCalc)
            process.stdout.write(`full lunch ${localDaysToLocalHoursString(fullLunchDuration)} > `);
        w -= fullLunchDuration;
    } else if ((from < noon && to > workerProfile.lunchMax) || (from < workerProfile.lunchMin && to > noon)) {
        if (log)
            process.stdout.write(`half lunch ${localDaysToLocalHoursString(fullLunchDuration / 2)} > `);
        w -= fullLunchDuration / 2;
    }

    // ajusting "from" or "to" to standard time or min/max of worker profile produces sometimes negative values
    if (w < 0) w = 0;

    // apply productivity worker ratio
    //w *= 0.8;

    w = roundDaysToMinute(w);

    if (log.detailedTimeCalc)
        process.stdout.write(`final w=${localDaysToLocalHoursString(w)}\n`);

    return w;
}




/**
 * Compute the number of days between two dates, 1 = 1 day
 * @param workerProfile name of worker
 * @param status status of the task
 * @param from beginning in days
 * @param to  begining in days
 * @returns time in days
 */
function computeDaysStatusDuration_old(workerProfile: string, status: string, from: number, to: number | null): number {
    if (to === null) {
        to = utcDateToLocalDays(new Date(Date.now()));
    }

    return (to - from);
}

const myWorkerProfile = { name: "me", 
                          min: roundDaysToMinute(9.5/24), 
                          stdMin: roundDaysToMinute(10/24), 
                          lunchMin: roundDaysToMinute(12.5/24), 
                          lunchMax: roundDaysToMinute(13.75/24), 
                          stdMax: roundDaysToMinute(17.5/24), 
                          max: roundDaysToMinute(18.5/24), 
                          isWorkingWeekend: false};


function computeStatusDurationFromJiraStatusTransitionsHistory(sc: Tnt, trans: Tnt) {

    // Name of Column Name (CN) for state transition
    const stDateCN = "TransitionDate";
    const stFromCN = "From";
    const stToCN = "To";
    const stIdCN = "TransitionID";

    const stCNs = ["ID", "Status", stFromCN, stToCN, "Type", stDateCN, stIdCN];

    const stDateIdx = stCNs.indexOf(stDateCN);
    const stToIdx = stCNs.indexOf(stToCN);

    const ssCNs = ["Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider", "Fermée", "Error"];

    // today in days
    const todayDays = utcDateToLocalDays(new Date(Date.now()));


    sc.getColumnValues("ID").forEach((k) => {
        sc.setValues(k.toString(), ssCNs, [0, 0, 0, 0, 0, 0, 0]);
        let scopeTrans: Tnt = trans.filterRowsAndCols(stCNs, k.toString());
        if (scopeTrans.getRowCount() > 0) {
            scopeTrans.orderRowsBy([stDateCN, stIdCN]);
            scopeTrans.forEachRowPair((r0, r1) => {
                let from = Number(r0[stDateIdx]);
                let to = (r1 == null ? todayDays : Number(r1[stDateIdx]));
                let duration = computeDaysStatusDuration(myWorkerProfile,
                    r0[stToIdx].toString(),
                    from,
                    to);
                sc.addValue(k.toString(), r0[stToIdx].toString(), duration, "Error");
                console.log(`compute time for ${k} for status "${r0[stToIdx]}" from ${localDaysToUTCDate(from)} (${from}) to ${localDaysToUTCDate(to)} (${to}) = ${Math.floor(duration * 24 * 60)} minutes (${duration} days )`);
            });
        }
    });

}


// MAIN ______________________________________________________________________________________

function test_daysToDate() {
    // UTC test
    console.log("UTC test");
    let dUTC = new Date(Date.UTC(2021, 7, 1, 10, 30, 0));
    console.log(dUTC);

    let nUTC = utcDateToLocalDays(dUTC);
    console.log(nUTC);

    let d2UTC = localDaysToUTCDate(nUTC);
    console.log(d2UTC);

    // Locale date test 1/08/2021 15:30 FR = 44409,646 jour excel local FR
    console.log("\nLocale date test");
    let dLocale = new Date(2021, 7, 1, 15, 30, 0);
    console.log(dLocale);

    let nLocale = utcDateToLocalDays(dLocale);
    console.log(nLocale);
    console.log("excel for 01/08/2021 15:30 FR = 44409,646");
    let d2Locale = localDaysToUTCDate(nLocale);
    console.log(d2Locale.toString());

    // test 3
    console.log("\nTest 3");
    let d3 = 44409.646;
    let d3Date = localDaysToUTCDate(d3);
    console.log(d3Date);
    console.log(d3Date.toString());
    
    // test 4
    console.log("\nTest 4");
    let s4Local = "1900-01-01T00:00:00";
    let d4 = new Date(s4Local);
    let n4 = utcDateToLocalDays(d4);
    console.log(`${s4Local} gives ${n4} (=1 is ok)`); 

    // test 5
    console.log("\nTest 5");
    let n5 = 0.28130000000000005;
    console.log(`${n5} =  ${localDaysToLocalHoursString(n5)} / rounded ${roundDaysToMinute(n5)} = ${localDaysToLocalHoursString(roundDaysToMinute(n5))} `);

    n5 = 0.2813;
    console.log(`${n5} =  ${localDaysToLocalHoursString(n5)} / rounded ${roundDaysToMinute(n5)} = ${localDaysToLocalHoursString(roundDaysToMinute(n5))} `);


    n5 = 10 + (6 * 60 + 45) / 1440;
    let d = localDaysToUTCDate(n5);
    console.log(d);
    console.log(`${n5} =  ${localDaysToLocalHoursString(n5)} / rounded ${roundDaysToMinute(n5)} = ${localDaysToLocalHoursString(roundDaysToMinute(n5))} `);

    let dr = new Date(1899, 11, 30, 0 , 0 ,0, 0);
    console.log(dr.toString());
    dr.setTime(dr.getTime()+(n5 * 24 * 60 * 60 * 1000));
    console.log(dr);
}



function test_Tnt() {
    let trans = new Tnt(transitions[0] as string[], "ID");
    trans.setWorkSheetData(transitions);

    let sc = new Tnt(scope[0] as string[], "ID");
    sc.setWorkSheetData(scope);

    sc.upsertRowsWithColumns(trans, ["ID", "Status"], "Detected", "Missing");

    //trans.log();
    computeStatusDurationFromJiraStatusTransitionsHistory(sc, trans);

    //sc.log();
    let expectedSc = new Tnt(scope[0] as string[], "ID");
    expectedSc.setWorkSheetData(expect);

    let testFail = sc.diffValueOnKey("AD-10b", expectedSc, ["Conception Fonctionnelle", "À réaliser", "Réalisation en cours", "Réalisée", "À valider"]);
    console.log(`Test OK: ${!testFail}`);
}

//test_daysToDate();

test_Tnt();
