// ============================================================================
// APPLY PATCH - Parses Claude response and applies file changes
// ============================================================================

import fs from 'fs/promises';
import path from 'path';

/**
 * Validate a file path for security
 * @param {string} filePath - File path to validate
 * @returns {{valid: boolean, error?: string}}
 */
function validateFilePath(filePath) {
  // Prevent directory traversal attacks
  if (filePath.includes('..') || filePath.startsWith('/')) {
    return { valid: false, error: 'Invalid path: directory traversal detected' };
  }

  // Prevent modifying sensitive files
  const sensitivePatterns = ['.env', '.git/', 'node_modules/', '.npmrc', '.yarnrc'];
  for (const pattern of sensitivePatterns) {
    if (filePath.includes(pattern)) {
      return { valid: false, error: `Invalid path: cannot modify ${pattern}` };
    }
  }

  return { valid: true };
}

/**
 * Parse Claude response and extract all operations for validation
 * @param {string} response - Claude API response
 * @returns {{creates: Array, edits: Array, deletes: Array}}
 */
function parseOperations(response) {
  const operations = {
    creates: [],
    edits: [],
    deletes: [],
  };

  // Parse CREATE operations
  const createRegex = /### CREATE: (.+?)\n```(\w+)?\n([\s\S]+?)```/g;
  let match;

  while ((match = createRegex.exec(response)) !== null) {
    operations.creates.push({
      filePath: match[1].trim(),
      content: match[3].trim(),
    });
  }

  // Parse EDIT operations
  const editRegex = /### EDIT: (.+?)\n```patch\n([\s\S]+?)```/g;

  while ((match = editRegex.exec(response)) !== null) {
    operations.edits.push({
      filePath: match[1].trim(),
      patchContent: match[2].trim(),
    });
  }

  // Parse DELETE operations
  const deleteRegex = /### DELETE: (.+?)\n/g;

  while ((match = deleteRegex.exec(response)) !== null) {
    operations.deletes.push({
      filePath: match[1].trim(),
    });
  }

  return operations;
}

/**
 * Validate all operations before applying
 * @param {object} operations - Parsed operations
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
async function validateOperations(operations, projectRoot) {
  const errors = [];

  // Validate CREATE operations
  for (const op of operations.creates) {
    const validation = validateFilePath(op.filePath);
    if (!validation.valid) {
      errors.push(`CREATE ${op.filePath}: ${validation.error}`);
      continue;
    }

    // Check if file already exists
    const fullPath = path.join(projectRoot, op.filePath);
    try {
      await fs.access(fullPath);
      errors.push(`CREATE ${op.filePath}: file already exists`);
    } catch {
      // File doesn't exist - this is expected for CREATE
    }
  }

  // Validate EDIT operations
  for (const op of operations.edits) {
    const validation = validateFilePath(op.filePath);
    if (!validation.valid) {
      errors.push(`EDIT ${op.filePath}: ${validation.error}`);
      continue;
    }

    // Check if file exists
    const fullPath = path.join(projectRoot, op.filePath);
    try {
      await fs.access(fullPath);
    } catch {
      errors.push(`EDIT ${op.filePath}: file does not exist`);
    }
  }

  // Validate DELETE operations
  for (const op of operations.deletes) {
    const validation = validateFilePath(op.filePath);
    if (!validation.valid) {
      errors.push(`DELETE ${op.filePath}: ${validation.error}`);
      continue;
    }

    // Check if file exists
    const fullPath = path.join(projectRoot, op.filePath);
    try {
      await fs.access(fullPath);
    } catch {
      // Warn but don't error - file might already be deleted
      console.warn(`  ⚠️  DELETE ${op.filePath}: file does not exist`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse Claude response and apply file changes
 *
 * @param {string} response - Claude API response
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<{created: string[], updated: string[], deleted: string[], errors: string[]}>}
 */
export default async function applyPatch(response, projectRoot) {
  const changes = {
    created: [],
    updated: [],
    deleted: [],
    errors: [],
  };

  // Parse all operations first
  const operations = parseOperations(response);

  const totalOps = operations.creates.length + operations.edits.length + operations.deletes.length;
  if (totalOps === 0) {
    console.log('  ℹ️  No file operations found in response');
    return changes;
  }

  console.log(`  📋 Found ${totalOps} operations to apply`);

  // Validate all operations before applying
  const validation = await validateOperations(operations, projectRoot);
  if (!validation.valid) {
    console.error('  ❌ Validation failed:');
    for (const error of validation.errors) {
      console.error(`    - ${error}`);
      changes.errors.push(error);
    }
    return changes;
  }

  console.log('  ✓ Validation passed');

  // Apply CREATE operations
  for (const op of operations.creates) {
    try {
      await createFile(projectRoot, op.filePath, op.content);
      changes.created.push(op.filePath);
      console.log(`  ✓ Created: ${op.filePath}`);
    } catch (error) {
      const msg = `CREATE ${op.filePath}: ${error.message}`;
      changes.errors.push(msg);
      console.error(`  ❌ ${msg}`);
    }
  }

  // Apply EDIT operations
  for (const op of operations.edits) {
    try {
      await editFile(projectRoot, op.filePath, op.patchContent);
      changes.updated.push(op.filePath);
      console.log(`  ✓ Updated: ${op.filePath}`);
    } catch (error) {
      const msg = `EDIT ${op.filePath}: ${error.message}`;
      changes.errors.push(msg);
      console.error(`  ❌ ${msg}`);
    }
  }

  // Apply DELETE operations
  for (const op of operations.deletes) {
    try {
      await deleteFile(projectRoot, op.filePath);
      changes.deleted.push(op.filePath);
      console.log(`  ✓ Deleted: ${op.filePath}`);
    } catch (error) {
      const msg = `DELETE ${op.filePath}: ${error.message}`;
      changes.errors.push(msg);
      console.error(`  ❌ ${msg}`);
    }
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
