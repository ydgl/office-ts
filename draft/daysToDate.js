//function daysToDate(days: number): Date {
function localDaysToUTCDate(days) {
    // Date de référence : 30 décembre 1899
    const referenceDate = new Date(Date.UTC(1899, 11, 30));

    // Calculer le nombre de millisecondes correspondant aux jours donnés
    const millisecondsInDay = 24 * 60 * 60 * 1000; // Nombre de millisecondes dans une journée
    const dateInMilliseconds = referenceDate.getTime() + (days * millisecondsInDay);

    // Créer une nouvelle date à partir du nombre de millisecondes
    const resultDate = new Date(dateInMilliseconds);

    // Ajuster pour la timezone locale
    const timezoneOffset = resultDate.getTimezoneOffset() * 60 * 1000; // Décalage en millisecondes
    const localDate = new Date(resultDate.getTime() + timezoneOffset);

    return localDate;
}

function utcDateToLocalDays(date) {
    if (date == null) date = new Date();
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch (December 30, 1899)
    const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

    // Calculate the number of days between the given date and the Excel epoch
    const daysSinceExcelEpoch = Math.floor((date.getTime() - excelEpoch.getTime()) / msPerDay);

    // Add the fractional part for the time of day
    const fractionalDay = (date.getHours() / 24) + (date.getMinutes() / 1440) + (date.getSeconds() / 86400);

    return daysSinceExcelEpoch + fractionalDay;
}

function localDaysToLocalHoursString(days) {
    // Local days to local hours
    let dayFractionSeconds = (days - Math.floor(days)) * 24 * 60 * 60;
    let hours = Math.floor(dayFractionSeconds / (60 * 60));
    let minutes = Math.floor((dayFractionSeconds / 60) % 60);
    let seconds = Math.floor(dayFractionSeconds % 60);

    return `${hours}:${minutes}:${seconds}`;
}


function roundDaysToMinute(days) {
    let r = Math.round(days * 1440) / 1440; 
    //console.log(`roundDaysToMinute ${days} -> ${r}`);
    return r;
}

// UTC test
console.log("UTC test");
let dUTC = new Date(Date.UTC(2021, 7, 1, 10, 30, 0));
console.log(dUTC);

let nUTC = utcDateToLocalDays(dUTC);
console.log(nUTC);

let d2UTC = localDaysToUTCDate(nUTC);
console.log(d2UTC);

// Locale date test 1/08/2021 15:30 FR = 44409,646 jour excel local
console.log("\nLocale date test");
let dLocale = new Date(2021, 7, 1, 15, 30, 0);
console.log(dLocale);

let nLocale = utcDateToLocalDays(dLocale);
console.log(nLocale);
console.log("excel for 01/08/2021 15:30 FR = 44409,646");

let d2Locale = localDaysToUTCDate(nLocale);
console.log(d2Locale);

// duration without seconds
console.log("\nDuration test");
let nWS = 0.28125; // 6h45
console.log(`${nWS} = 6h45:00 and should be display as is`);
console.log(`0.28125 =  ${localDaysToLocalHoursString(nWS)}`);



// test 4 : 1900-01-01T00:00:00 is 1 in excel
console.log("\nTest 4 : 1900-01-01T00:00:00 is 1 in excel");
let s4Local = "1900-01-01T00:00:00";
let d4 = new Date(s4Local);
let n4 = utcDateToLocalDays(d4);
console.log(`${s4Local} gives ${n4} (=1 is ok)`);

// test 5 : rounding to 1 minute
console.log("\nTest 5");
let n5 = 0.28130000000000005;
console.log(`${n5} =  ${localDaysToLocalHoursString(n5)} / rounded ${roundDaysToMinute(n5)} = ${localDaysToLocalHoursString(roundDaysToMinute(n5))} `);




// Exemple d'utilisation
// const jours = 44929.458333333336;
// const dateResultante = daysToDate(jours);
// console.log(`La date correspondant à ${jours} jours est : ${dateResultante.toString()}`);