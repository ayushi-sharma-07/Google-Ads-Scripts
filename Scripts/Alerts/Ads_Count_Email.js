function main() {
 var adGroupIterator = AdsApp.adGroups()
 .withCondition("CampaignStatus = ENABLED")
 .withCondition("Status = ENABLED")
 .withCondition("CampaignName CONTAINS_IGNORE_CASE 'AlwaysOn'") // ← Added
 .get();

 var results = [];

 while (adGroupIterator.hasNext()) {
 var adGroup = adGroupIterator.next();
 var adCount = adGroup.ads()
 .withCondition("Status = ENABLED")
 .get()
 .totalNumEntities();

 if (adCount > 1) {
 results.push({
 campaign: adGroup.getCampaign().getName(),
 adGroup: adGroup.getName(),
 adCount: adCount
 });
 }
 }

 // Always send email
 var emailSubject, emailBody;

 if (results.length > 0) {
 emailSubject = "⚠️ Google Ads Alert: " + results.length + " Ad Groups with Multiple Ads";
 emailBody = "Found " + results.length + " ad group(s) with more than 1 active ad:\n\n";

 for (var i = 0; i < results.length; i++) {
 emailBody += "Campaign: " + results[i].campaign + "\n";
 emailBody += "Ad Group: " + results[i].adGroup + "\n";
 emailBody += "Total Ads: " + results[i].adCount + "\n";
 emailBody += "---\n";
 }
 } else {
 emailSubject = "✅ Google Ads: All Clear - No Ad Groups with Multiple Ads";
 emailBody = "Script ran successfully.\n\n";
 emailBody += "No ad groups found with more than 1 active ad.\n";
 emailBody += "All active campaigns and ad groups are compliant.";
 }

 emailBody += "\n\nScript executed at: " + new Date();

 MailApp.sendEmail({
 to: "aayushi.sharma@dentsu.com", // ← CHANGE THIS
 subject: emailSubject,
 body: emailBody
 });

 Logger.log(results.length > 0 ? 
 "Email sent with " + results.length + " ad groups" : 
 "Email sent - no issues found");
 }