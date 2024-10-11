const API_KEY = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60Y';
const SHEET_ID = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSb_tcnsv5b633i96vxKetuKhtKYtvbQYmfK4N_eW-MOJ2FYeKK0yc5x4ExMGsORA9dzAfCHmnCHHQD/pub?output=csv`;

// Central data pooling function
async function fetchData() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        return data.valueRanges; // Pooled data for all tabs
    } catch (error) {
        console.error("Error fetching data", error);
    }
}

// Function to dynamically render the City data
function renderCityData(cityData) {
    const cityTableBody = document.querySelector('#city-table tbody');
    cityTableBody.innerHTML = '';

    cityData.forEach((row, index) => {
        if (index === 0) return; // Skip the header

        const [city, population, growthRate] = row;

        let growthClass = '';
        if (parseFloat(growthRate) > 5) {
            growthClass = 'high'; // High growth rate
        } else if (parseFloat(growthRate) < 1) {
            growthClass = 'low'; // Low growth rate
        }

        cityTableBody.innerHTML += `
            <tr>
                <td>${city}</td>
                <td>${population}</td>
                <td class="${growthClass}">${growthRate}</td>
            </tr>
        `;
    });
}

// Function to dynamically render the Individual data
function renderIndividualData(individualData) {
    const individualTableBody = document.querySelector('#individual-table tbody');
    individualTableBody.innerHTML = '';

    individualData.forEach((row, index) => {
        if (index === 0) return; // Skip the header

        const [name, age, income] = row;

        let incomeClass = '';
        if (parseFloat(income) > 100000) {
            incomeClass = 'high'; // High income
        } else if (parseFloat(income) < 30000) {
            incomeClass = 'low'; // Low income
        }

        individualTableBody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${age}</td>
                <td class="${incomeClass}">${income}</td>
            </tr>
        `;
    });
}

// Main function to load and display all data
async function loadData() {
    const allData = await fetchData();

    // Assuming the first tab is city data and second tab is individual data
    const cityData = allData[0].values;
    const individualData = allData[1].values;

    renderCityData(cityData);
    renderIndividualData(individualData);
}

// Periodically update the data every 30 seconds
setInterval(loadData, 30000);

// Load data when the page is ready
window.onload = loadData;
