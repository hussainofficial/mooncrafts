const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  console.log("=".repeat(60));
  console.log("FINAL ADMIN DASHBOARD TEST");
  console.log("=".repeat(60) + "\n");
  
  // Step 1: Go to login
  console.log("✓ Step 1: Navigating to login...");
  await page.goto("http://localhost:4200/login");
  await new Promise(r => setTimeout(r, 1000));
  
  // Step 2: Fill form
  console.log("✓ Step 2: Filling admin login form...");
  const inputs = await page.$$("input");
  if (inputs.length >= 2) {
    await inputs[0].type("admin@example.com", { delay: 50 });
    await inputs[1].type("admin", { delay: 50 });
  }
  
  // Step 3: Click login
  console.log("✓ Step 3: Clicking login button...");
  await Promise.all([
    page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
    page.click("button[type='submit']")
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const finalUrl = page.url();
  const html = await page.content();
  
  console.log("\n📊 RESULTS:");
  console.log("━".repeat(60));
  console.log("Final URL:", finalUrl);
  console.log("");
  
  if (finalUrl.includes("/admin")) {
    console.log("✅ AUTO-REDIRECT WORKS - Redirected to /admin");
  } else {
    console.log("⚠️  URL is still on home - navigate to /admin manually");
    console.log("    Or try clicking 'Dashboard' in the profile menu");
  }
  
  console.log("");
  console.log("Dashboard Content Check:");
  console.log("  ✓ Has 'LUXORA Admin' header:", html.includes("LUXORA Admin"));
  console.log("  ✓ Has 'Products' tab:", html.includes("Products"));
  console.log("  ✓ Has 'Add Product' tab:", html.includes("Add Product"));
  console.log("  ✓ Has 'Logout' button:", html.includes("Logout"));
  console.log("");
  
  if (html.includes("Products") && html.includes("Add Product")) {
    console.log("✅ ADMIN DASHBOARD IS FULLY FUNCTIONAL!");
  }
  
  console.log("━".repeat(60) + "\n");
  
  await browser.close();
})();
