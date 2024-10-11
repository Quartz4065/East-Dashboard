// Your Google Sheets API Key and Spreadsheet ID
const apiKey = 'AIzaSyDUpztgaNLc1Vlq-ctxZbHo-ZRHl8wTJ60'; 
const spreadsheetId = '1COuit-HkAoUL3d5uv9TJbqxxOzNqkvNA0VbKl3apzOA'; 

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

// Function to toggle full screen for a specific element
function toggleFullScreen(element) {
    if (!document.fullscreenElement) {
        element.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Function to check if a value is numeric
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

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

// Function to sanitize the sheet name for use in IDs and selectors
function sanitizeSheetName(sheetName) {
    return sheetName.replace(/[^a-zA-Z0-9]/g, '-'); // Replace special characters with hyphens
}

// Function to apply percentage color logic
function applyPercentageColor(cellText, term, nameCell) {
    const percentageValue = parseFloat(cellText.replace('%', ''));
    let color = 'white';  // Default color for percentages and names
    
    // Ensure ISR name is white by default
    nameCell.style.color = 'white';  // Default ISR names to white

    if (term === "5-Minute Answer Rate") {
        if (percentageValue < 10) {
            color = 'red';  // Set percentage to red
            nameCell.style.color = 'red';  // Set ISR name to red if percentage is in red
        } else if (percentageValue > 20) {
            color = '#00FF00';  // Set percentage to bright green
        }
    }

    if (term === "Set Rate") {
        if (percentageValue < 25) {
            color = 'red';  // Set percentage to red
            nameCell.style.color = 'red';  // Set ISR name to red if percentage is in red
        } else if (percentageValue > 45) {
            color = '#00FF00';  // Set percentage to bright green
        }
    }

    return color;  // Return the color for the percentage
}

// Function to update the content of an accordion section without re-rendering it
function updateAccordionContent(sheetName, data) {
    const validSelector = sanitizeSheetName(sheetName);  // Sanitize the selector
    const contentDiv = document.querySelector(`#${validSelector} .panel`);
    
    if (!contentDiv) {
        console.error(`Accordion panel for ${sheetName} not found.`);
        return;
    }

    const table = contentDiv.querySelector('table');
    
    if (!table) {
        console.error(`Table for ${sheetName} not found inside the panel.`);
        return;
    }

    table.innerHTML = '';  // Clear existing data

    data.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach((cellData, cellIndex) => {
            const cellElement = document.createElement(rowIndex === 0 ? 'th' : 'td');

            if (rowIndex === 0) {
                cellElement.style.color = 'yellow';
            } else {
                const isNameCell = (cellIndex === 0);
                const isPercentage = cellData.includes('%');
                
                if (isNameCell) {
                    cellElement.style.color = 'white';  // Default ISR names to white
                }

                if (isPercentage) {
                    const nameCell = rowElement.children[
