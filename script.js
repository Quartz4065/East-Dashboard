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

// Important keywords that should be highlighted in yellow
const importantTerms = [
    "ISR", "5 min answer rate", "STC", 
    "showrate-3 day", "set rate trend -2 day", 
    "on calendar", "Total"
];

// Function to check if a value is a name (capitalized, not numbers)
function isName(value) {
    return /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

// Function to check if a value contains both wording and numbers
function containsWording(value) {
    return /[A-Za-z]+/.test(value) && /\d+/.test(value) && value !== "#DIV/0!";
}

// Function to check if a value contains important terms for yellow highlighting
function isImportantTerm(value) {
    return importantTerms.some(term => value.toLowerCase().includes(term.toLowerCase()));
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

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const contentDiv = document.querySelector(`#${sheetName.replace(/\s+/g, '-')} .panel`);
    const table = contentDiv.querySelector('table');
    table.innerHTML = ''; // Clear existing data

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            // Apply colors based on the content
            if (rowIndex === 0) {
                cellElement.style.color = 'white'; // Header in white
            } else if (isImportantTerm(cellData)) {
                cellElement.style.color = 'yellow'; // Important terms in yellow
            } else if (isName(cellData)) {
                cellElement.style.color = 'silver'; // Names in silver
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
}

// Function to create an accordion-style section initially
function createAccordionSection(sheetName, data) {
    const container = document.createElement('div');
    container.id = sheetName.replace(/\s+/g, '-'); // Unique ID for each accordion section

    const button = document.createElement('button');
    button.classList.add('accordion');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('panel');

    const table = document.createElement('table');
    table.classList.add('data-table');

    content.appendChild(table);
    container.appendChild(button);
    container.appendChild(content);
    document.getElementById('data-container').appendChild(container);

    updateAccordionContent(sheetName, data); // Fill the table with data

    button.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });
}

// Function to load data for all sheets initially
async function loadAllSheetsData() {
    document.getElementById('data-container').innerHTML = ''; // Clear existing data
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName);
        createAccordionSection(sheetName, sheetData); // Create accordion sections initially
    }
}

// Function to update data for all sheets without reloading the whole structure
async function updateAllSheetsData() {
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName);
        updateAccordionContent(sheetName, sheetData); // Update only the content
    }
}

// Set up auto-fetching every two minutes, updating the content only
function autoFetchData() {
    loadAllSheetsData(); // Initial load
    setInterval(updateAllSheetsData, 120000); // Update every 2 minutes
}

// Load data when the page loads
window.onload = autoFetchData;
