// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; 
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; 

// Manually specified list of all sheet names (tabs)
const sheetNames = ["Daily", "Previous Day", "Saturday", "Leaderboard", "Commission", "PIPS and Benching", "Today's No Shows", "Keepy Uppy", "Critical Numbers", "MTD Shows", "Incident Tracker", "Answer Rates"];

// Function to fetch data from a specific sheet (tab)
async function fetchSheetData(sheetName) {
    const encodedSheetName = encodeURIComponent(sheetName); 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${sheetName}: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Fetched data from ${sheetName}:`, data);  // Log fetched data for debugging
        return data.values || [];
    } catch (error) {
        console.error(`Error fetching data from ${sheetName}:`, error);
        return [];
    }
}

// Function to apply percentage color logic for "5 Min Answer Rate"
function apply5MinAnswerRateColor(percentage) {
    const value = parseFloat(percentage.replace('%', ''));
    if (value < 5) {
        return 'metric-red';  // Below 5% turns red
    } else if (value > 10) {
        return 'metric-green';  // Above 10% turns green
    } else {
        return 'metric-white';  // Between 5% and 10% stays white
    }
}

// Function to create the dashboard layout dynamically
function createDashboardLayout(data) {
    const dashboardContainer = document.getElementById('dashboard-container');
    dashboardContainer.innerHTML = '';  // Clear existing content

    // Iterate over the data (e.g., center, city, people)
    data.forEach(cityData => {
        const cityCard = document.createElement('div');
        cityCard.classList.add('city-card');

        const cityTitle = document.createElement('h2');
        cityTitle.textContent = cityData.city;  // Assuming data has a "city" field
        cityCard.appendChild(cityTitle);

        // Add people and their data for each city
        cityData.people.forEach(person => {
            const personInfo = document.createElement('div');
            personInfo.classList.add('person-info');

            const personName = document.createElement('div');
            personName.classList.add('person-name');
            personName.textContent = person.name;  // Person's name

            const personMetrics = document.createElement('div');
            personMetrics.classList.add('person-metrics');

            // 5 Min Answer Rate
            const answerRate = document.createElement('div');
            answerRate.classList.add('metric', apply5MinAnswerRateColor(person.answerRate));
            answerRate.textContent = `5 Min Answer Rate: ${person.answerRate}`;

            // Add more metrics if needed (e.g., Set Rate)
            const setRate = document.createElement('div');
            setRate.classList.add('metric', 'metric-white');  // Default is white
            setRate.textContent = `Set Rate: ${person.setRate}`;

            personMetrics.appendChild(answerRate);
            personMetrics.appendChild(setRate);

            personInfo.appendChild(personName);
            personInfo.appendChild(personMetrics);

            cityCard.appendChild(personInfo);
        });

        dashboardContainer.appendChild(cityCard);
    });
}

// Function to load data for all sheets initially
async function loadAllSheetsData() {
    const sheetData = await fetchSheetData('Daily');  // Load data from "Daily" sheet
    const parsedData = parseSheetData(sheetData);  // Parse the sheet data (adjust based on your structure)
    createDashboardLayout(parsedData);  // Populate the dashboard with cards
}

// Example function to parse the sheet data (adjust this based on your actual structure)
function parseSheetData(sheetData) {
    // Assuming the sheetData is structured in rows with city, person, and metrics
    return [
        {
            city: "City A",
            people: [
                { name: "Person 1", answerRate: "4%", setRate: "35%" },
                { name: "Person 2", answerRate: "12%", setRate: "42%" }
            ]
        },
        {
            city: "City B",
            people: [
                { name: "Person 3", answerRate: "6%", setRate: "30%" },
                { name: "Person 4", answerRate: "9%", setRate: "50%" }
            ]
        }
    ];
}

// Load data when the page loads
window.onload = loadAllSheetsData;
