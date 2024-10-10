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

// Default Colors
let headerColor = '#FF0000'; // Red
let nameColor = '#FFA500'; // Orange
let dataColor = '#008000'; // Green
let textColor = '#C0C0C0'; // Silver

// Ensure the DOM is fully loaded before interacting with elements
document.addEventListener('DOMContentLoaded', function() {
    
    // Function to fetch data from a specific sheet (tab)
    async function fetchSheetData(sheetName) {
        const encodedSheetName = encodeURIComponent(sheetName); // Encode the sheet name to handle spaces and special characters
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?key=${apiKey}`;
        
        console.log(`Fetching data from sheet: ${sheetName}`); // Debugging log

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch data from ${sheetName}:`, response.statusText);
                return [];
            }
            const data = await response.json();
            console.log(`Data fetched from ${sheetName}:`, data); // Debugging log for fetched data
            return data.values || [];
        } catch (error) {
            console.error(`Error fetching data from ${sheetName}:`, error);
            return [];
        }
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

        // If no data is available, add a placeholder
        if (!data || data.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = `No data available for ${sheetName}`;
            content.appendChild(emptyMessage);
        } else {
            // Apply custom color-coding based on user selection
            data.forEach((row, rowIndex) => {
                const rowElement = document.createElement('tr');
                row.forEach(cellData => {
                    const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');
                    
                    // Apply colors dynamically
                    if (rowIndex === 0) {
                        cellElement.style.color = headerColor; // Header color selected by the user
                    } else if (isName(cellData)) {
                        cellElement.style.color = nameColor; // Name color selected by the user
                    } else if (isNaN(parseFloat(cellData)) && !cellData.includes('%')) {
                        cellElement.style.color = textColor; // Text color selected by the user (locations, other words)
                    } else {
                        cellElement.style.color = dataColor; // Data color selected by the user (numbers, percentages)
                    }

                    cellElement.textContent = cellData;
                    rowElement.appendChild(cellElement);
                });
                table.appendChild(rowElement);
            });

            content.appendChild(table);
        }

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

    // Function to apply selected colors
    function applySelectedColors() {
        // Get selected colors from color pickers
        headerColor = document.getElementById('header-color').value;
        nameColor = document.getElementById('name-color').value;
        dataColor = document.getElementById('data-color').value;
        textColor = document.getElementById('text-color').value;

        // Clear existing data and reload with new colors
        document.getElementById('data-container').innerHTML = '';
        loadAllSheetsData(); // Reload the data with the new colors applied
    }

    // Add event listener for the "Apply Colors" button
    document.getElementById('apply-colors').addEventListener('click', applySelectedColors);

    // Load all data when the page loads
    loadAllSheetsData();
});
