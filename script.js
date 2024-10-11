// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; 
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; 

// Manually specified list of all sheet names (tabs)
const sheetNames = ["Daily", "Previous Day", "Saturday", "Leaderboard", "Commission", "PIPS and Benching", "Today's No Shows", "Keepy Uppy", "Critical Numbers", "MTD Shows", "Incident Tracker", "Answer Rates"];

// Function to check if a value is numeric
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

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

// Function to sanitize the sheet name for use in IDs and selectors
function sanitizeSheetName(sheetName) {
    return sheetName.replace(/[^a-zA-Z0-9]/g, '-'); // Replace special characters with hyphens
}

// Function to apply percentage color logic for "5 Min Answer Rate"
function apply5MinAnswerRateColor(cellText) {
    const percentageValue = parseFloat(cellText.replace('%', ''));
    if (percentageValue < 5) {
        return 'red';  // Below 5% turns red
    } else if (percentageValue > 10) {
        return 'green';  // Above 10% turns green
    } else {
        return 'white';  // Between 5% and 10% stays white
    }
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

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach((cellData, cellIndex) => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            if (rowIndex === 0) {
                cellElement.style.color = 'yellow';  // Set headers to yellow
            } else {
                const isNameCell = (cellIndex === 0);
                const is5MinAnswerRate = row[0] === "5 Min Answer Rate";  // Check if it's the 5 Min Answer Rate row

                if (isNameCell) {
                    cellElement.style.color = 'white';  // Default ISR names to white
                }

                if (is5MinAnswerRate) {
                    // Apply the percentage color logic for "5 Min Answer Rate"
                    cellElement.style.color = apply5MinAnswerRateColor(cellData);
                } else if (isNumeric(cellData)) {
                    cellElement.style.color = 'white';  // Numbers should be white
                } else {
                    cellElement.style.color = 'yellow';  // Default text should be yellow
                }
            }

            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });
}

// Function to create an accordion section initially
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
    const table = document.createElement('table');
    table.classList.add('data-table');

    // Append the table to the scrollable container
    scrollContainer.appendChild(table);
    content.appendChild(scrollContainer);
    container.appendChild(button);
    container.appendChild(content);
    document.getElementById('data-container').appendChild(container);

    updateAccordionContent(sheetName, data);  // Fill the table with data

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
        if (sheetData.length > 0) {
            console.log(`Creating section for ${sheetName}`);  // Log when creating sections
            createAccordionSection(sheetName, sheetData);  // Create accordion sections initially
        } else {
            console.error(`No data found for sheet: ${sheetName}`);  // Log if no data is found
        }
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
