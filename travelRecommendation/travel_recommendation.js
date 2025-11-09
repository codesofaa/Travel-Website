// --- Global Data Storage and DOM Elements ---
let travelData = {};
const resultsContainer = document.querySelector('.results-container'); // You'll need to add this class/div to your HTML

// --- Utility Function to Render Cards ---

function displayRecommendations(results) {
    if (resultsContainer) {
        resultsContainer.innerHTML = ''; // Clear previous results

        results.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('recommendation-card');

            // Determine image URL and description based on structure (countries have nested cities)
            let name, imageUrl, description;

            if (item.cities) { // Handle Country objects
                // Display the two cities for the selected country
                item.cities.forEach(city => {
                    const cityCard = document.createElement('div');
                    cityCard.classList.add('city-card');
                    
                    cityCard.innerHTML = `
                        <img src="${city.imageUrl}" alt="${city.name}">
                        <h3>${city.name}</h3>
                        <p>${city.description}</p>
                        <button class="visit-btn">Visit</button>
                    `;
                    resultsContainer.appendChild(cityCard);
                });
                return; // Skip the rest of the loop for the country object itself
                
            } else { // Handle Temple and Beach objects
                name = item.name;
                imageUrl = item.imageUrl;
                description = item.description;

                card.innerHTML = `
                    <img src="${imageUrl}" alt="${name}">
                    <h3>${name}</h3>
                    <p>${description}</p>
                    <button class="visit-btn">Visit</button>
                `;
                resultsContainer.appendChild(card);
            }
        });

        // Display a message if no results are found
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No destinations found. Try searching for a Country, Temple, or Beach!</p>';
        }
    }
}

// --- Search and Filter Logic ---

function searchRecommendations() {
    const searchInput = document.querySelector('.searchBar input').value.toLowerCase().trim();
    const results = [];

    if (!searchInput) {
        // Clear results if search input is empty
        displayRecommendations([]);
        return;
    }

    // Function to check if a search input matches a name/keyword
    const isMatch = (text) => text.toLowerCase().includes(searchInput);

    // 1. Check Countries
    travelData.countries.forEach(country => {
        if (isMatch(country.name)) {
            results.push(country);
        } else {
            // Check nested cities within countries
            country.cities.forEach(city => {
                if (isMatch(city.name)) {
                    // Push the parent country to display both cities
                    if (!results.includes(country)) { 
                        results.push(country);
                    }
                }
            });
        }
    });

    // 2. Check Temples
    travelData.temples.forEach(temple => {
        if (isMatch(temple.name) || searchInput.includes('temple')) {
            results.push(temple);
        }
    });

    // 3. Check Beaches
    travelData.beaches.forEach(beach => {
        if (isMatch(beach.name) || searchInput.includes('beach')) {
            results.push(beach);
        }
    });

    // Display the filtered results
    displayRecommendations(results);
}


// --- Data Fetching and Initialization ---

function fetchTravelData() {
    fetch('./travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            travelData = data; // Store data globally
            console.log('Data loaded successfully:', travelData);
        })
        .catch(error => {
            console.error('Error loading travel data:', error);
            if (resultsContainer) {
                resultsContainer.innerHTML = '<p class="error-message">Could not load travel data. Please check the JSON file path.</p>';
            }
        });
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    fetchTravelData();

    // Attach listener to the Search Button
    const searchBtn = document.querySelector('.searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchRecommendations);
    }

    // Attach listener to the Clear Button
    const clearBtn = document.querySelector('.clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelector('.searchBar input').value = '';
            displayRecommendations([]); // Clear the displayed results
        });
    }
});