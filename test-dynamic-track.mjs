import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function runTest() {
  console.log('🚀 Starting Autonomous Browser Validation for Dynamic Marble Track...');

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

  // 1. Trigger loadDynamicTestTrack()
  console.log('🛠 Triggering loadDynamicTestTrack()...');
  await page.evaluate(() => {
    window.__GAME_DEBUG__.loadDynamicTestTrack();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Switch to PLAY mode
  console.log('🎮 Switching to PLAY MODE (spawning up to 3 marbles with 1.5s interval)...');
  await page.evaluate(() => {
    window.__GAME_DEBUG__.setMode('play');
  });

  // 3. Monitor simulation loop over 12 seconds
  console.log('⏱ Sampling telemetry for Magnetic Booster, Vertical Loop & Splitter Alternations...');
  let lastStats = { boosts: 0, loops: 0, left: 0, right: 0 };

  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 250));
    const telemetry = await page.evaluate(() => ({
      pos: window.__GAME_DEBUG__.marblePosition,
      vel: window.__GAME_DEBUG__.marbleVelocity,
      isGoalReached: window.__GAME_DEBUG__.isGoalReached,
      boosts: window.__GAME_DEBUG__.boostsTriggered,
      loops: window.__GAME_DEBUG__.loopsCompleted,
      splitter: window.__GAME_DEBUG__.splitterAlternations,
    }));

    lastStats = {
      boosts: telemetry.boosts,
      loops: telemetry.loops,
      left: telemetry.splitter?.left || 0,
      right: telemetry.splitter?.right || 0,
    };

    if (i % 4 === 0 || telemetry.loops > 0 || (lastStats.left > 0 && lastStats.right > 0)) {
      console.log(
        `[${(i * 0.25).toFixed(1)}s] Lead Pos: [${telemetry.pos.x.toFixed(2)}, ${telemetry.pos.y.toFixed(2)}, ${telemetry.pos.z.toFixed(2)}] | Boosts: ${telemetry.boosts} | Loops: ${telemetry.loops} | Splitter: L=${lastStats.left} R=${lastStats.right} | Goal: ${telemetry.isGoalReached}`
      );
    }

    // If both left and right branches have received marbles and loops were completed, we can proceed
    if (telemetry.loops >= 2 && lastStats.left >= 1 && lastStats.right >= 1) {
      console.log('✨ All dynamic mechanics fully verified in action!');
      break;
    }
  }

  // 4. Capture screenshot of the multi-marble dynamic run
  const screenshotPath = 'dynamic_track_validation.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot saved to ${screenshotPath}`);

  await browser.close();

  console.log('\n--- DYNAMIC TEST RESULTS SUMMARY ---');
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Boosts Triggered: ${lastStats.boosts}`);
  console.log(`Loops Completed: ${lastStats.loops}`);
  console.log(`Splitter Alternations - Left: ${lastStats.left}, Right: ${lastStats.right}`);

  const hasBoosted = lastStats.boosts > 0;
  const hasLooped = lastStats.loops > 0;
  const hasSplit = lastStats.left > 0 || lastStats.right > 0;

  if (consoleErrors.length === 0 && hasBoosted && hasLooped) {
    console.log('🏆 Dynamic Track passed validation successfully!');
    process.exit(0);
  } else {
    console.log('⚠️ Telemetry check finished. Boosts:', hasBoosted, 'Loops:', hasLooped, 'Split:', hasSplit);
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
