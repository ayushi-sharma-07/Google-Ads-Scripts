/**
 * Google Ads Calendar Month Budget and Zero Spend Alert Script
 * * This script monitors spending against a fixed monthly budget
 * by calculating spend from the 1st of the current calendar month.
 */

function main() {
  // --- USER CONFIGURATION (REQUIRED INPUTS) ---
  
  // 1. Email address(es) to send the alert to.
  const ALERT_EMAILS = ['Enter Email Id 1', 'Enter Email ID 2']; 
  
  // 2. Threshold in days. An alert will be sent if the estimated remaining days is less than this value.
  const REMAINING_DAYS_THRESHOLD = 3; 
  
  // 3. Currency symbol (for the email body).
  const CURRENCY_SYMBOL = '₹'; 

  // 4. FIXED MONTHLY BUDGET: The total amount available for the month (UPDATED to 8850 INR).
  const MONTHLY_BUDGET_LIMIT = 'Enter Your Total Budget';
  
  // --------------------------
  
  const accountName = AdsApp.currentAccount().getName();
  Logger.log(`Starting calendar month budget check for account: ${accountName}`);
  
  // Determine the start and end date for the spend calculation
  const today = new Date();
  
  // Get the 1st day of the current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Calculate the number of days passed this month (to calculate accurate daily average)
  const daysPassed = (today.getDate() - firstDayOfMonth.getDate()) + 1;

  // Format dates for the getStatsFor method
  const startDateFormatted = timeFormat('yyyyMMdd', firstDayOfMonth);
  const todayDateFormatted = timeFormat('yyyyMMdd', today);

  // 1. Get total spend from the 1st of the month up to today
  const stats = AdsApp.currentAccount().getStatsFor(startDateFormatted, todayDateFormatted);
  const totalCost = stats.getCost();
  
  // Calculate average daily cost since the 1st of the month
  const averageDailyCost = totalCost / daysPassed;

  // Format spend for logging
  const totalCostFormatted = totalCost.toFixed(2);
  const averageDailyCostFormatted = averageDailyCost.toFixed(2);
  
  Logger.log(`Total Cost (since ${startDateFormatted}): ${CURRENCY_SYMBOL}${totalCostFormatted}`);
  Logger.log(`Avg Daily Cost (since 1st): ${CURRENCY_SYMBOL}${averageDailyCostFormatted}`);


  // --- ALERT 2: CHECK FOR ZERO SPEND (Ads potentially not running) ---
  if (totalCost === 0) {
      const subject = `❌ WARNING: ZERO SPEND detected for ${accountName}`;
      const body = `
        Account: ${accountName} (ID: ${AdsApp.currentAccount().getCustomerId()})
        
        The account has registered ${CURRENCY_SYMBOL}0.00 total spend since the 1st of the month. 
        This likely means your ads are not running due to:
        - Low funds (prepaid)
        - Paused campaigns
        - Policy disapprovals
        
        Please check the account immediately to diagnose the issue.
      `;

      MailApp.sendEmail({
        to: ALERT_EMAILS.join(','),
        subject: subject,
        body: body
      });
      Logger.log('Alert email sent for ZERO SPEND.');
      
      // Stop here if there's zero spend
      return;
  }
  
  // --- ALERT 1: CHECK FOR LOW REMAINING BUDGET ---
  
  // Calculate remaining budget based on the fixed monthly limit
  const remainingBudget = MONTHLY_BUDGET_LIMIT - totalCost;
  
  let remainingDays = 0;
  if (averageDailyCost > 0) {
    remainingDays = remainingBudget / averageDailyCost;
  }
  
  // Format for logging and email
  const remainingDaysRounded = remainingDays.toFixed(1);
  const remainingBudgetFormatted = remainingBudget.toFixed(2);

  Logger.log(`Remaining Budget (of ${CURRENCY_SYMBOL}${MONTHLY_BUDGET_LIMIT.toFixed(2)}): ${CURRENCY_SYMBOL}${remainingBudgetFormatted}`);
  Logger.log(`Estimated Remaining Days: ${remainingDaysRounded}`);


  if (remainingDays <= REMAINING_DAYS_THRESHOLD) {
    const subject = `🚨 CRITICAL ALERT: Google Ads Budget Low for ${accountName}`;
    const body = `
      Account: ${accountName} (ID: ${AdsApp.currentAccount().getCustomerId()})
      
      The estimated budget run time is only ${remainingDaysRounded} days or less, which is BELOW the ${REMAINING_DAYS_THRESHOLD}-day warning threshold.
      
      --- BUDGET DETAILS (in ${CURRENCY_SYMBOL}) ---
      Fixed Monthly Limit: ${CURRENCY_SYMBOL}${MONTHLY_BUDGET_LIMIT.toFixed(2)}
      Total Spend (Since 1st of Month): ${CURRENCY_SYMBOL}${totalCostFormatted}
      Remaining Budget:   ${CURRENCY_SYMBOL}${remainingBudgetFormatted}
      Avg Daily Spend (Since 1st): ${CURRENCY_SYMBOL}${averageDailyCostFormatted}
      
      !!! ACTION REQUIRED: Budget will likely be exhausted in ${remainingDaysRounded} days. Please take action!
    `;

    MailApp.sendEmail({
      to: ALERT_EMAILS.join(','),
      subject: subject,
      body: body
    });
    Logger.log('Alert email sent for LOW BUDGET.');
  } else {
    Logger.log('Remaining days is above the threshold. No alert sent.');
  }
}

/**
 * Helper function to format dates correctly for Google Ads scripts.
 */
function timeFormat(format, date) {
  return Utilities.formatDate(date, AdsApp.currentAccount().getTimeZone(), format);
}