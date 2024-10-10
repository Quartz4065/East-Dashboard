// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJbqxxOzNqkvNA0VbKl3apzOA'; // Provided API Key
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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA}/values/${"Daily", 
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
    "Answer Rates"}?key=${AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJbqxxOzNqkvNA0VbKl3apzOA}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch data from ${sheetName}:`, response.statusText);
        return [];
    }
    const data = await response.json();
    return data.values || [];
}

// Function to display the data from a sheet in a table
function displaySheetData(sheetName, data) {
    const container = document.createElement('div');
    const heading = document.createElement('h2');
    heading.textContent = `${sheetName} Data`; // Displays the sheet name as the heading
    container.appendChild(heading);

    const table = document.createElement('table');
    table.style.width = '100%'; // Optional: Makes the table responsive

    // Loop through each row of data
    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td'); // Use <th> for header, <td> for data
            cellElement.textContent = cellData;
            rowElement.append.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });

    container.appendChild(table);
    document.body.appendChild(container); // Append the table to the body of the page
}

// Load all data from all manually specified sheets (tabs)
async function loadAllSheetsData() {
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName); // Fetch data for each tab
        displaySheetData(sheetName, sheetData); // Display the data in a table
    }
}

// Load all data when the page loads
window.onload = loadAllSheetsData;
