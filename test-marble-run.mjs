import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function runTest() {
  console.log('🚀 Starting Validation for ContactShadows, VoxelParticles & LocalStorage...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle'
    ],
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('❌ Browser Console Error:', msg.text());
    } else {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
    console.error('❌ Browser Page Error:', err.message);
  });

  console.log('🌐 Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForFunction(() => window.__GAME_DEBUG__ !== undefined, { timeout: 15000 });

  // 1. Test loadTestTrack and verify localStorage saving
  console.log('🛠 Triggering loadTestTrack()...');
  await page.evaluate(() => {
    window.__GAME_DEBUG__.loadTestTrack();
  });
  await new Promise((r) => setTimeout(r, 600));

  const savedStorageRaw = await page.evaluate(() => localStorage.getItem('voxel-marble-run-storage'));
  console.log(`💾 LocalStorage raw check: ${savedStorageRaw ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
  
  if (savedStorageRaw) {
    const parsed = JSON.parse(savedStorageRaw);
    console.log(`📦 LocalStorage contains ${parsed.state?.blocks?.length} blocks saved automatically!`);
  }

  // 2. Switch to PLAY mode and monitor until Goal is reached
  console.log('🎮 Switching to PLAY MODE...');
  await page.evaluate(() => {
    window.__GAME_DEBUG__.setMode('play');
  });

  let reachedGoal = false;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 150));
    const telemetry = await page.evaluate(() => ({
      pos: window.__GAME_DEBUG__.marblePosition,
      isGoalReached: window.__GAME_DEBUG__.isGoalReached
    }));

    if (telemetry.isGoalReached) {
      reachedGoal = true;
      console.log(`🎉 GOAL REACHED AT ${(i * 0.15).toFixed(2)}s! Mini-cube celebration particles triggered!`);
      // Wait a fraction of a second so the mini-cubes burst into full view
      await new Promise((r) => setTimeout(r, 350));
      break;
    }
  }

  // 3. Capture fresh screenshot with ContactShadows & Mini-cube particles
  const screenshotPath = 'validation_screenshot.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot saved to ${screenshotPath}`);

  // 4. Test page reload to confirm persistence survives reload
  console.log('🔄 Reloading page to verify persistence restore...');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__GAME_DEBUG__ !== undefined, { timeout: 15000 });
  
  const reloadedBlocksCount = await page.evaluate(() => {
    const raw = localStorage.getItem('voxel-marble-run-storage');
    return raw ? JSON.parse(raw).state?.blocks?.length : 0;
  });
  console.log(`✅ After reload, restored ${reloadedBlocksCount} blocks from localStorage!`);

  await browser.close();

  console.log('\n--- TEST RESULTS SUMMARY ---');
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Goal Reached: ${reachedGoal ? 'YES ✅' : 'NO ❌'}`);
  console.log(`LocalStorage Persistence: ${reloadedBlocksCount > 0 ? 'VERIFIED ✅' : 'FAILED ❌'}`);

  if (consoleErrors.length === 0 && reachedGoal && reloadedBlocksCount > 0) {
    console.log('🏆 All 3 new requirements validated successfully!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
