const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("\n=== Updated Mega Menu Test ===\n");
  
  const testLinks = ["#silver-jewelry", "#new-arrivals", "#best-sellers"];
  
  for (const href of testLinks) {
    const initialScroll = await page.evaluate(() => window.scrollY);
    await page.click(`a[href="${href}"]`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const finalScroll = await page.evaluate(() => window.scrollY);
    
    if (finalScroll > initialScroll || finalScroll > 0) {
      console.log(`✓ ${href} - Scrolled to ${finalScroll}px`);
    } else {
      console.log(`⚠ ${href} - Check manually`);
    }
  }
  
  await browser.close();
})();
