let currentPage = 1;

document.getElementById('searchButton').addEventListener('click', searchCharacter);
document.getElementById('filterButton').addEventListener('click', filterCharacters);
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchCharactersWithFetch();
    }
});
document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    fetchCharactersWithFetch();
});
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('characterModal').style.display = 'none';
});

// Event listeners para cargar personajes con fetch y async/await
document.getElementById('loadCharactersFetch').addEventListener('click', fetchCharactersWithFetch);
document.getElementById('loadCharactersAsync').addEventListener('click', fetchCharactersWithAsync);

function fetchCharactersWithFetch() {
    fetch(`https://rickandmortyapi.com/api/character?page=${currentPage}`)
        .then(response => response.json())
        .then(data => {
            displayCharacters(data.results);
            checkPagination(data.info.pages);
        })
        .catch(error => console.error('Error fetching characters:', error));
}

async function fetchCharactersWithAsync() {
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character?page=${currentPage}`);
        const data = await response.json();
        displayCharacters(data.results);
        checkPagination(data.info.pages);
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
}

function displayCharacters(characters) {
    const container = document.getElementById('characterContainer');
    container.innerHTML = ''; // Limpiar el contenedor antes de cargar nuevos personajes

    characters.forEach(character => {
        const characterDiv = document.createElement('div');
        characterDiv.classList.add('character');
        characterDiv.addEventListener('click', () => showCharacterDetails(character));

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

function checkPagination(totalPages) {
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function searchCharacter() {
    const query = document.getElementById('searchInput').value;
    if (query) {
        fetch(`https://rickandmortyapi.com/api/character/?name=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    displayCharacters(data.results);
                } else {
                    alert('Character not found');
                }
            })
            .catch(error => console.error('Error fetching character:', error));
    }
}

function filterCharacters() {
    const status = document.getElementById('statusFilter').value;
    const url = status ? `https://rickandmortyapi.com/api/character/?status=${status}` : 'https://rickandmortyapi.com/api/character';

    fetch(url)
        .then(response => response.json())
        .then(data => displayCharacters(data.results))
        .catch(error => console.error('Error fetching filtered characters:', error));
}

function showCharacterDetails(character) {
    document.getElementById('modalName').textContent = character.name;
    document.getElementById('modalDetails').textContent = `Status: ${character.status}\nSpecies: ${character.species}\nGender: ${character.gender}`;
    document.getElementById('characterModal').style.display = 'flex';
}