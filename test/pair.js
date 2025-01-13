
const staticWordsArray = [
    ["apple",       "banana",       "cherry",       "date",         "elderberry",   "fig",          "grape",        "honeydew",     "kiwi",         "lemon"],
    ["mango",       "nectarine",    "orange",       "papaya",       "quince",       "raspberry",    "strawberry",   "tangerine",    "ugli",         "vanilla"],
    ["apple",       "xigua",        "yellowfruit",  "zucchini",     "apricot",      "blackberry",   "cantaloupe",   "dragonfruit",  "eggplant",     "feijoa"],
    ["guava",       "huckleberry",  "imbe",         "jackfruit",    "kumquat",      "lime",         "mulberry",     "nectar",       "olive",        "peach"],
    ["plum",        "quandong",     "rambutan",     "soursop",      "tamarind",     "ugni",         "voavanga",     "wolfberry",    "ximenia",      "yangmei"],
    ["ziziphus",    "acerola",      "bilberry",     "clementine",   "damson",       "elder",        "fingerlime",   "grapefruit",   "hackberry",    "indianfig"],
    ["apple",       "kiwano",       "lemonadeberry","mangosteen",   "naranjilla",   "oroblanco",    "pitanga",      "quararibea",   "ribes",        "santol"],
    ["mango",       "ugli",         "vaccinium",    "waterapple",   "ximenia",      "yangmei",      "ziziphus",     "ambarella",    "blackcurrant", "cloudberry"],
    ["dewberry",    "emblic",       "feijoa",       "gooseberry",   "honeyberry",   "illawarra",    "jostaberry",   "kiwifruit",    "loganberry",   "medlar"],
    ["apple",       "osageorange",  "pomegranate",  "quince",       "rosehip",      "salak",        "tamarillo",    "ugni",         "voavanga",     "whitecurrant"]
];


function filterAndRestrictColumns(array, filterColumn, filterValue, columnIndexes) {
    return array
        .filter(row => row[filterColumn] === filterValue)
        .map(row => columnIndexes.map(index => row[index]));
}

function forEachPair(array, callback) {
    for (let i = 0; i < array.length; i ++) {
        if (i + 1 < array.length) {
            callback(array[i], array[i + 1]);
        } else {
            callback(array[i], null);
        }
    }
}

function reduceToColumns(array, columns) {
    return array.map(row => columns.map(col => row[col]));
}

forEachPair(staticWordsArray, (row1, row2) => {
    console.log(row1, row2);
});