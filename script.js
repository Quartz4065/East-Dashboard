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

// Function to apply percentage and value-based color logic for multiple columns
function applyColumnColorLogic(cellText, term, nameCell, cityCell, cityGroup = []) {
    let color = 'white';  // Default color for all columns
    const value = parseFloat(cellText.replace('%', '').replace(/,/g, ''));  // Remove % and commas

    if (term === "5-Minute Answer Rate") {
        if (value < 5) {
            color = 'red';
            nameCell.style.color = 'red';  // Turn the name red
            cityCell.style.color = 'red';  // Turn the city red
        } else if (value >= 5 && value < 10) {
            color = 'white';  // Keep percentage white between 5% and 9.99%
        } else if (value >= 10) {
            color = '#00FF00';  // Turn green if 10% or more
        }
    }

    if (term === "Set Rate") {
        if (value < 25) {
            color = 'red';  // Below 25% turns red
            nameCell.style.color = 'red';  // Turn the name red
            cityCell.style.color = 'red';  // Turn the city red
        } else if (value >= 25 && value < 40) {
            color = 'white';  // Between 25% and 39.99% stays white
        } else if (value >= 40) {
            color = '#00FF00';  // Above 40% turns green
        }
    }

    if (term === "Calls") {
        if (value < 200) {
            color = 'red';  // Below 200 calls turns red
        } else if (value >= 200 && value <= 280) {
            color = 'white';  // Between 200 and 280 stays white
        } else if (value > 280) {
            color = '#00FF00';  // Above 280 calls turns green
        }
    }

    if (term === "Showrate - 3 Day") {
        if (value < 70) {
            color = 'red';  // Below 70% show rate turns red
        } else if (value >= 70) {
            color = '#00FF00';  // 70% or higher turns green
        }
    }

    return color;
}

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName);  // Sanitize the selector
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

    table.innerHTML = '';  // Clear existing data

    const cityGroups = {};  // Track name and city cells by city for group color logic

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        let nameCell;
        let cityCell;

        row.forEach((cellData, cellIndex) => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            if (rowIndex === 0) {
                cellElement.style.color = 'yellow';  // Header row (labels should be yellow)
            } else {
                if (cellIndex === 0) {
                    // Name cell logic
                    nameCell = cellElement;
                    nameCell.style.color = 'white';  // Default ISR names to white
                }

                if (cellIndex === 1) {
                    // City cell logic
                    cityCell = cellElement;
                    cityCell.style.color = 'white';  // Default city names to white

                    const city = cityCell.textContent.trim();
                    if (!cityGroups[city]) {
                        cityGroups[city] = [];
                    }
                    cityGroups[city].push(nameCell);
                }

                // Check and apply the color logic for each relevant column
                if (["5-Minute Answer Rate", "Set Rate", "Calls", "Showrate - 3 Day"].includes(row[0])) {
                    const term = row[0];  // The name of the column being processed
                    cellElement.style.color = applyColumnColorLogic(cellData, term, nameCell, cityCell, cityGroups[cityCell.textContent.trim()]);
                } else if (isNumeric(cellData)) {
                    cellElement.style.color = 'white';  // Default white for numeric values
                } else {
                    // Keep "Total" white, regardless of any logic
                    if (cellData.toLowerCase() === 'total') {
                        cellElement.style.color = 'white';
                    } else {
                        cellElement.style.color = 'yellow';  // Default text should be yellow
                    }
                }
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);

        // Add a break after each city group
        if (rowIndex > 0 && row.some(cellData => cellData.toLowerCase() === 'total')) {
            const breakRow = document.createElement('tr');
            breakRow.style.height = '10px'; // Create a visual gap
            table.appendChild(breakRow);
        }
    });
}

// Function to create an accordion-style section initially
function createAccordionSection(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName);  // Sanitize the sheet name for use in the ID
    const container = document.createElement('div');
    container.id = validSelector;

    const button = document.createElement('button');
    button.classList.add('accordion');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('panel');

    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('scroll-container');

    const table = document.createElement('table');
    table.classList.add('data-table');

    scrollContainer.appendChild(table);
    content.appendChild(scrollContainer);
    container.appendChild(button);
    container.appendChild(content);
    document.getElementById('data-container').appendChild(container);

    updateAccordionContent(sheetName, data);  // Fill the table with data

    button.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.style.display

 = panel.style.display === 'block' ? 'none' : 'block';
    });
}

// Function to load data for all sheets initially
async function loadAllSheetsData() {
    document.getElementById('data-container').innerHTML = '';  // Clear existing data
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName);
        createAccordionSection(sheetName, sheetData);  // Create accordion sections initially
    }
}

// Function to update data for all sheets without reloading the whole structure
async function updateAllSheetsData() {
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName);
        updateAccordionContent(sheetName, sheetData);  // Update only the content
    }
}

// Set up auto-fetching every two minutes, updating the content only
function autoFetchData() {
    loadAllSheetsData();  // Initial load
    setInterval(updateAllSheetsData, 120000);  // Update every 2 minutes
}

// Load data when the page loads
window.onload = autoFetchData;
