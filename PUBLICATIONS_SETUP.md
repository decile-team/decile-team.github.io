# Automated Publications Update Setup

This guide explains how to set up automatic publication updates from Google Sheets submissions.

## Overview

The system uses:
- **Google Forms** for students to submit publications
- **Google Sheets** to store the submissions
- **GitHub Actions** to automatically update the website daily

## Setup Instructions

### 1. Create Google Form

Create a Google Form with these fields:
- **Publication Title** (Short answer, required)
- **Authors** (Long answer, required) - Format: "Name1, Name2, Name3"
- **Conference/Journal** (Long answer, required) - Full conference/journal citation
- **Paper URL** (Short answer, optional) - Link to paper (ArXiv, conference site, etc.)
- **Category** (Dropdown, required) - Options: CORDS, DISTIL, SUBMODLIB, SPEAR, Other
- **Year** (Short answer, required) - Publication year (e.g., 2025)

### 2. Link Form to Google Sheets

1. In your Google Form, click the "Responses" tab
2. Click the Google Sheets icon to create a linked spreadsheet
3. Rename the sheet tab to "Publications"
4. Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 3. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it "github-actions-publications"
   - Grant it "Viewer" role
   - Click "Done"
5. Create Service Account Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the downloaded file securely

### 4. Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (found in the JSON key file, looks like: `github-actions-publications@PROJECT-ID.iam.gserviceaccount.com`)
4. Give it "Viewer" permissions

### 5. Add GitHub Secrets

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add these secrets:

   **GOOGLE_SHEETS_ID**
   - Value: The spreadsheet ID from step 2

   **GOOGLE_SERVICE_ACCOUNT_KEY**
   - Value: The entire contents of the JSON key file from step 3
   - Make sure to copy the entire JSON object

### 6. Test the Workflow

1. Go to "Actions" tab in your GitHub repository
2. Click "Update Publications from Google Sheets"
3. Click "Run workflow" to manually trigger it
4. Check the workflow output for any errors

## How It Works

1. Students fill out the Google Form
2. Form responses are automatically added to Google Sheets
3. GitHub Actions workflow runs daily at midnight UTC (or manually)
4. Script reads new publications from Google Sheets
5. Publications are automatically inserted into `index.html`
6. Changes are committed and pushed to the repository
7. GitHub Pages automatically rebuilds the site

## Google Sheets Format

Your sheet should have these columns (with headers in row 1):

| Title | Authors | Conference | URL | Category | Year |
|-------|---------|------------|-----|----------|------|
| Example Paper | John Doe, Jane Smith | ICML 2025 | https://... | CORDS | 2025 |

## Manual Triggering

To manually update publications:
1. Go to repository "Actions" tab
2. Select "Update Publications from Google Sheets"
3. Click "Run workflow"

## Troubleshooting

### Workflow fails with authentication error
- Check that service account has access to the sheet
- Verify the service account key is correctly added to GitHub secrets
- Ensure Google Sheets API is enabled in Google Cloud Console

### Publications not appearing
- Check that sheet name is exactly "Publications"
- Verify column order matches the script expectations
- Check GitHub Actions logs for specific errors

### Want to change update frequency
Edit `.github/workflows/update-publications.yml` and modify the cron schedule:
- `'0 0 * * *'` = Daily at midnight
- `'0 */6 * * *'` = Every 6 hours
- `'0 0 * * 1'` = Weekly on Monday

## Alternative: Manual JSON File

If you prefer simpler manual updates, you can also maintain a `publications.json` file:

```json
{
  "publications": [
    {
      "title": "Example Paper",
      "authors": "John Doe, Jane Smith",
      "conference": "ICML 2025",
      "url": "https://arxiv.org/...",
      "year": 2025,
      "category": "CORDS"
    }
  ]
}
```

Then modify the script to read from this file instead of Google Sheets.
