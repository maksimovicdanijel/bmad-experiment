import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportsDir = resolve(__dirname, '..', 'lighthouse-reports');

interface LighthouseSettings {
  onlyCategories: string[];
  maxWaitForFcp: number;
  maxWaitForLoad: number;
  throttlingMethod: 'provided' | 'simulate' | 'devtools';
  throttling: {
    rttMs: number;
    throughputKbps: number;
    cpuSlowdownMultiplier: number;
    requestLatencyMs: number;
    downloadThroughputKbps: number;
    uploadThroughputKbps: number;
  };
  formFactor?: 'desktop' | 'mobile';
  screenEmulation?: {
    mobile: boolean;
    width: number;
    height: number;
    deviceScaleFactor: number;
    disabled: boolean;
  };
}

interface LighthouseConfig {
  extends: string;
  settings: LighthouseSettings;
}

function getPreset(): 'desktop' | 'mobile' {
  const args = process.argv.slice(2);
  const presetArg = args.find((a) => a.startsWith('--preset='));
  if (!presetArg) {
    console.error(
      'Usage: tsx scripts/run-lighthouse.ts --preset=desktop|mobile',
    );
    process.exit(1);
  }
  const preset = presetArg.split('=')[1];
  if (preset !== 'desktop' && preset !== 'mobile') {
    console.error(`Invalid preset "${preset}". Must be "desktop" or "mobile".`);
    process.exit(1);
  }
  return preset;
}

async function run() {
  const preset = getPreset();
  const url = 'http://localhost:5173';

  // Ensure reports directory exists
  mkdirSync(reportsDir, { recursive: true });

  console.log(`\n🔦 Running Lighthouse (${preset})...\n`);
  console.log(`  URL: ${url}`);
  console.log(`  Output: ${reportsDir}/${preset}-report.{json,html}\n`);

  // Pre-flight: verify dev server is reachable
  try {
    await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(`❌ Dev server not reachable at ${url}`);
    console.error('   Start it first: npm run dev -w apps/web');
    process.exit(1);
  }

  // Use Playwright's bundled Chromium for reliable headless automation
  const chromePath = chromium.executablePath();

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const config: LighthouseConfig = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['accessibility', 'best-practices'],
        maxWaitForFcp: 30000,
        maxWaitForLoad: 45000,
        // Network/CPU throttling disabled for local dev server reliability.
        // Mobile still uses Moto G Power screen emulation (Lighthouse default);
        // only simulated network latency is zeroed — this does not affect
        // accessibility or best-practices scores.
        throttlingMethod: 'provided',
        throttling: {
          rttMs: 0,
          throughputKbps: 0,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    };

    if (preset === 'desktop') {
      config.settings = {
        ...config.settings,
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      };
    }

    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: ['json', 'html'],
      },
      config as Parameters<typeof lighthouse>[2],
    );

    if (!result) {
      throw new Error('Lighthouse returned no result');
    }

    const [jsonReport, htmlReport] = result.report as string[];

    writeFileSync(resolve(reportsDir, `${preset}-report.json`), jsonReport);
    writeFileSync(resolve(reportsDir, `${preset}-report.html`), htmlReport);

    console.log(`\n✅ Lighthouse ${preset} report generated successfully.`);
  } catch (error) {
    console.error(`\n❌ Lighthouse ${preset} audit failed.`);
    console.error(error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

run();
