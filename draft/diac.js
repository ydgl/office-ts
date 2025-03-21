let a =  "WA - Repères : Travailler à l'étranger : les bons réflexes"
.toLowerCase()
.normalize("NFD") // Décompose les caractères en base + diacritiques
.replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
.replace(/[^a-z0-9]+/g, '_') // Remplace tout caractère non alphanumérique par _
.replace(/(^_+)|(_+$)/g, ''); // Supprime les underscores en début et fin
console.log("'"+a+"'");