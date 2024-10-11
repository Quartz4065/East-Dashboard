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

// Function to apply percentage color logic
function applyPercentageColor(value, metricType) {
    let color = 'white';  // Default color

    if (metricType === "5-Minute Answer Rate") {
        if (value < 5) {
            color = 'red';
        } else if (value >= 10) {
            color = 'green';
        }
    }

    return color;
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

// Function to dynamically build the table
function buildTable(sheetName, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    // Build the header
    const headerRow = document.createElement('tr');
    const headers = ["City", "ISR", "5-Minute Answer Rate", "Set Rate", "Calls", "Show Rate"];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Build the data rows
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        row.forEach((cellData, cellIndex) => {
            const td = document.createElement('td');
            td.textContent = cellData;

            // Apply color logic to the 5-Minute Answer Rate column (index 2)
            if (cellIndex === 2) {
                const value = parseFloat(cellData.replace('%', ''));
                td.style.color = applyPercentageColor(value, "5-Minute Answer Rate");
            }

            tr.appendChild(td);
        });

        table.appendChild(tr);

        // Add a break after each city group
        if (rowIndex < data.length - 1 && row[0] !== data[rowIndex + 1][0]) {
            const spacer = document.createElement('tr');
            const spacerCell = document.createElement('td');
            spacerCell.colSpan = headers.length;
            spacerCell.style.height = '10px';
            spacer.appendChild(spacerCell);
            table.appendChild(spacer);
        }
    });

    return table;
}

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName);  // Sanitize the selector
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

    table.innerHTML = '';  // Clear existing data

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
                    cellElement.style.color = 'white';  // Default ISR names to white
                }

                if (isPercentage) {
                    // If it's a percentage, apply the color logic based on thresholds
                    const nameCell = rowElement.children[0];  // The name cell is the first in the row

                    if (row.includes("5-Minute Answer Rate")) {
                        cellElement.style.color = applyPercentageColor(cellData, "5-Minute Answer Rate", nameCell);
                    } else {
                        cellElement.style.color = 'white';  // Default to white if no special condition applies
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

// Function to create an accordion section for each sheet
function createAccordionSection(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName);  // Sanitize the sheet name for use in the ID
    const container = document.createElement('div');
    container.id = validSelector;  // Set unique ID for each accordion section

    const button = document.createElement('button');
    button.classList.add('accordion');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('panel');

    // Create scrollable container for the table
    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('scroll-container');

    // Create the table
    const table = buildTable(sheetName, data);
    scrollContainer.appendChild(table);
    content.appendChild(scrollContainer);
    container.appendChild(button);
    container.appendChild(content);
    document.getElementById('data-container').appendChild(container);

    button.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
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
