const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  console.log("Loading app...");
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });
  
  // Wait for Angular to render
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("\n=== Mega Menu Navigation Test ===\n");
  
  // Test mega menu links
  const megaMenuLinks = [
    { text: "Silver Jewelry", href: "#silver-jewelry" },
    { text: "Kundan Jewelry", href: "#kundan-jewelry" },
    { text: "Artificial Jewelry", href: "#artificial-jewelry" },
    { text: "Necklaces", href: "#necklaces" },
    { text: "Earrings", href: "#earrings" },
    { text: "Rings", href: "#rings" },
    { text: "Bracelets", href: "#bracelets" },
    { text: "Trending Now", href: "#trending" },
    { text: "New Arrivals", href: "#new-arrivals" },
    { text: "Best Sellers", href: "#best-sellers" }
  ];
  
  console.log("Testing Mega Menu Links:");
  
  for (const link of megaMenuLinks) {
    try {
      const initialScroll = await page.evaluate(() => window.scrollY);
      
      // Click the link
      const selector = `a[href="${link.href}"]`;
      await page.click(selector);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const finalScroll = await page.evaluate(() => window.scrollY);
      
      if (finalScroll > initialScroll || (initialScroll === 0 && finalScroll > 0)) {
        console.log(`  ✓ ${link.text} → ${link.href}`);
      } else {
        console.log(`  ⚠ ${link.text} → ${link.href} (no scroll detected)`);
      }
    } catch (e) {
      console.log(`  ✗ ${link.text} → ${link.href}`);
    }
  }
  
  console.log("\n✓ Mega menu navigation test complete!");
  
  await browser.close();
})();
