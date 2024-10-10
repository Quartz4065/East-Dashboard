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

// List of cities that should be highlighted in bright blue (including Parsippany)
const cityNames = [
    "Indianapolis", "Detroit", "Nashville", "Dublin", "Wellesley", 
    "Philadelphia", "Pittsburgh", "Chevy Chase", "Alexandria", 
    "Baltimore", "Westbury", "Parsippany"
];

// Important keywords for the "Daily Data" tab that should be in yellow
const dailyDataTerms = [
    "Daily Sets", "Sets Needed", "Next Days Needed", "On Calendar", 
    "Sets", "Answers", "5-Minute Answer Rate", "Set Rate", "Calls", 
    "Productivity", "Framework", "Total On Calendar", "Needed"
];

// Person names that need to be in silver (Shannon McCool as well)
const personNames = ["Shannon McCool"];

// Function to check if a value is a city name
function isCity(value) {
    return cityNames.includes(value);
}

// Function to check if a value is a person's name (capitalized names, including Shannon McCool)
function isPersonName(value) {
    return personNames.includes(value) || /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

// Function to check if a value is a numerical value or includes special symbols that should be in green
function isNumericOrSpecial(value) {
    return !isNaN(parseFloat(value)) || /[£\/!%]/.test(value);
}

// Function to check if a value should be yellow on the "Daily Data" tab
function isDailyDataTerm(value) {
    return dailyDataTerms.some(term => value.toLowerCase().includes(term.toLowerCase()));
}

// Function to check if a value is a date (basic format check for date-like strings)
function isDate(value) {
    // Basic check to match common date patterns (e.g., MM/DD/YYYY or DD/MM/YYYY)
    return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value);
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

// Function to safely convert sheet names to valid CSS selectors
function makeValidSelector(sheetName) {
    return CSS.escape(sheetName.replace(/\s+/g, '-')); // Replace spaces with hyphens and escape special characters
}

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const validSelector = makeValidSelector(sheetName);
    const contentDiv = document.querySelector(`#${validSelector} .panel`);
    
    // Check if the contentDiv exists before proceeding
    if (!contentDiv) {
        console.error(`Accordion panel for ${sheetName} not found.`);
        return;
    }

    const table = contentDiv.querySelector('table');
    
    // Check if the table exists inside the panel
    if (!table) {
        console.error(`Table for ${sheetName} not found inside the panel.`);
        return;
    }

    table.innerHTML = ''; // Clear existing data

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            // Apply colors based on the content
            if (rowIndex === 0) {
                cellElement.style.color = 'yellow'; // Header text in yellow
            } else if (isCity(cellData)) {
                cellElement.style.color = '#00BFFF'; // City names in bright blue
            } else if (isPersonName(cellData)) {
                cellElement.style.color = 'silver'; // Shannon McCool and other person names in silver
            } else if (isDate(cellData)) {
                cellElement.style.color = 'white'; // Dates in white
            } else if (isNumericOrSpecial(cellData)) {
                cellElement.style.color = 'green'; // Numbers, percentages, or special symbols in green
            } else if (sheetName === "Daily" && isDailyDataTerm(cellData)) {
                cellElement.style.color = 'yellow'; // Important "Daily Data" terms in yellow
            } else {
                cellElement.style.color = 'yellow'; // Default text in yellow (for labels)
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });
}

// Function to create an accordion-style section initially
function createAccordionSection(sheetName, data) {
    const validSelector = makeValidSelector(sheetName);
    const container = document.createElement('div');
    container.id = validSelector; // Set unique ID for each accordion section

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
