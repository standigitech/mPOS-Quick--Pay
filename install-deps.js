const { execSync } = require('child_process');
const path = require('path');

const clientDir = path.join('/workspaces/mPOS-Quick--Pay', 'mpos-client');

console.log('Installing mpos-client dependencies...');
console.log('Working directory:', clientDir);

try {
  process.chdir(clientDir);
  const result = execSync('npm install 2>&1', { 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('\n✓ Dependencies installed successfully');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Installation failed:', error.message);
  process.exit(1);
}
