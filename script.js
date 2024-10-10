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

// Function to check if a value is numeric
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
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

// Function to apply color based on percentage rules and trigger name change to red if conditions are met
function applyPercentageColor(cellText, term, nameCell) {
    const percentageValue = parseFloat(cellText.replace('%', ''));
    let color = 'white'; // Default color for percentages and names

    if (term === "5-Minute Answer Rate") {
        if (percentageValue < 10) {
            nameCell.style.color = 'red'; // Turn person's name red if below 10%
            color = 'red'; // Bright red for percentage
        } else if (percentageValue > 20) {
            color = '#00FF00'; // Bright green if above 20%
        }
    }

    if (term === "Set Rate") {
        if (percentageValue < 25) {
            nameCell.style.color = 'red'; // Turn person's name red if below 25%
            color = 'red'; // Bright red for percentage
        } else if (percentageValue > 45) {
            color = '#00FF00'; // Bright green if above 45%
        }
    }

    return color; // Return the calculated color
}

// Function to update the content of an accordion section
function updateAccordionContent(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName); // Sanitize the selector
    const contentDiv = document.querySelector(`#${validSelector} .panel`);
    
    if (!contentDiv) {
        console.error(`Accordion panel for ${sheetName} not found.`);
        return;
    }

    const table = contentDiv.querySelector('table');
    
    if (!table) {
        console.error(`Table for ${sheetName} not found inside the panel.`);
        return;
    }

    table.innerHTML = ''; // Clear existing data

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach((cellData, cellIndex) => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            if (rowIndex === 0) {
                // Header row (labels should be yellow)
                cellElement.style.color = 'yellow';
            } else {
                const isNameCell = (cellIndex === 0);
                const isPercentage = cellData.includes('%');
                
                // Handle the name cell (default to white)
                if (isNameCell) {
                    cellElement.style.color = 'white';
                }

                if (isPercentage) {
                    // If it's a percentage, apply the color logic based on thresholds
                    const nameCell = rowElement.children[0]; // The name cell is the first in the row

                    if (row.includes("5-Minute Answer Rate")) {
                        cellElement.style.color = applyPercentageColor(cellData, "5-Minute Answer Rate", nameCell);
                    } else if (row.includes("Set Rate")) {
                        cellElement.style.color = applyPercentageColor(cellData, "Set Rate", nameCell);
                    } else {
                        cellElement.style.color = 'white'; // Default to white if no special condition applies
                    }
                } else if (isNumeric(cellData)) {
                    // Numbers should be white
                    cellElement.style.color = 'white';
                } else {
                    // Default text should be yellow
                    cellElement.style.color = 'yellow';
                }
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });
}

// Function to create an accordion-style section
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
