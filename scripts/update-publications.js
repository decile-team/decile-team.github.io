const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = 'Publications'; // Name of the sheet tab
const INDEX_FILE = path.join(__dirname, '../index.html');

// Authenticate with Google Sheets
async function authenticate() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  return auth.getClient();
}

// Fetch publications from Google Sheets
async function fetchPublications(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:F`, // Assuming columns: Title, Authors, Conference, URL, Category, Year
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }
  
  return rows.map(row => ({
    title: row[0] || '',
    authors: row[1] || '',
    conference: row[2] || '',
    url: row[3] || '#',
    category: row[4] || 'CORDS', // Default category
    year: parseInt(row[5]) || new Date().getFullYear(),
  }));
}

// Generate HTML for a publication
function generatePublicationHTML(pub) {
  return `                <div class="paper">
                    <a class="paper-title" target="_blank" href="${pub.url}">
                        ${pub.title}
                    </a>
                    <p class="paper-authors">
                        ${pub.authors}
                    </p>
                    <p class="paper-conference">
                        ${pub.conference}
                    </p>
                </div>`;
}

// Update the index.html file
async function updateIndexHTML(publications) {
  let html = fs.readFileSync(INDEX_FILE, 'utf8');
  
  // Sort publications by year (newest first)
  const sortedPubs = publications.sort((a, b) => b.year - a.year);
  
  // Separate recent publications (2024+) from older ones
  const recentPubs = sortedPubs.filter(p => p.year >= 2024);
  const olderPubs = sortedPubs.filter(p => p.year < 2024);
  
  // Generate HTML for recent publications (to be inserted at top)
  const recentPubsHTML = recentPubs.map(generatePublicationHTML).join('\n');
  
  // Find the insertion point (after ICLR 2024 paper or after CORDS divider)
  const insertionMarker = '<div class="paper XXsnipcss_extracted_selector_selectionXX">\n                    <a class="paper-title" target="_blank" href="https://openreview.net/pdf?id=uz7d2N2zul">';
  
  if (html.includes(insertionMarker)) {
    // Insert recent publications after ICLR 2024 paper
    const parts = html.split(insertionMarker);
    const beforeICLR = parts[0];
    const afterICLR = insertionMarker + parts[1];
    
    // Find the end of ICLR paper
    const iclrEndMarker = '</div>';
    const iclrEndIndex = afterICLR.indexOf(iclrEndMarker) + iclrEndMarker.length;
    const beforeInsert = afterICLR.substring(0, iclrEndIndex);
    const afterInsert = afterICLR.substring(iclrEndIndex);
    
    html = beforeICLR + beforeInsert + '\n' + recentPubsHTML + afterInsert;
  }
  
  fs.writeFileSync(INDEX_FILE, html, 'utf8');
  console.log(`Updated ${publications.length} publications in index.html`);
}

// Main function
async function main() {
  try {
    console.log('Authenticating with Google Sheets...');
    const auth = await authenticate();
    
    console.log('Fetching publications...');
    const publications = await fetchPublications(auth);
    
    if (publications.length > 0) {
      console.log(`Found ${publications.length} publications`);
      await updateIndexHTML(publications);
      console.log('Successfully updated publications!');
    } else {
      console.log('No publications to update');
    }
  } catch (error) {
    console.error('Error updating publications:', error);
    process.exit(1);
  }
}

main();
