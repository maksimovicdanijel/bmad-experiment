import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportsDir = resolve(__dirname, '..', 'lighthouse-reports');

interface LighthouseAudit {
  score: number | null;
  scoreDisplayMode: string;
  title: string;
}

interface LighthouseCategory {
  score: number | null;
  auditRefs: Array<{ id: string }>;
}

interface LighthouseReport {
  categories: Record<string, LighthouseCategory>;
  audits: Record<string, LighthouseAudit>;
}

const SCORE_THRESHOLD = 0.9;

function loadReport(preset: string): LighthouseReport {
  const filePath = resolve(reportsDir, `${preset}-report.json`);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as LighthouseReport;
  } catch {
    console.error(`❌ Could not read report: ${filePath}`);
    process.exit(1);
  }
}

function checkCriticalFailures(
  report: LighthouseReport,
  preset: string,
): string[] {
  const failures: string[] = [];
  const accessibilityAuditIds = new Set(
    (report.categories.accessibility?.auditRefs ?? []).map((ref) => ref.id),
  );

  for (const [id, audit] of Object.entries(report.audits)) {
    if (!accessibilityAuditIds.has(id)) {
      continue;
    }

    if (audit.scoreDisplayMode === 'binary' && audit.score === 0) {
      failures.push(`[${preset}] Critical failure: ${id} — ${audit.title}`);
    }
  }
  return failures;
}

function run() {
  const presets = ['desktop', 'mobile'] as const;
  const accessibilityResults: Array<{
    preset: string;
    score: number;
    pass: boolean;
  }> = [];
  const informationalCategoryResults: Array<{
    preset: string;
    category: string;
    score: number;
  }> = [];
  const allCriticalFailures: string[] = [];

  for (const preset of presets) {
    const report = loadReport(preset);

    // Keep summary table info for all categories
    for (const [catName, cat] of Object.entries(report.categories)) {
      const score = cat.score ?? 0;
      informationalCategoryResults.push({ preset, category: catName, score });
    }

    // Enforce AC threshold only for accessibility category
    const accessibilityScore = report.categories.accessibility?.score ?? 0;
    accessibilityResults.push({
      preset,
      score: accessibilityScore,
      pass: accessibilityScore >= SCORE_THRESHOLD,
    });

    // Check critical binary audit failures
    const criticalFailures = checkCriticalFailures(report, preset);
    allCriticalFailures.push(...criticalFailures);
  }

  // Print summary table
  console.log('\n📊 Lighthouse Score Summary\n');
  console.log('| Category         | Desktop | Mobile  | Status |');
  console.log('|------------------|---------|---------|--------|');

  const categories = [
    ...new Set(informationalCategoryResults.map((r) => r.category)),
  ];
  for (const cat of categories) {
    const desktop = informationalCategoryResults.find(
      (r) => r.preset === 'desktop' && r.category === cat,
    );
    const mobile = informationalCategoryResults.find(
      (r) => r.preset === 'mobile' && r.category === cat,
    );
    const dScore = desktop ? `${Math.round(desktop.score * 100)}%` : 'N/A';
    const mScore = mobile ? `${Math.round(mobile.score * 100)}%` : 'N/A';
    const pass =
      cat === 'accessibility'
        ? accessibilityResults.every((r) => r.pass)
          ? '✅'
          : '❌'
        : 'ℹ️';
    console.log(
      `| ${cat.padEnd(16)} | ${dScore.padEnd(7)} | ${mScore.padEnd(7)} | ${pass.padEnd(6)} |`,
    );
  }

  console.log('');

  // Report critical failures
  if (allCriticalFailures.length > 0) {
    console.log('🚨 Critical Accessibility Failures:\n');
    for (const failure of allCriticalFailures) {
      console.log(`  ${failure}`);
    }
    console.log('');
  }

  // Determine pass/fail
  const allScoresPass = accessibilityResults.every((r) => r.pass);
  const noCriticalFailures = allCriticalFailures.length === 0;

  if (allScoresPass && noCriticalFailures) {
    console.log('✅ All Lighthouse assertions passed!\n');
    process.exit(0);
  } else {
    if (!allScoresPass) {
      const failing = accessibilityResults.filter((r) => !r.pass);
      console.log('❌ Score threshold failures:');
      for (const f of failing) {
        console.log(
          `  ${f.preset}/accessibility: ${Math.round(f.score * 100)}% (need ≥${Math.round(SCORE_THRESHOLD * 100)}%)`,
        );
      }
    }
    if (!noCriticalFailures) {
      console.log(
        `❌ ${allCriticalFailures.length} critical accessibility failure(s) found.`,
      );
    }
    console.log('');
    process.exit(1);
  }
}

run();
