const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Construction Expense Tracker Server...\n');

// Check if node_modules exists
if (!fs.existsSync('./node_modules')) {
    console.log('📦 Installing dependencies...');
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    
    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed successfully!\n');
            startServer();
        } else {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🔧 Starting server...');
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });
    
    server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
    });
    
    server.on('error', (error) => {
        console.error('Server error:', error);
    });
}