// Replace this URL with your published CSV URL from Google Sheets
const csvURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSb_tcnsv5b633i96vxKetuKhtKYtvbQYmfK4N_eW-MOJ2FYeKK0yc5x4ExMGsORA9dzAfCHmnCHHQD/pub?output=csv';

// Function to fetch the CSV file
async function fetchCSV(url) {
    const response = await fetch(url);
    return await response.text(); // Return CSV as text
}

// Function to convert CSV text into a 2D array
function csvToArray(csvText) {
    const rows = csvText.split("\n");
    return rows.map(row => row.split(","));
}

// Function to create a table from the CSV data
function displayCSVData(csvData) {
    const table = document.getElementById('data-table');
    const rows = csvToArray(csvData);

    rows.forEach((rowData, rowIndex) => {
        const rowElement = document.createElement('tr');

        rowData.forEach(cellData => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');
            cellElement.textContent = cellData;
            rowElement.appendChild(cellElement);
        });

        table.appendChild(rowElement);
    });
}

// Fetch the CSV data and display it
fetchCSV(csvURL)
    .then(displayCSVData)
    .catch(error => console.error("Error fetching the CSV data:", error));
