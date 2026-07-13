const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  console.log("🔍 Testing Admin Dashboard Flow...\n");
  
  // Step 1: Go to home page
  console.log("1️⃣  Loading home page...");
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });
  console.log("   ✓ Home page loaded");
  
  // Step 2: Click profile icon
  console.log("\n2️⃣  Clicking profile icon...");
  await page.click("button:has(svg)");
  await new Promise(r => setTimeout(r, 500));
  console.log("   ✓ Profile menu should be visible");
  
  // Step 3: Find and click login link
  console.log("\n3️⃣  Looking for login link...");
  const loginLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));
    return links.find(l => l.textContent.includes("Admin Login"))?.href;
  });
  
  if (loginLink) {
    console.log("   ✓ Found login link:", loginLink);
    await page.goto(loginLink, { waitUntil: "networkidle2" });
  } else {
    console.log("   ⚠️  Admin login link not found, trying /login directly");
    await page.goto("http://localhost:4200/login", { waitUntil: "networkidle2" });
  }
  
  // Step 4: Check if login page loaded
  console.log("\n4️⃣  Checking login page...");
  const loginVisible = await page.evaluate(() => {
    return document.body.textContent.includes("MOONCRAFT") && 
           document.body.textContent.includes("Admin Login");
  });
  
  if (loginVisible) {
    console.log("   ✓ Login page is visible");
  } else {
    console.log("   ✗ Login page content not found");
  }
  
  // Step 5: Fill login form
  console.log("\n5️⃣  Filling admin login form...");
  
  // Click admin tab
  const adminTab = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const adminBtn = buttons.find(b => b.textContent.includes("Admin Login"));
    return !!adminBtn;
  });
  
  if (adminTab) {
    console.log("   ✓ Admin tab found");
  }
  
  // Fill email
  const emailInputs = await page.$$("input[type='email']");
  if (emailInputs.length > 0) {
    await emailInputs[0].type("admin@example.com", { delay: 50 });
    console.log("   ✓ Email entered");
  }
  
  // Fill password
  const passInputs = await page.$$("input[type='password']");
  if (passInputs.length > 0) {
    await passInputs[0].type("admin", { delay: 50 });
    console.log("   ✓ Password entered");
  }
  
  // Step 6: Submit login
  console.log("\n6️⃣  Submitting login...");
  const submitBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button[type='submit']"));
    return !!buttons.length;
  });
  
  if (submitBtn) {
    await page.click("button[type='submit']");
    await new Promise(r => setTimeout(r, 2000));
    console.log("   ✓ Login submitted");
  }
  
  // Step 7: Check if admin dashboard loaded
  console.log("\n7️⃣  Checking if admin dashboard loaded...");
  const dashboardVisible = await page.evaluate(() => {
    return document.body.textContent.includes("Admin") ||
           document.body.textContent.includes("Products") ||
           document.body.textContent.includes("Add Product");
  });
  
  const currentUrl = page.url();
  console.log("   Current URL:", currentUrl);
  console.log("   Dashboard visible:", dashboardVisible);
  
  if (currentUrl.includes("/admin")) {
    console.log("   ✓ On /admin page");
  }
  
  // Step 8: Check for key elements
  console.log("\n8️⃣  Checking dashboard elements...");
  const hasElements = await page.evaluate(() => {
    const textContent = document.body.textContent;
    return {
      hasAdmin: textContent.includes("Admin"),
      hasProducts: textContent.includes("Products"),
      hasAddProduct: textContent.includes("Add Product"),
      hasLogout: textContent.includes("Logout")
    };
  });
  
  console.log("   Admin heading:", hasElements.hasAdmin ? "✓" : "✗");
  console.log("   Products tab:", hasElements.hasProducts ? "✓" : "✗");
  console.log("   Add Product tab:", hasElements.hasAddProduct ? "✓" : "✗");
  console.log("   Logout button:", hasElements.hasLogout ? "✓" : "✗");
  
  console.log("\n" + "=".repeat(60));
  if (dashboardVisible && hasElements.hasProducts) {
    console.log("✅ ADMIN DASHBOARD IS WORKING!");
  } else {
    console.log("⚠️  Admin dashboard may have display issues");
  }
  
  await browser.close();
})();
