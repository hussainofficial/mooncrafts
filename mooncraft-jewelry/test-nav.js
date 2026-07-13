const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Load the app
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  console.log('✓ App loaded');
  
  // Get initial scroll position
  let scrollY = await page.evaluate(() => window.scrollY);
  console.log(`Initial scroll position: ${scrollY}px`);
  
  // Test 1: Click "New Arrivals" link
  console.log('\n--- Test 1: Clicking "New Arrivals" ---');
  await page.click('a[href="#new-arrivals"]');
  await page.waitForTimeout(1000); // Wait for smooth scroll
  scrollY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position after clicking "New Arrivals": ${scrollY}px`);
  const newArrivalsVisible = await page.evaluate(() => {
    const el = document.getElementById('new-arrivals');
    return el ? 'Found' : 'Not found';
  });
  console.log(`New Arrivals section: ${newArrivalsVisible}`);
  
  // Test 2: Click "Best Sellers" link
  console.log('\n--- Test 2: Clicking "Best Sellers" ---');
  await page.click('a[href="#best-sellers"]');
  await page.waitForTimeout(1000);
  scrollY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position after clicking "Best Sellers": ${scrollY}px`);
  const bestSellersVisible = await page.evaluate(() => {
    const el = document.getElementById('best-sellers');
    return el ? 'Found' : 'Not found';
  });
  console.log(`Best Sellers section: ${bestSellersVisible}`);
  
  // Test 3: Click "Featured" link
  console.log('\n--- Test 3: Clicking "Featured" ---');
  await page.click('a[href="#featured-products"]');
  await page.waitForTimeout(1000);
  scrollY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position after clicking "Featured": ${scrollY}px`);
  const featuredVisible = await page.evaluate(() => {
    const el = document.getElementById('featured-products');
    return el ? 'Found' : 'Not found';
  });
  console.log(`Featured Products section: ${featuredVisible}`);
  
  // Test 4: Click "Collections" link
  console.log('\n--- Test 4: Clicking "Collections" ---');
  await page.click('a[href="#collections"]');
  await page.waitForTimeout(1000);
  scrollY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll position after clicking "Collections": ${scrollY}px`);
  
  // Take screenshot
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('\n✓ Screenshot saved: test-screenshot.png');
  
  await browser.close();
})();
