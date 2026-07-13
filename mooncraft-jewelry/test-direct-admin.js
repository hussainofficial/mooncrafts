const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  console.log("Testing Admin Dashboard Access\n");
  
  // First, navigate to login
  console.log("1️⃣  Navigating to login page...");
  await page.goto("http://localhost:4200/login");
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill admin form
  console.log("2️⃣  Filling admin form...");
  const inputs = await page.$$("input");
  if (inputs.length >= 2) {
    await inputs[0].type("admin@example.com", { delay: 50 });
    await inputs[1].type("admin", { delay: 50 });
  }
  
  // Click submit
  console.log("3️⃣  Submitting login...");
  await Promise.all([
    page.waitForNavigation({ timeout: 3000 }).catch(() => {}),
    page.click("button[type='submit']")
  ]);
  
  await new Promise(r => setTimeout(r, 1500));
  
  let url = page.url();
  console.log("\n4️⃣  After login - URL:", url);
  
  // Now navigate to /admin
  console.log("\n5️⃣  Navigating to /admin...");
  await page.goto("http://localhost:4200/admin");
  
  url = page.url();
  console.log("Final URL:", url);
  
  const pageHTML = await page.content();
  console.log("\n6️⃣  Checking for admin dashboard content:");
  console.log("   Has 'MOONCRAFT Admin':", pageHTML.includes("MOONCRAFT Admin") ? "✓" : "✗");
  console.log("   Has 'Products':", pageHTML.includes("Products") ? "✓" : "✗");
  console.log("   Has 'Add Product':", pageHTML.includes("Add Product") ? "✓" : "✗");
  console.log("   Has 'Products' table:", pageHTML.includes("<table") ? "✓" : "✗");
  
  await browser.close();
})();
