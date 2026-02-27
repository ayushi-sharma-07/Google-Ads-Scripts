/*
Google Ads Script
Exports:
- Campaign structure
- RSA headlines & descriptions
- Keywords
- Negative keyword lists
- Sitelinks with impressions

Use case:
Helpful for audits, campaign documentation, and performance analysis.

Author: Ayushi Sharma
Email: sharmaayu0701@gmail.com
*/

// Google Sheet where the report will be exported. Edit this variable with your Google Sheet link.
const SPREADSHEET_URL =
  "[Insert your Google Sheet Link]";

// Label used to filter ads (only ads with this label will be exported)
const LABEL_NAME = "BAU 2026";

function main() {
  // Open the destination spreadsheet
  const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);

  // Variable to store the label resource name (needed for queries)
  let labelResourceName = null;

  // Query to find the label resource name from label name
  const labelQuery = `
    SELECT label.resource_name
    FROM label
    WHERE label.name = '${LABEL_NAME}'
  `;

  const labelIterator = AdsApp.search(labelQuery);

  // If label exists, store its resource name
  if (labelIterator.hasNext()) {
    labelResourceName = labelIterator.next().label.resourceName;
  } else {
    throw new Error("Label not found");
  }

  // Map to store ads grouped by campaign and ad group
  const adGroupMap = {};

  // Query to pull ads data including headlines and descriptions
  const adQuery = `
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad_strength,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions
    FROM ad_group_ad
    WHERE ad_group_ad.status = ENABLED
      AND campaign.status = ENABLED
      AND ad_group_ad.labels CONTAINS ANY ('${labelResourceName}')
  `;

  const adIterator = AdsApp.search(adQuery);

  // Loop through all ads returned by the query
  while (adIterator.hasNext()) {
    const row = adIterator.next();

    const campaign = row.campaign.name;
    const adGroup = row.adGroup.name;

    // Get landing page URL
    const finalUrl = row.adGroupAd.ad.finalUrls
      ? row.adGroupAd.ad.finalUrls[0]
      : "";

    // Extract RSA headlines
    const headlines = row.adGroupAd.ad.responsiveSearchAd
      ? row.adGroupAd.ad.responsiveSearchAd.headlines || []
      : [];

    // Extract RSA descriptions
    const descriptions = row.adGroupAd.ad.responsiveSearchAd
      ? row.adGroupAd.ad.responsiveSearchAd.descriptions || []
      : [];

    // Get ad strength
    const adStrength = row.adGroupAd.adStrength || "";

    // Initialize campaign object if not present
    if (!adGroupMap[campaign]) adGroupMap[campaign] = {};

    // Initialize ad group object
    if (!adGroupMap[campaign][adGroup]) {
      adGroupMap[campaign][adGroup] = {
        landing: finalUrl,
        headlines: [],
        descriptions: [],
        strength: adStrength,
      };
    }

    // Store headlines with character count
    headlines.forEach((h) => {
      if (h && h.text) {
        adGroupMap[campaign][adGroup].headlines.push({
          text: h.text,
          len: h.text.length,
        });
      }
    });

    // Store descriptions with character count
    descriptions.forEach((d) => {
      if (d && d.text) {
        adGroupMap[campaign][adGroup].descriptions.push({
          text: d.text,
          len: d.text.length,
        });
      }
    });
  }

  // Map to store keywords by campaign + ad group
  const keywordMap = {};

  // Query to fetch all enabled keywords
  const keywordQuery = `
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.keyword.text
    FROM ad_group_criterion
    WHERE campaign.status = ENABLED
      AND ad_group.status = ENABLED
      AND ad_group_criterion.status = ENABLED
      AND ad_group_criterion.type = KEYWORD
      AND ad_group_criterion.negative = FALSE
  `;

  const keywordIterator = AdsApp.search(keywordQuery);

  // Loop through keywords
  while (keywordIterator.hasNext()) {
    const row = keywordIterator.next();

    const campaign = row.campaign.name;
    const adGroup = row.adGroup.name;

    // Only include keywords if BAU ads exist in the same ad group
    if (!adGroupMap[campaign] || !adGroupMap[campaign][adGroup]) {
      continue;
    }

    const key = campaign + "||" + adGroup;

    if (!keywordMap[key]) keywordMap[key] = [];
    keywordMap[key].push(row.adGroupCriterion.keyword.text);
  }

  // Create a separate sheet for each campaign
  for (let campaign in adGroupMap) {
    let sheet = spreadsheet.getSheetByName(campaign);

    // Create sheet if it does not exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(campaign);
    } else {
      sheet.clear();
    }

    // Sheet formatting settings
    sheet.setTabColor("#800080");
    sheet.setFrozenRows(1);

    const output = [];

    // Header row
    output.push([
      "Ad Group",
      "Landing Page",
      "KW",
      "SV",
      "Headlines",
      "Char",
      "Descriptions",
      "Char",
      "Ad Strength",
    ]);

    // Loop through ad groups inside campaign
    for (let adGroup in adGroupMap[campaign]) {
      const data = adGroupMap[campaign][adGroup];
      const keywords = keywordMap[campaign + "||" + adGroup] || [];

      // Determine max rows required
      const rowCount = Math.max(
        keywords.length,
        data.headlines.length,
        data.descriptions.length,
        1
      );

      for (let i = 0; i < rowCount; i++) {
        output.push([
          i === 0 ? adGroup : "",
          i === 0 ? data.landing : "",
          keywords[i] || "",
          "",
          data.headlines[i] ? data.headlines[i].text : "",
          data.headlines[i] ? data.headlines[i].len : "",
          data.descriptions[i] ? data.descriptions[i].text : "",
          data.descriptions[i] ? data.descriptions[i].len : "",
          i === 0 ? data.strength : "",
        ]);
      }
    }

    // Write data to sheet
    sheet.getRange(1, 1, output.length, 9).setValues(output);

    const lastRow = sheet.getLastRow();

    // Header styling
    sheet
      .getRange(1, 1, 1, 9)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBackground("#d9d9d9")
      .setBorder(true, true, true, true, true, true);

    // Column formatting
    sheet
      .getRange(2, 1, lastRow - 1, 1)
      .setBackground("#cfe2f3")
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 2, lastRow - 1, 1)
      .setBackground("#fce5cd")
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 3, lastRow - 1, 2)
      .setBackground("#ead1dc")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 5, lastRow - 1, 1)
      .setBackground("#d0e0e3")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 6, lastRow - 1, 1)
      .setHorizontalAlignment("center")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 7, lastRow - 1, 1)
      .setBackground("#cfe2f3")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 8, lastRow - 1, 1)
      .setHorizontalAlignment("center")
      .setBorder(true, true, true, true, true, true);

    sheet
      .getRange(2, 9, lastRow - 1, 1)
      .setBackground("#ead1dc")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, true, true);

    // Enable text wrapping
    sheet.getRange(2, 2, lastRow - 1, 1).setWrap(true);
    sheet.getRange(2, 5, lastRow - 1, 1).setWrap(true);
    sheet.getRange(2, 7, lastRow - 1, 1).setWrap(true);

    // Auto resize columns
    sheet.autoResizeColumns(1, 9);
  }

  // Export shared negative keyword lists
  writeNegativeKeywordLists(spreadsheet);

  // Export sitelinks performance
  writeSitelinks(spreadsheet);
}