// ============================================================================
// APPLY PATCH - Parses Claude response and applies file changes
// ============================================================================

import fs from 'fs/promises';
import path from 'path';

/**
 * Parse Claude response and apply file changes
 *
 * @param {string} response - Claude API response
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<{created: string[], updated: string[], deleted: string[]}>}
 */
export default async function applyPatch(response, projectRoot) {
  const changes = {
    created: [],
    updated: [],
    deleted: [],
  };

  // Parse CREATE operations
  const createRegex = /### CREATE: (.+?)\n```(\w+)?\n([\s\S]+?)```/g;
  let match;

  while ((match = createRegex.exec(response)) !== null) {
    const filePath = match[1].trim();
    const content = match[3].trim();

    await createFile(projectRoot, filePath, content);
    changes.created.push(filePath);
    console.log(`  ✓ Created: ${filePath}`);
  }

  // Parse EDIT operations (unified diff format)
  const editRegex = /### EDIT: (.+?)\n```patch\n([\s\S]+?)```/g;

  while ((match = editRegex.exec(response)) !== null) {
    const filePath = match[1].trim();
    const patchContent = match[2].trim();

    await editFile(projectRoot, filePath, patchContent);
    changes.updated.push(filePath);
    console.log(`  ✓ Updated: ${filePath}`);
  }

  // Parse DELETE operations
  const deleteRegex = /### DELETE: (.+?)\n/g;

  while ((match = deleteRegex.exec(response)) !== null) {
    const filePath = match[1].trim();

    await deleteFile(projectRoot, filePath);
    changes.deleted.push(filePath);
    console.log(`  ✓ Deleted: ${filePath}`);
  }

  return changes;
}

/**
 * Create a new file
 */
async function createFile(projectRoot, filePath, content) {
  const fullPath = path.join(projectRoot, filePath);
  const dir = path.dirname(fullPath);

  // Create directory if it doesn't exist
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Edit an existing file using unified diff
 */
async function editFile(projectRoot, filePath, patchContent) {
  const fullPath = path.join(projectRoot, filePath);

  // Read original file
  let originalContent;
  try {
    originalContent = await fs.readFile(fullPath, 'utf-8');
  } catch {
    throw new Error(`File not found for editing: ${filePath}`);
  }

  // Apply patch
  const newContent = applyUnifiedDiff(originalContent, patchContent);

  // Write updated file
  await fs.writeFile(fullPath, newContent, 'utf-8');
}

/**
 * Apply unified diff to content
 */
function applyUnifiedDiff(original, patch) {
  const lines = original.split('\n');
  const patchLines = patch.split('\n');

  let lineIndex = 0;
  const result = [];

  for (const patchLine of patchLines) {
    // Skip diff header lines
    if (patchLine.startsWith('---') || patchLine.startsWith('+++')) {
      continue;
    }

    // Parse hunk header (@@ -10,7 +10,7 @@)
    if (patchLine.startsWith('@@')) {
      const match = patchLine.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
      if (match) {
        lineIndex = parseInt(match[1]) - 1; // Convert to 0-indexed
      }
      continue;
    }

    // Unchanged line (starts with space)
    if (patchLine.startsWith(' ')) {
      result.push(lines[lineIndex]);
      lineIndex++;
    }
    // Line to remove (starts with -)
    else if (patchLine.startsWith('-')) {
      lineIndex++; // Skip this line in original
    }
    // Line to add (starts with +)
    else if (patchLine.startsWith('+')) {
      result.push(patchLine.substring(1)); // Add without '+'
    }
  }

  // Add remaining lines
  while (lineIndex < lines.length) {
    result.push(lines[lineIndex]);
    lineIndex++;
  }

  return result.join('\n');
}

/**
 * Delete a file
 */
async function deleteFile(projectRoot, filePath) {
  const fullPath = path.join(projectRoot, filePath);

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    console.warn(`  ⚠️  Failed to delete ${filePath}: ${error.message}`);
  }
}
