// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; 
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; 

// Manually specified list of all sheet names (tabs)
const sheetNames = [
    "Daily", 
    "Previous Day", 
    "Saturday", 
    "Leaderboard", 
    "Commission", 
    "PIPS and Benching", 
    "Today's No Shows", 
    "Keepy Uppy", 
    "Critical Numbers", 
    "MTD Shows", 
    "Incident Tracker", 
    "Answer Rates"
];

// Function to check if a value is a name (capitalized, not numbers)
function isName(value) {
    return /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

// Function to check if a value contains both wording and numbers
function containsWording(value) {
    return /[A-Za-z]+/.test(value) && /\d+/.test(value) && value !== "#DIV/0!";
}

// Function to fetch data from a specific sheet (tab)
async function fetchSheetData(sheetName) {
    const encodedSheetName = encodeURIComponent(sheetName); 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch data from ${sheetName}:`, response.statusText);
        return [];
    }
    const data = await response.json();
    return data.values || [];
}

// Function to save accordion state (open/closed)
function saveAccordionState() {
    const states = Array.from(document.querySelectorAll('.accordion')).map(btn => btn.classList.contains('active'));
    localStorage.setItem('accordionState', JSON.stringify(states));
}

// Function to restore accordion state (open/closed)
function restoreAccordionState() {
    const states = JSON.parse(localStorage.getItem('accordionState')) || [];
    const buttons = document.querySelectorAll('.accordion');
    states.forEach((state, i) => {
        if (state) {
            buttons[i].classList.add('active');
            buttons[i].nextElementSibling.style.display = 'block';
        }
    });
}

// Function to create an accordion-style section
function createAccordionSection(sheetName, data) {
    const container = document.createElement('div');
    const button = document.createElement('button');
    button.classList.add('accordion');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('panel');

    const table = document.createElement('table');
    table.classList.add('data-table');

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            // Apply colors based on the content
            if (rowIndex === 0) {
                cellElement.style.color = 'white'; // Header in white
            } else if (isName(cellData)) {
                cellElement.style.color = 'orange'; // Names in orange
            } else if (containsWording(cellData) || isNaN(parseFloat(cellData)) && cellData !== "#DIV/0!") {
                cellElement.style.color = 'silver'; // Text (with wording and numbers) in silver
            } else {
                cellElement.style.color = 'green'; // Numbers, percentages, and symbols in green
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });

    content.appendChild(table);
    container.appendChild(button);
    container.appendChild(content);
    document.getElementById('data-container').appendChild(container);

    button.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        saveAccordionState(); // Save state when accordion is toggled
    });
}

// Function to load data for all sheets
async function loadAllSheetsData() {
    document.getElementById('data-container').innerHTML = ''; // Clear existing data
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName);
        createAccordionSection(sheetName, sheetData);
    }
    restoreAccordionState(); // Restore accordion open/close state after loading
}

// Set up auto-fetching every two minutes, preserving the accordion state
function autoFetchData() {
    loadAllSheetsData();
    setInterval(loadAllSheetsData, 120000); // Every 2 minutes
}

// Load data when the page loads
window.onload = autoFetchData;
