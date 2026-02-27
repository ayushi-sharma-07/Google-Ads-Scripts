/*
Google Ads Script: Campaign Structure Export

This script exports the enabled Search campaign structure
(Campaign → Ad Groups) into a Google Sheet.

Features:
- Exports only Search campaigns
- Includes only ad groups with impressions today
- Automatically creates the sheet if it does not exist
- Merges duplicate campaign names for readability
- Applies alternating colors for campaign groups

Author: Ayushi Sharma
Email: sharmaayu0701@gmail.com
*/

function main() {
  // Google Sheet URL where data will be exported
  const SPREADSHEET_URL =
    'Insert Your Sheet Link';

  // Sheet tab name
  const TAB_NAME = 'Campaign Structure';

  // Open spreadsheet
  const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);

  // Get or create sheet
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }

  // Break merged cells ONLY in columns A & B
  // This ensures a clean structure before writing new data
  const maxRows = sheet.getMaxRows();
  sheet.getRange(1, 1, maxRows, 2).breakApart();

  // Clear data & formatting ONLY in columns A & B (from row 2 down)
  if (sheet.getLastRow() > 1) {
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, 2)
      .clearContent()
      .clearFormat();
  }

  // Ensure headers exist
  const headerRange = sheet.getRange(1, 1, 1, 3);

  if (sheet.getRange(1, 1).getValue() === '') {
    sheet.getRange(1, 1).setValue('Campaign Name');
    sheet.getRange(1, 2).setValue('Ad Group Name');
    sheet.getRange(1, 3).setValue('Products');
  }

  // Make header bold
  headerRange.setFontWeight('bold');

  const rows = [];

  // Fetch enabled Search campaigns
  const campaigns = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .withCondition("AdvertisingChannelType = SEARCH")
    .get();

  while (campaigns.hasNext()) {
    const campaign = campaigns.next();

    // Fetch enabled ad groups with impressions today
    const adGroups = campaign
      .adGroups()
      .withCondition("Status = ENABLED")
      .forDateRange("TODAY")
      .withCondition("Impressions > 0")
      .get();

    while (adGroups.hasNext()) {
      const adGroup = adGroups.next();

      // Only push campaign and ad group names
      rows.push([
        campaign.getName(),
        adGroup.getName()
      ]);
    }
  }

  // Write data into the sheet
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);

    // Merge cells with the same campaign name
    mergeDuplicateCells(sheet, rows);

    Logger.log(
      'Exported ' +
        rows.length +
        ' Search ad groups with impressions today.'
    );
  } else {
    Logger.log(
      'No enabled Search campaigns/ad groups with impressions today.'
    );
  }
}

/*
Merges duplicate campaign names in column A
and applies background colors for better readability.
*/
function mergeDuplicateCells(sheet, rows) {
  if (rows.length === 0) return;

  const colors = [
    '#E8F4F8', // Light blue
    '#F0E8F8', // Light purple
    '#F8F0E8', // Light orange
    '#E8F8F0', // Light teal
    '#F8F8E8'  // Light yellow
  ];

  // Start from row 2 (after header)
  let mergeStartRow = 2;
  let colorIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const currentRow = i + 2;
    const nextRow = i + 1 < rows.length ? i + 3 : null;

    // Check if campaign changes or if it's the last row
    if (!nextRow || rows[i][0] !== rows[i + 1][0]) {
      const mergeRange = sheet.getRange(
        mergeStartRow,
        1,
        currentRow - mergeStartRow + 1,
        1
      );

      // Merge cells if there are multiple rows
      if (currentRow > mergeStartRow) {
        mergeRange.merge();
      }

      // Apply formatting
      mergeRange
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');

      mergeRange.setBackground(
        colors[colorIndex % colors.length]
      );

      colorIndex++;
      mergeStartRow = currentRow + 1;
    }
  }
}