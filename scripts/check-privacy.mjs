#!/usr/bin/env node

/**
 * Privacy & Secret Leak Prevention Guard
 * Scans tracked and staged files to ensure no personal data, private keys,
 * or credentials ever leak into git commits or remotes.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const FORBIDDEN_FILES = [
  /^config\/preferences\.yml$/,
  /^modes\/_custom\.md$/,
  /\.env(\..+)?$/,
  /\.(pem|key|token|secret)$/,
  /id_rsa/,
  /LINKEDIN/i,
  /draft/i,
  /\.xapk$/,
  /\.apk$/
];

const LEAK_PATTERNS = [
  {
    name: "GitHub Personal Access Token",
    regex: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,})/
  },
  {
    name: "Private Key Header",
    regex: /-----BEGIN (?:RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----/
  },
  {
    name: "Local System Path (/home/username)",
    regex: /\/home\/(?!runner\b)[a-zA-Z0-9_-]+\//
  },
  {
    name: "Personal Email Address",
    // Allows @users.noreply.github.com, @example.com, @local, @google.com
    regex: /\b[a-zA-Z0-9._%+-]+@(?!users\.noreply\.github\.com\b|example\.com\b|local\b|google\.com\b)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/
  }
];

function checkFiles() {
  console.log("🔒 Running Privacy & Secret Leak Guard...");
  let violations = 0;

  // 1. Check staged files if in pre-commit, or all tracked files
  let filesToCheck = [];
  try {
    const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { cwd: REPO_ROOT, encoding: "utf-8" }).trim();
    if (staged) {
      filesToCheck = staged.split("\n").filter(Boolean);
    } else {
      const tracked = execSync("git ls-files", { cwd: REPO_ROOT, encoding: "utf-8" }).trim();
      filesToCheck = tracked.split("\n").filter(Boolean);
    }
  } catch {
    console.error("Failed to list git files.");
    process.exit(1);
  }

  for (const file of filesToCheck) {
    // Check forbidden file paths
    for (const pattern of FORBIDDEN_FILES) {
      if (pattern.test(file)) {
        console.error(`  ✖ VIOLATION: File "${file}" is private and must not be tracked in git!`);
        violations++;
      }
    }

    const fullPath = path.join(REPO_ROOT, file);
    if (!fs.existsSync(fullPath)) continue;

    // Skip binary files and images
    if (/\.(jpg|jpeg|png|gif|webp|svg|xapk|apk)$/i.test(file)) continue;

    let content = "";
    try {
      content = fs.readFileSync(fullPath, "utf-8");
    } catch {
      continue;
    }

    // Check content against leak patterns
    for (const { name, regex } of LEAK_PATTERNS) {
      const match = content.match(regex);
      if (match) {
        console.error(`  ✖ VIOLATION in ${file}: Detected potential ${name}: "${match[0]}"`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    console.error(`\n❌ Privacy Guard Failed: ${violations} violation(s) found. Aborting.`);
    process.exit(1);
  }

  console.log("✔ Privacy Guard Passed: Zero personal data or secrets detected.\n");
}

checkFiles();
