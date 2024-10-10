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

// List of cities that should be highlighted in bright blue
const cityNames = [
    "Indianapolis", "Detroit", "Nashville", "Dublin", "Wellesley", 
    "Philadelphia", "Pittsburgh", "Chevy Chase", "Alexandria", 
    "Baltimore", "Westbury", "Parsippany"
];

// Important keywords for the "Daily Data" tab that should be in yellow (non-numeric)
const dailyDataTerms = [
    "Daily Sets", "Sets Needed", "Next Days Needed", "On Calendar", 
    "Sets", "Answers", "5-Minute Answer Rate", "Set Rate", "Calls", 
    "Productivity", "Framework", "Total On Calendar", "Needed", "ISR", "Main Focus"
];

// Person names that need to be in silver initially
const personNames = ["Shannon McCool"];

// Function to check if a value is a city name
function isCity(value) {
    return cityNames.includes(value);
}

// Function to check if a value is a person's name (capitalized names, including Shannon McCool)
function isPersonName(value) {
    return personNames.includes(value) || /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

// Function to check if a value is a numerical value or includes special symbols that should be in white
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// Function to check if a value should be yellow on the "Daily Data" tab
function isDailyDataTerm(value) {
    return dailyDataTerms.some(term => value.toLowerCase().includes(term.toLowerCase()));
}

// Function to check if a value is a date (basic format check for date-like strings)
function isDate(value) {
    return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value);
}

// Function to apply color based on percentage rules for "5-Minute Answer Rate" and "Set Rate"
// and also trigger the name change to red if the percentage turns red
function applyPercentageColor(cellText, term, nameCell) {
    const percentageValue = parseFloat(cellText.replace('%', ''));
    
    if (term === "5-Minute Answer Rate") {
        if (percentageValue < 10) {
            nameCell.style.color = 'red'; // Turn person's name red if below 10%
            return 'red'; // Bright red for percentage
        } else if (percentageValue > 20) {
            return '#00FF00'; // Bright green if above 20%
        }
    }

    if (term === "Set Rate") {
        if (percentageValue < 25) {
            nameCell.style.color = 'red'; // Turn person's name red if below 25%
            return 'red'; // Bright red for percentage
        } else if (percentageValue > 45) {
            return '#00FF00'; // Bright green if above 45%
        }
    }

    return 'white'; // Default to white for all other numbers
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

// Function to sanitize the sheet name for use in IDs and selectors
function sanitizeSheetName(sheetName) {
    return sheetName.replace(/[^a-zA-Z0-9]/g, '-'); // Replace special characters with hyphens
}

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName); // Sanitize the selector
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

    // Loop through each row and handle colors based on content
    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach((cellData, cellIndex) => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            // If this is the row containing the 5-Min Answer Rate or Set Rate, handle those specially
            if (rowIndex === 0) {
                // Handle header rows (set them yellow)
                cellElement.style.color = 'yellow';
            } else {
                if (cellIndex === 0 && isPersonName(cellData)) {
                    // Person's name column (we will make it red if the percentages nearby are low)
                    cellElement.style.color = 'silver';
                } else if (cellData.includes('%')) {
                    // Percentage column (handle 5-Min Answer Rate and Set Rate)
                    const nameCell = rowElement.children[0]; // Person's name is the first column in the row
                    if (row.includes("5-Minute Answer Rate")) {
                        cellElement.style.color = applyPercentageColor(cellData, "5-Minute Answer Rate", nameCell);
                    } else if (row.includes("Set Rate")) {
                        cellElement.style.color = applyPercentageColor(cellData, "Set Rate", nameCell);
                    }
                } else if (isNumeric(cellData)) {
                    // All other numbers should be white
                    cellElement.style.color = 'white';
                } else if (isDailyDataTerm(cellData)) {
                    // Terms and labels should be yellow
                    cellElement.style.color = 'yellow';
                } else if (isCity(cellData)) {
                    // Cities should be bright blue
                    cellElement.style.color = '#00BFFF';
                } else {
                    // Default text style
                    cellElement.style.color = 'yellow';
                }
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });
}

// Function to create an accordion-style section initially
function createAccordionSection(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName); // Sanitize the sheet name for use in the ID
    const container = document.createElement('div');
    container.id = validSelector; // Set unique ID for each accordion section

    const button = document.createElement('button');
    button.classList.add('accordion');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('panel');

    // Create scrollable container for the table
    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('scroll-container');

    // Create the table
    const table = document.createElement('table');
    table.classList.add('data-table');

    // Append the table to the scrollable container
    scrollContainer.appendChild(table);
    content.appendChild(scrollContainer);
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
