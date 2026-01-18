#!/usr/bin/env node
// ============================================================================
// CHECK-UNICODE - Scan for hidden/bidirectional Unicode characters
// ============================================================================
// Usage:
//   node scripts/check-unicode.mjs          # Check only (exit 1 if issues)
//   node scripts/check-unicode.mjs --fix    # Fix issues automatically
// ============================================================================

import fs from 'fs/promises';
import path from 'path';

// Hidden/problematic Unicode characters to detect
const PROBLEMATIC_CHARS = [
  { char: '\u200B', name: 'Zero Width Space', hex: 'U+200B' },
  { char: '\u200C', name: 'Zero Width Non-Joiner', hex: 'U+200C' },
  { char: '\u200D', name: 'Zero Width Joiner', hex: 'U+200D' },
  { char: '\u200E', name: 'Left-to-Right Mark', hex: 'U+200E' },
  { char: '\u200F', name: 'Right-to-Left Mark', hex: 'U+200F' },
  { char: '\u202A', name: 'Left-to-Right Embedding', hex: 'U+202A' },
  { char: '\u202B', name: 'Right-to-Left Embedding', hex: 'U+202B' },
  { char: '\u202C', name: 'Pop Directional Formatting', hex: 'U+202C' },
  { char: '\u202D', name: 'Left-to-Right Override', hex: 'U+202D' },
  { char: '\u202E', name: 'Right-to-Left Override', hex: 'U+202E' },
  { char: '\u2060', name: 'Word Joiner', hex: 'U+2060' },
  { char: '\u2061', name: 'Function Application', hex: 'U+2061' },
  { char: '\u2062', name: 'Invisible Times', hex: 'U+2062' },
  { char: '\u2063', name: 'Invisible Separator', hex: 'U+2063' },
  { char: '\u2064', name: 'Invisible Plus', hex: 'U+2064' },
  { char: '\u206A', name: 'Inhibit Symmetric Swapping', hex: 'U+206A' },
  { char: '\u206B', name: 'Activate Symmetric Swapping', hex: 'U+206B' },
  { char: '\u206C', name: 'Inhibit Arabic Form Shaping', hex: 'U+206C' },
  { char: '\u206D', name: 'Activate Arabic Form Shaping', hex: 'U+206D' },
  { char: '\u206E', name: 'National Digit Shapes', hex: 'U+206E' },
  { char: '\u206F', name: 'Nominal Digit Shapes', hex: 'U+206F' },
  { char: '\uFEFF', name: 'Byte Order Mark (BOM)', hex: 'U+FEFF' },
];

// Build regex pattern
const PATTERN = new RegExp(
  '[' + PROBLEMATIC_CHARS.map(c => c.char).join('') + ']',
  'g'
);

// Directories to scan
const SCAN_DIRS = [
  'src',
  'factory',
  'ventures',
];

// File extensions to check
const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.jsx', '.md', '.json'];

// Files/dirs to skip
const SKIP = ['node_modules', '.next', '.git', 'dist', 'build'];

/**
 * Get all files in directory recursively
 */
async function getFiles(dir) {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded directories
      if (SKIP.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        const subFiles = await getFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }

  return files;
}

/**
 * Check a single file for problematic characters
 */
async function checkFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const issues = [];

  let match;
  while ((match = PATTERN.exec(content)) !== null) {
    const charInfo = PROBLEMATIC_CHARS.find(c => c.char === match[0]);
    const lineNum = content.substring(0, match.index).split('\n').length;
    const colNum = match.index - content.lastIndexOf('\n', match.index - 1);

    issues.push({
      char: charInfo?.hex || 'Unknown',
      name: charInfo?.name || 'Unknown',
      line: lineNum,
      column: colNum,
    });
  }

  return issues;
}

/**
 * Fix a single file by removing problematic characters
 */
async function fixFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const cleaned = content.replace(PATTERN, '');

  if (content !== cleaned) {
    await fs.writeFile(filePath, cleaned, 'utf-8');
    return true;
  }

  return false;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');

  console.log('Unicode Character Scanner');
  console.log('=========================');
  console.log(`Mode: ${shouldFix ? 'FIX' : 'CHECK'}\n`);

  // Collect all files
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const files = await getFiles(dir);
    allFiles.push(...files);
  }

  console.log(`Scanning ${allFiles.length} files...\n`);

  let totalIssues = 0;
  let filesWithIssues = 0;
  let filesFixed = 0;

  for (const file of allFiles) {
    const issues = await checkFile(file);

    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;

      console.log(`\x1b[31m[ISSUE]\x1b[0m ${file}`);
      for (const issue of issues) {
        console.log(`  Line ${issue.line}, Col ${issue.column}: ${issue.name} (${issue.char})`);
      }

      if (shouldFix) {
        const fixed = await fixFile(file);
        if (fixed) {
          filesFixed++;
          console.log(`  \x1b[32m[FIXED]\x1b[0m`);
        }
      }
    }
  }

  console.log('\n=========================');
  console.log(`Files scanned: ${allFiles.length}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total issues: ${totalIssues}`);

  if (shouldFix) {
    console.log(`Files fixed: ${filesFixed}`);
  }

  if (totalIssues > 0 && !shouldFix) {
    console.log('\n\x1b[33mRun with --fix to automatically remove problematic characters.\x1b[0m');
    process.exit(1);
  }

  if (totalIssues === 0) {
    console.log('\n\x1b[32mNo issues found!\x1b[0m');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
