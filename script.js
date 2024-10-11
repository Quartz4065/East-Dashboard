// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY';  // Replace with your API Key
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA';  // Replace with your Spreadsheet ID

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
    for (let i = 1; i < data.length; i++) {
        const row = document.createElement('tr');
        data[i].forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;

            // Add alert styling if the value exceeds a threshold
            if (!isNaN(cellData) && parseFloat(cellData) > 100) {
                td.classList.add('alert');
                alert(`Alert: Value exceeded threshold in row ${i + 1}`);
            }

            row.appendChild(td);
        });
        table.appendChild(row);
    }

    container.innerHTML = '';  // Clear previous content
    container.appendChild(table);  // Add the new table
}

// Function to render a chart using Chart.js
function renderChart(data, chartId) {
    const labels = data.slice(1).map(row => row[0]);  // Use the first column as labels
    const chartData = data.slice(1).map(row => parseFloat(row[1]));  // Use the second column as values

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Data',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load data and display it
async function loadData() {
    const sheet1Data = await fetchSheetData('Sheet1');  // Replace with your sheet name
    displayData(sheet1Data, 'data-container-1');
    renderChart(sheet1Data, 'chart-1');

    const sheet2Data = await fetchSheetData('Sheet2');  // Replace with your sheet name
    displayData(sheet2Data, 'data-container-2');
    renderChart(sheet2Data, 'chart-2');
}

// Load data when the page loads
window.onload = loadData;
