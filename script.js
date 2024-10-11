const API_KEY = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60Y';
const SHEET_ID = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';

// Ranges for each sheet in your Google Spreadsheet
const dailyRange = 'Daily!A1:D10'; // Adjust range as needed
const leadsRange = 'Leads!A1:D10'; 
const efficiencyRange = 'Efficiency!A1:D10'; 

// Load the Google Sheets API client library
function initClient() {
    gapi.client.init({
        'apiKey': API_KEY,
    }).then(() => {
        loadSheetData(dailyRange, 'daily-table');
        loadSheetData(leadsRange, 'leads-table');
        loadSheetData(efficiencyRange, 'efficiency-table');
    });
}

// Load data from a specific sheet range and populate a table
function loadSheetData(range, tableId) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    }).then(response => {
        const data = response.result.values;
        renderTable(data, tableId);
    });
}

// Render the data as an HTML table
function renderTable(data, tableId) {
    const table = document.getElementById(tableId);
    let html = '<thead><tr>';

    // Create headers
    data[0].forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Create table rows
    data.slice(1).forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            let formattedCell = formatCell(cell);
            html += `<td>${formattedCell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    table.innerHTML = html;
}

// Format percentage or dynamic values
function formatCell(value) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
        if (num > 0) {
            return `<span class="positive">${value}</span>`;
        } else {
            return `<span class="negative">${value}</span>`;
        }
    }
    return value;
}

// Function to handle tab switching
function showTab(tabId) {
    const tables = document.getElementsByClassName('table-container');
    for (let table of tables) {
        table.classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');

    const buttons = document.querySelectorAll('.tab-buttons button');
    buttons.forEach(button => button.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Load the API and initiate client
gapi.load('client', initClient);
