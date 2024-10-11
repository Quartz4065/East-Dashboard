const API_KEY = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60Y';
const SHEET_ID = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';

const ranges = {
    daily: 'Daily!A1:D10',
    leads: 'Leads!A1:D10',
    efficiency: 'Efficiency!A1:D10'
};

// Load the Google Sheets API client library and initialize it
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    }).then(() => {
        console.log('Google API client initialized');
        loadSheetData(ranges.daily, 'daily-table');
    }).catch((err) => {
        console.error('Error initializing API client:', err);
    });
}

// Fetch data from Google Sheets
function loadSheetData(range, tableId) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: range
    }).then((response) => {
        const data = response.result.values;
        renderTable(data, tableId);
    }).catch((err) => {
        console.error(`Error fetching data from ${range}:`, err);
    });
}

// Render table data
function renderTable(data, tableId) {
    const table = document.getElementById(tableId);
    let html = '<thead><tr>';
    data[0].forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

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

function formatCell(value) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
        return num > 0 ? `<span class="positive">${value}</span>` : `<span class="negative">${value}</span>`;
    }
    return value;
}

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

// Load the API
gapi.load('client', initClient);
