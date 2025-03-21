const animalList = [
    { name: "Lion", type: "Mammals" },
    { name: "Elephant", type: "Mammals" },
    { name: "Giraffe", type: "Mammals" },
    { name: "Tiger", type: "Mammals" },
    { name: "Kangaroo", type: "Mammals" },
    { name: "Panda", type: "Mammals" },
    { name: "Dolphin", type: "Mammals" },
    { name: "Koala", type: "Mammals" },
    { name: "Penguin", type: "Birds" },
    { name: "Zebra", type: "Chordates" },
    { name: "Unknown" } // Animal with unknown type
];

const animalsByType = animalList.reduce((acc, animal) => {
    const type = animal.type || "Unknown";
    if (!acc[type]) {
        acc[type] = [];
    }
    acc[type].push(animal.name);
    return acc;
}, {});

function displayAnimalByType(type) {
    const animals = animalsByType[type] || [];
    const unknownAnimals = animalsByType["Unknown"] || [];
    const allAnimals = animals.concat(unknownAnimals);

    if (allAnimals.length > 0) {
        console.log(`${type}:`);
        allAnimals.forEach(animal => console.log(`  - ${animal}`));
    } else {
        console.log(`No animals found for type: ${type}`);
    }
}

// Example usage
displayAnimalByType("Mammals");
displayAnimalByType("Birds");
displayAnimalByType("Reptiles");