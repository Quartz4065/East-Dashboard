// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; // Replace with your API Key
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';  // Replace with your Spreadsheet ID

// Function to fetch data from a specific sheet (tab)
async function fetchSheetData(sheetName) {
    const encodedSheetName = encodeURIComponent(sheetName);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${sheetName}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.values || [];
}

// Function to display data in a table
function displayData(data, containerId) {
    const container = document.getElementById(containerId);
    const table = document.createElement('table');

    // Create table headers from the first row of the sheet
    const headers = data[0];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows from the remaining data
    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.innerHTML = '';  // Clear previous content
    container.appendChild(table);  // Add the new table
}

// Function to save data back to Google Sheets (e.g., when users submit forms)
async function saveDataToSheet(values) {
    const sheetName = 'Sheet1';  // Specify the sheet where you want to save data
    const range = 'A1';  // Specify where in the sheet the data should go
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

    const body = {
        values: [values]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error('Failed to save data to Google Sheets');
    }
}

// Event listener for submitting form data
document.getElementById('data-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const inputData = document.getElementById('inputData').value;
    await saveDataToSheet([inputData]);
    alert('Data successfully saved to Google Sheets!');
});

// Function to open Zoho report (link)
function openZohoReport() {
    window.open('https://www.zoho.com/reports/', '_blank');
}

// Load data from multiple sheets when the page loads
async function loadData() {
    try {
        const sheet1Data = await fetchSheetData('Sheet1');  // Pull data from Sheet1
        displayData(sheet1Data, 'data-container-1');

        const sheet2Data = await fetchSheetData('Sheet2');  // Pull data from Sheet2
        displayData(sheet2Data, 'data-container-2');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

window.onload = loadData;  // Load data on page load
