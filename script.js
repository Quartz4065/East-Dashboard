// API Key and Sheet ID provided
const API_KEY = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60Y';
const SHEET_ID = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';

// Ranges for specific sheets within the Google Spreadsheet
const ranges = {
    daily: 'Daily!A1:D10',       // Modify range as per your sheet data
    leads: 'Leads!A1:D10',
    efficiency: 'Efficiency!A1:D10'
};

// Load the Google Sheets API client library and initialize it
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    }).then(() => {
        // Fetch data for each tab
        loadSheetData(ranges.daily, 'daily-table');
        loadSheetData(ranges.leads, 'leads-table');
        loadSheetData(ranges.efficiency, 'efficiency-table');
    }).catch(err => {
        console.error('Error initializing API client', err);
    });
}

// Fetch data from the Google Sheets API for a specific range
function loadSheetData(range, tableId) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: range
    }).then((response) => {
        const data = response.result.values;
        renderTable(data, tableId);
    }).catch((err) => {
        console.error(`Error fetching data for ${range}:`, err);
    });
}

// Render the fetched data as a table
function renderTable(data, tableId) {
    const table = document.getElementById(tableId);
    let html = '<thead><tr>';

    // Create table headers
    data[0].forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Create table rows
    data.slice(1).forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${formatCell(cell)}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    table.innerHTML = html;
}

// Format table cells dynamically
function formatCell(value) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
        return num > 0 ? `<span class="positive">${value}</span>` : `<span class="negative">${value}</span>`;
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

// Load the Google API client
gapi.load('client', initClient);
