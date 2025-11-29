import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const version = process.env.VITE_APP_VERSION || Date.now().toString();
const versionData = {
  version: version,
  timestamp: new Date().toISOString(),
};

const distPath = join(__dirname, '..', 'dist', 'version.json');

// Ensure dist directory exists
const distDir = dirname(distPath);
try {
  mkdirSync(distDir, { recursive: true });
} catch (error) {
  // Directory might already exist, that's fine
}

writeFileSync(distPath, JSON.stringify(versionData, null, 2));

console.log(`✅ Version file generated: ${version}`);
console.log(`   Location: ${distPath}`);

