const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Load users
async function loadUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

// Save users
async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Load user data
async function loadUserData(username) {
    try {
        const userFile = path.join(DATA_DIR, `${username}.json`);
        const data = await fs.readFile(userFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return {
            expenses: [],
            budget: 0,
            budgetEnabled: false,
            vendors: {},
            bankAccounts: {},
            sites: {},
            createdDate: new Date().toISOString()
        };
    }
}

// Save user data
async function saveUserData(username, data) {
    const userFile = path.join(DATA_DIR, `${username}.json`);
    const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(userFile, JSON.stringify(dataToSave, null, 2));
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, company } = req.body;
        
        if (!username || !password || !email || !company) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = await loadUsers();
        
        if (users[username]) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check if email already exists
        const emailExists = Object.values(users).some(user => user.email === email);
        if (emailExists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        users[username] = {
            username,
            password: hashPassword(password),
            email,
            company,
            createdDate: new Date().toISOString(),
            isDefault: false
        };

        await saveUsers(users);
        
        // Create initial user data
        const initialData = {
            expenses: [],
            budget: 0,
            budgetEnabled: false,
            vendors: {},
            bankAccounts: {
                'default-sbi': {
                    id: 'default-sbi',
                    bankName: 'State Bank of India',
                    accountType: 'current',
                    accountNumber: '1234567890',
                    ifscCode: 'SBIN0001234',
                    branchName: 'Main Branch',
                    accountHolder: company,
                    createdDate: new Date().toISOString()
                },
                'default-hdfc': {
                    id: 'default-hdfc',
                    bankName: 'HDFC Bank',
                    accountType: 'current',
                    accountNumber: '5678901234',
                    ifscCode: 'HDFC0001234',
                    branchName: 'Business Branch',
                    accountHolder: company,
                    createdDate: new Date().toISOString()
                }
            },
            sites: {
                'main-office': {
                    id: 'main-office',
                    name: 'Main Office',
                    location: 'Head Office',
                    client: company,
                    budget: 1000000,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'active',
                    createdDate: new Date().toISOString()
                },
                'project-alpha': {
                    id: 'project-alpha',
                    name: 'Project Alpha',
                    location: 'Construction Site A',
                    client: 'Client A',
                    budget: 5000000,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'active',
                    createdDate: new Date().toISOString()
                }
            }
        };

        await saveUserData(username, initialData);

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const users = await loadUsers();
        const user = users[username];
        
        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate session token (simple implementation)
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        // Store session (in production, use Redis or database)
        user.sessionToken = sessionToken;
        user.lastLogin = new Date().toISOString();
        await saveUsers(users);

        res.json({ 
            success: true, 
            user: {
                username: user.username,
                email: user.email,
                company: user.company,
                sessionToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password Reset
app.post('/api/reset-password', async (req, res) => {
    try {
        const { username, email, newPassword } = req.body;
        
        if (!username || !email || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = await loadUsers();
        const user = users[username];
        
        if (!user || user.email !== email) {
            return res.status(400).json({ error: 'Username not found or email doesn\'t match' });
        }

        user.password = hashPassword(newPassword);
        user.passwordResetDate = new Date().toISOString();
        await saveUsers(users);

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Data
app.get('/api/user-data/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        
        // Verify session (simple implementation)
        const users = await loadUsers();
        const user = users[username];
        
        if (!user || user.sessionToken !== sessionToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userData = await loadUserData(username);
        res.json(userData);
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save User Data
app.post('/api/user-data/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        
        // Verify session
        const users = await loadUsers();
        const user = users[username];
        
        if (!user || user.sessionToken !== sessionToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await saveUserData(username, req.body);
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Save user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/logout/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const users = await loadUsers();
        
        if (users[username]) {
            delete users[username].sessionToken;
            await saveUsers(users);
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize server
async function startServer() {
    await ensureDataDir();
    
    // Create default admin user if no users exist
    const users = await loadUsers();
    if (Object.keys(users).length === 0) {
        users.admin = {
            username: 'admin',
            password: hashPassword('construction123'),
            email: 'admin@construction.com',
            company: 'Demo Construction Company',
            createdDate: new Date().toISOString(),
            isDefault: true
        };
        await saveUsers(users);
        
        // Create default admin data
        const defaultData = {
            expenses: [],
            budget: 0,
            budgetEnabled: false,
            vendors: {},
            bankAccounts: {
                'default-sbi': {
                    id: 'default-sbi',
                    bankName: 'State Bank of India',
                    accountType: 'current',
                    accountNumber: '1234567890',
                    ifscCode: 'SBIN0001234',
                    branchName: 'Main Branch',
                    accountHolder: 'Demo Construction Company',
                    createdDate: new Date().toISOString()
                }
            },
            sites: {
                'main-office': {
                    id: 'main-office',
                    name: 'Main Office',
                    location: 'Head Office',
                    client: 'Demo Construction Company',
                    budget: 1000000,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    status: 'active',
                    createdDate: new Date().toISOString()
                }
            }
        };
        await saveUserData('admin', defaultData);
    }
    
    // Listen on all network interfaces (0.0.0.0) to allow mobile access
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Construction Expense Tracker Server running on http://localhost:${PORT}`);
        console.log(`📱 Mobile access: Find your computer's IP address and use http://YOUR_IP:${PORT}`);
        console.log(`📊 Frontend available at http://localhost:${PORT}`);
        console.log(`🔐 API endpoints available at http://localhost:${PORT}/api/`);
        console.log(`\n💡 To find your IP address:`);
        console.log(`   Windows: Run 'ipconfig' in Command Prompt`);
        console.log(`   Mac/Linux: Run 'ifconfig' or 'ip addr' in Terminal`);
    });
}

startServer().catch(console.error);