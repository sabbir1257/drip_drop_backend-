#!/usr/bin/env node
/**
 * Google Sheets Configuration Validator
 *
 * This script validates your Google Sheets configuration
 * and provides specific guidance on fixing issues.
 */

require("dotenv").config();
const { google } = require("googleapis");

async function validateConfiguration() {
  console.log("🔍 Validating Google Sheets Configuration...\n");

  // Step 1: Check environment variables
  console.log("Step 1: Checking environment variables...");

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  let hasErrors = false;

  if (!serviceAccountEmail) {
    console.error("  ❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is missing");
    hasErrors = true;
  } else {
    console.log("  ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL:", serviceAccountEmail);
  }

  if (!privateKey) {
    console.error("  ❌ GOOGLE_PRIVATE_KEY is missing");
    hasErrors = true;
  } else if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("  ❌ GOOGLE_PRIVATE_KEY format is invalid");
    console.error('     It should start with "-----BEGIN PRIVATE KEY-----"');
    hasErrors = true;
  } else {
    console.log("  ✓ GOOGLE_PRIVATE_KEY is present and formatted correctly");
  }

  if (!sheetId) {
    console.error("  ❌ GOOGLE_SHEET_ID is missing");
    hasErrors = true;
  } else {
    console.log("  ✓ GOOGLE_SHEET_ID:", sheetId);
  }

  if (hasErrors) {
    console.log(
      "\n❌ Configuration is incomplete. Please fix the issues above.\n"
    );
    process.exit(1);
  }

  console.log("  ✓ All environment variables are present\n");

  // Step 2: Test authentication
  console.log("Step 2: Testing Google API authentication...");

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    console.log("  ✓ Authentication successful\n");

    // Step 3: Verify sheet exists and is accessible
    console.log("Step 3: Verifying Google Sheet access...");
    console.log("  Checking Sheet ID:", sheetId);

    try {
      const sheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      console.log("  ✓ Sheet found:", sheetResponse.data.properties.title);
      console.log("  ✓ Sheet is accessible\n");

      // Step 4: Check permissions
      console.log("Step 4: Checking sheet properties...");
      console.log("  Sheets in workbook:");
      sheetResponse.data.sheets.forEach((sheet) => {
        console.log("    -", sheet.properties.title);
      });

      console.log("\n✅ All checks passed! Your configuration is correct.\n");
      console.log("📊 Sheet Details:");
      console.log("  Name:", sheetResponse.data.properties.title);
      console.log("  URL:", sheetResponse.data.spreadsheetUrl);
      console.log("  Locale:", sheetResponse.data.properties.locale);
      console.log("\n🎉 You're ready to sync orders!\n");
    } catch (sheetError) {
      console.error("\n❌ Sheet verification failed:", sheetError.message);

      if (sheetError.message.includes("not found")) {
        console.error("\n🔧 How to fix:");
        console.error("  1. Double-check your GOOGLE_SHEET_ID in .env file");
        console.error("     Current ID:", sheetId);
        console.error("\n  2. Get the correct Sheet ID from the URL:");
        console.error(
          "     URL format: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit"
        );
        console.error(
          "     Example: If URL is https://docs.google.com/spreadsheets/d/1abc123xyz/edit"
        );
        console.error("     Then SHEET_ID is: 1abc123xyz");
        console.error("\n  3. Make sure the Google Sheet exists");
        console.error(
          "     Go to: https://docs.google.com/spreadsheets/d/" + sheetId
        );
        console.error("\n  4. Share the sheet with your service account:");
        console.error("     Email:", serviceAccountEmail);
        console.error("     Permission: Editor");
        console.error("     Steps:");
        console.error("       a. Open the Google Sheet");
        console.error('       b. Click "Share" button (top right)');
        console.error("       c. Add service account email");
        console.error('       d. Set permission to "Editor"');
        console.error('       e. Uncheck "Notify people"');
        console.error('       f. Click "Share"');
      } else if (sheetError.message.includes("permission")) {
        console.error("\n🔧 How to fix:");
        console.error(
          "  The sheet exists but the service account doesn't have access."
        );
        console.error("  Share the sheet with:", serviceAccountEmail);
        console.error('  With "Editor" permission');
      }

      console.log("\n");
      process.exit(1);
    }
  } catch (authError) {
    console.error("\n❌ Authentication failed:", authError.message);
    console.error("\n🔧 How to fix:");
    console.error("  1. Verify your GOOGLE_PRIVATE_KEY in .env");
    console.error(
      "  2. Make sure it includes \\n characters (not actual line breaks)"
    );
    console.error("  3. It should be wrapped in quotes");
    console.error(
      '  4. Format: GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
    );
    console.log("\n");
    process.exit(1);
  }
}

// Run validation
validateConfiguration().catch((error) => {
  console.error("\n❌ Unexpected error:", error.message);
  console.error("\nStack trace:", error.stack);
  process.exit(1);
});
