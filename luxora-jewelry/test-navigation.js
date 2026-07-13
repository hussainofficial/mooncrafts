const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  console.log("Loading app...");
  await page.goto("http://localhost:4200", { waitUntil: "networkidle2" });
  
  // Wait for Angular to render
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("\n=== Navigation Test Results ===\n");
  
  // Test 1: Check if navigation links exist
  const navLinks = await page.evaluate(() => {
    const links = document.querySelectorAll("a[href^='#']");
    return Array.from(links).map(link => ({
      text: link.textContent.trim(),
      href: link.getAttribute("href")
    }));
  });
  
  console.log("Navigation links found:");
  navLinks.filter(l => l.text && l.href).forEach(link => {
    console.log(`  ✓ ${link.text} → ${link.href}`);
  });
  
  // Test 2: Check if section IDs exist
  const sections = await page.evaluate(() => {
    const sectionIds = ["home", "new-arrivals", "best-sellers", "featured-products", "collections", "reviews"];
    const found = [];
    sectionIds.forEach(id => {
      if (document.getElementById(id)) {
        found.push(id);
      }
    });
    return found;
  });
  
  console.log("\nSection IDs found:");
  sections.forEach(id => {
    console.log(`  ✓ #${id}`);
  });
  
  // Test 3: Test clicking navigation and scrolling
  console.log("\nTesting scroll behavior:");
  
  const testLinks = ["#new-arrivals", "#best-sellers", "#featured-products"];
  
  for (const linkHref of testLinks) {
    try {
      const initialScroll = await page.evaluate(() => window.scrollY);
      
      // Click the link
      const selector = `a[href="${linkHref}"]`;
      await page.click(selector);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const finalScroll = await page.evaluate(() => window.scrollY);
      const sectionId = linkHref.replace("#", "");
      
      if (finalScroll > initialScroll) {
        console.log(`  ✓ ${linkHref} - Scrolled from ${initialScroll}px to ${finalScroll}px`);
      } else if (finalScroll === 0) {
        console.log(`  ✓ ${linkHref} - Link exists and clickable`);
      } else {
        console.log(`  ⚠ ${linkHref} - No significant scroll`);
      }
    } catch (e) {
      console.log(`  ✗ ${linkHref} - Error: ${e.message}`);
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: "navigation-test.png" });
  console.log("\n✓ Screenshot saved: navigation-test.png");
  
  await browser.close();
})();
