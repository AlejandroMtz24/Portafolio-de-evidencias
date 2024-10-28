document.getElementById('loadCharacters').addEventListener('click', fetchCharacters);

function fetchCharacters() {
    fetch('https://rickandmortyapi.com/api/character')
        .then(response => response.json())
        .then(data => displayCharacters(data.results))
        .catch(error => console.error('Error fetching characters:', error));
}

function displayCharacters(characters) {
    const container = document.getElementById('characterContainer');
    container.innerHTML = ''; // Limpiar el contenedor antes de cargar nuevos personajes

    characters.forEach(character => {
        const characterDiv = document.createElement('div');
        characterDiv.classList.add('character');

        const characterImage = document.createElement('img');
        characterImage.src = character.image;
        characterImage.alt = `${character.name} image`;

        const characterName = document.createElement('h3');
        characterName.textContent = character.name;

        const characterStatus = document.createElement('p');
        characterStatus.textContent = `Status: ${character.status}`;

        characterDiv.appendChild(characterImage);
        characterDiv.appendChild(characterName);
        characterDiv.appendChild(characterStatus);
        container.appendChild(characterDiv);
    });
}