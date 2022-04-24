//User Id Generator
const generateId = () => {
    
    const lowerCase = createArray(97, 122);
    const upperCase = createArray(65, 90);
    // const symbols = createArray(33, 47).concat(createArray(58, 64)).concat(
    // 91, 96).concat(createArray(123, 126));
    const numbers = createArray(48, 57);

    let id = lowerCase;
    id = id.concat(upperCase);
    id = id.concat(numbers);

    let idCharacters = [];

    for(let i = 0; i < 7; i++){
        let character = id[Math.floor(Math.random(id) * id.length)];
        idCharacters.push(String.fromCharCode(character));
    }
    return idCharacters.join('');
};

function createArray(first, last){
    const array = [];

    for(let i = first; i <= last; i++){
        array.push(i);
    }

    return array;
}

module.exports = generateId;