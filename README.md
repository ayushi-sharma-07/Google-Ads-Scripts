# Google Ads Helper Scripts

A collection of practical **Google Ads automation scripts** designed to help performance marketers, agencies, and advertisers export campaign data, audit accounts, and automate reporting workflows.

These scripts are built for real-world account management and are especially useful for:
- Performance marketing teams
- Digital marketing agencies
- Freelancers managing multiple Google Ads accounts
- Account audits and documentation
- Campaign structure reporting

This repository contains scripts that export campaign data into **Google Sheets** for easier analysis and collaboration.

---

## What This Repository Includes

### Campaign Structure Export Script
Exports the active Search campaign structure into a Google Sheet.

**What it pulls**
- Campaign Names
- Ad Group Names
- Ad Groups with impressions today

**Features**
- Automatically creates the sheet if it does not exist
- Cleans previous data before export
- Merges duplicate campaign rows for better readability
- Applies visual formatting
- Exports only **enabled Search campaigns**
- Filters ad groups with **impressions today**

This script is useful for:
- Account audits
- Campaign documentation
- Reporting structures to clients
- Quick health checks of active campaigns

---

### Advanced Account Export Script
Exports a deeper view of the account structure including ad creatives.

**What it pulls**
- Campaigns
- Ad Groups
- Landing Pages
- Keywords
- Responsive Search Ad Headlines
- Responsive Search Ad Descriptions
- Character counts
- Ad Strength
- Negative Keyword Lists
- Sitelinks with impressions

**Features**
- Organized by campaign
- Automatic sheet creation
- Clean formatting
- Label-based filtering for ads
- Structured output for easy analysis

This script is especially useful for:
- Creative audits
- RSA optimization
- Landing page review
- Keyword analysis
- Competitor benchmarking
- Campaign documentation

---

## Repository Structure
google-ads-helper-scripts/
│
├── README.md
├── LICENSE
│
├── scripts/
│ ├── campaign-structure-export/
│ │ └── script.js
│ │
│ ├── full-account-export/
│ │ └── script.js
│
└── docs/
└── setup-guide.md

---

## Requirements

Before running these scripts, you need:

- Access to a Google Ads account
- Permission to use Google Ads Scripts
- A Google Sheet to export the data
- Authorization to run scripts

---

## How to Use These Scripts

1. Open Google Ads
2. Go to **Tools & Settings**
3. Navigate to **Bulk Actions**
4. Click **Scripts**
5. Create a new script
6. Paste the script from this repository
7. Update the Google Sheet URL in the script
8. Authorize the script
9. Run Preview
10. Schedule if needed

---

## Configuration

Most scripts require updating the following variables:
SPREADSHEET_URL
LABEL_NAME (if used)
TAB_NAME

Example:
const SPREADSHEET_URL = "YOUR_GOOGLE_SHEET_URL";

---

## Use Cases

These scripts are commonly used for:

- Google Ads account audits
- Campaign documentation
- Client reporting
- Creative performance reviews
- Agency workflows
- Scaling account management
- Data exports for analysis

---

## Who This Repository Is For

This repository is designed for:
- Google Ads Specialists
- Performance Marketers
- Media Buyers
- PPC Agencies
- Freelancers managing multiple accounts

---

## Future Scripts Planned

- Search Term Mining Script
- Automatic Budget Monitoring
- CTR Optimization Script
- Keyword Conflict Finder
- Performance Alerts Script
- PMax Asset Export Script

---

## Contributing

Contributions are welcome.

If you'd like to add new Google Ads scripts:

1. Fork the repository
2. Create a new branch
3. Add your script
4. Submit a pull request

---

## License

MIT License

You are free to use and modify these scripts.

---

## Author

Ayushi Sharma  
Performance Marketer | Google Ads Specialist