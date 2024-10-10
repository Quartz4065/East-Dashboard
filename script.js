// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; // Provided API Key
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; // Provided Spreadsheet ID

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

// Function to fetch data from a specific sheet (tab)
async function fetchSheetData(sheetName) {
    const encodedSheetName = encodeURIComponent(sheetName); // Encode the sheet name to handle spaces and special characters
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch data from ${sheetName}:`, response.statusText);
        return [];
    }
    const data = await response.json();
    return data.values || [];
}

// Function to check if a value is a name (we'll use a simple rule)
function isName(value) {
    // Assumes names are usually capitalized and not numbers or percentages
    return /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

// Function to create a collapsible section
function createCollapsibleSection(sheetName, data) {
    const container = document.createElement('div');
    
    const button = document.createElement('button');
    button.classList.add('collapsible');
    button.textContent = `${sheetName} Data`;

    const content = document.createElement('div');
    content.classList.add('content');
    
    const table = document.createElement('table');
    table.style.width = '100%'; 

    // Apply special color-coding for the "Daily" tab
    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');
            
            // Custom formatting for the "Daily" tab
            if (sheetName === 'Daily') {
                if (rowIndex === 0) {
                    cellElement.style.color = 'red'; // Headers and labels in Red
                } else if (isName(cellData)) {
                    cellElement.style.color = 'orange'; // Names in Orange
                } else if (cellData === '5 Min Answer Rate') {
                    cellElement.style.color = 'silver'; // Special label "5 Min Answer Rate" in Silver
                } else if (isNaN(parseFloat(cellData)) && !cellData.includes('%')) {
                    cellElement.style.color = 'silver'; // Locations and other words in Silver
                } else {
                    cellElement.style.color = 'green'; // Numbers and percentages in Green
                }
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
        const content = this.nextElementSibling;
        if (content.style.display === 'block') {
            content.style.display = 'none';
        } else {
            content.style.display = 'block';
        }
    });
}

// Load all data from all manually specified sheets (tabs)
async function loadAllSheetsData() {
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName); 
        createCollapsibleSection(sheetName, sheetData); 
    }
}

// Load all data when the page loads
window.onload = loadAllSheetsData;
