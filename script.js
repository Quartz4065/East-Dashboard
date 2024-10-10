// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; // Provided API Key
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; // Provided Spreadsheet ID

// Function to fetch the list of sheet names (tab names)
async function fetchSheetNames() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error('Failed to fetch sheet names:', response.statusText);
        return [];
    }
    const data = await response.json();
    return data.sheets.map(sheet => sheet.properties.title); // Return all sheet names
}

// Function to fetch data from a specific sheet (tab)
async function fetchSheetData(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
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
    heading.textContent = `${sheetName} Data`;
    container.appendChild(heading);

    const table = document.createElement('table');
    table.style.width = '100%'; // Optional: Makes the table responsive

    // Loop through each row of data
    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td'); // Use <th> for header, <td> for data
            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });
        table.appendChild(rowElement);
    });

    container.appendChild(table);
    document.body.appendChild(container); // Append the table to the body of the page
}

// Function to load data from all the sheets (tabs) in the spreadsheet
async function loadAllSheetsData() {
    const sheetNames = await fetchSheetNames(); // Fetch all sheet names
    for (const sheetName of sheetNames) {
        const sheetData = await fetchSheetData(sheetName); // Fetch data for each sheet
        displaySheetData(sheetName, sheetData); // Display the data in a table
    }
}

// Load all data when the page loads
window.onload = loadAllSheetsData;
