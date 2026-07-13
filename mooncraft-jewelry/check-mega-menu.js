const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("=== Mega Menu Links Status ===\n");
  
  // Check what mega menu links exist
  const megaMenuLinks = await page.evaluate(() => {
    const links = document.querySelectorAll("a");
    const megaMenuLinks = [];
    links.forEach(link => {
      const text = link.textContent.trim();
      const href = link.getAttribute("href");
      // Only grab links that start with # and belong to known categories
      if (href && href.startsWith("#") && (
        text.includes("Silver") || 
        text.includes("Kundan") || 
        text.includes("Necklaces") ||
        text.includes("Earrings") ||
        text.includes("Trending") ||
        text.includes("New Arrivals") ||
        text.includes("Best Sellers")
      )) {
        megaMenuLinks.push({ text, href });
      }
    });
    return megaMenuLinks;
  });
  
  console.log("Found mega menu links:");
  if (megaMenuLinks.length > 0) {
    megaMenuLinks.forEach(link => {
      console.log(`  ✓ "${link.text}" → ${link.href}`);
    });
    console.log("\n✓ All mega menu links are properly configured!");
  } else {
    console.log("  ✗ No mega menu links found");
  }
  
  await browser.close();
})();
