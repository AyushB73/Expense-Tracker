class AuthManager {
    constructor() {
        this.isAuthenticated = apiClient.isAuthenticated();
        this.currentUser = apiClient.getCurrentUser();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = parseInt(localStorage.getItem('lastActivity')) || Date.now();
        this.currentResetUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.startSessionTimer();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await this.handleLogin();
            } catch (error) {
                console.error('Login error:', error);
            }
        });

        // Registration form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await this.handleRegister();
            } catch (error) {
                console.error('Registration error:', error);
            }
        });

        // Forgot password form
        document.getElementById('forgot-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await this.handleForgotPassword();
            } catch (error) {
                console.error('Forgot password error:', error);
            }
        });

        // Reset password form
        document.getElementById('reset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await this.handleResetPassword();
            } catch (error) {
                console.error('Reset password error:', error);
            }
        });

        // Navigation buttons
        document.getElementById('show-register-btn').addEventListener('click', () => {
            this.showRegisterForm();
        });

        document.getElementById('show-login-btn').addEventListener('click', () => {
            this.showLoginForm();
        });

        document.getElementById('show-forgot-btn').addEventListener('click', () => {
            this.showForgotForm();
        });

        document.getElementById('back-to-login-btn').addEventListener('click', () => {
            this.showLoginForm();
        });

        document.getElementById('logout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await this.handleLogout();
            } catch (error) {
                console.error('Logout error:', error);
            }
        });

        // Track user activity
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
    }

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('forgot-form').style.display = 'none';
        document.getElementById('reset-form').style.display = 'none';
        document.getElementById('login-subtitle').textContent = 'Admin Login Required';
        this.clearErrors();
        setTimeout(() => document.getElementById('username').focus(), 100);
    }

    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('forgot-form').style.display = 'none';
        document.getElementById('reset-form').style.display = 'none';
        document.getElementById('login-subtitle').textContent = 'Create New Account';
        this.clearErrors();
        setTimeout(() => document.getElementById('reg-username').focus(), 100);
    }

    showForgotForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('forgot-form').style.display = 'block';
        document.getElementById('reset-form').style.display = 'none';
        document.getElementById('login-subtitle').textContent = 'Reset Password';
        this.clearErrors();
        setTimeout(() => document.getElementById('forgot-username').focus(), 100);
    }

    showResetForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('forgot-form').style.display = 'none';
        document.getElementById('reset-form').style.display = 'block';
        document.getElementById('login-subtitle').textContent = 'Set New Password';
        this.clearErrors();
        setTimeout(() => document.getElementById('new-password').focus(), 100);
    }

    clearErrors() {
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('register-error').style.display = 'none';
        document.getElementById('forgot-error').style.display = 'none';
        document.getElementById('forgot-success').style.display = 'none';
        document.getElementById('reset-error').style.display = 'none';
    }

    async handleRegister() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const email = document.getElementById('reg-email').value.trim();
        const company = document.getElementById('reg-company').value.trim();
        const errorElement = document.getElementById('register-error');
        const errorText = document.getElementById('register-error-text');

        // Validation
        if (!username || !password || !confirmPassword || !email || !company) {
            errorText.textContent = 'Please fill all fields.';
            errorElement.style.display = 'flex';
            return;
        }

        if (username.length < 3) {
            errorText.textContent = 'Username must be at least 3 characters long.';
            errorElement.style.display = 'flex';
            return;
        }

        if (password.length < 6) {
            errorText.textContent = 'Password must be at least 6 characters long.';
            errorElement.style.display = 'flex';
            return;
        }

        if (password !== confirmPassword) {
            errorText.textContent = 'Passwords do not match.';
            errorElement.style.display = 'flex';
            return;
        }

        try {
            await apiClient.register({
                username,
                password,
                email,
                company
            });

            this.showNotification('Account created successfully! You can now login.', 'success');
            this.showLoginForm();
            
            // Pre-fill login form
            document.getElementById('username').value = username;
        } catch (error) {
            errorText.textContent = error.message;
            errorElement.style.display = 'flex';
        }
    }

    async handleForgotPassword() {
        const username = document.getElementById('forgot-username').value.trim();
        const email = document.getElementById('forgot-email').value.trim();
        const errorElement = document.getElementById('forgot-error');
        const errorText = document.getElementById('forgot-error-text');

        if (!username || !email) {
            errorText.textContent = 'Please fill all fields.';
            errorElement.style.display = 'flex';
            return;
        }

        this.currentResetUser = username;
        this.currentResetEmail = email;
        this.showResetForm();
    }

    async handleResetPassword() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        const errorElement = document.getElementById('reset-error');
        const errorText = document.getElementById('reset-error-text');

        if (!newPassword || !confirmPassword) {
            errorText.textContent = 'Please fill all fields.';
            errorElement.style.display = 'flex';
            return;
        }

        if (newPassword.length < 6) {
            errorText.textContent = 'Password must be at least 6 characters long.';
            errorElement.style.display = 'flex';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorText.textContent = 'Passwords do not match.';
            errorElement.style.display = 'flex';
            return;
        }

        try {
            await apiClient.resetPassword({
                username: this.currentResetUser,
                email: this.currentResetEmail,
                newPassword
            });
            
            document.getElementById('forgot-success').style.display = 'flex';
            setTimeout(() => {
                this.showLoginForm();
                document.getElementById('username').value = this.currentResetUser;
            }, 2000);
        } catch (error) {
            errorText.textContent = error.message;
            errorElement.style.display = 'flex';
        }
    }

    updateActivity() {
        if (this.isAuthenticated) {
            this.lastActivity = Date.now();
            localStorage.setItem('lastActivity', this.lastActivity.toString());
        }
    }

    startSessionTimer() {
        setInterval(() => {
            if (this.isAuthenticated && Date.now() - this.lastActivity > this.sessionTimeout) {
                this.handleSessionTimeout();
            }
        }, 60000); // Check every minute
    }

    handleSessionTimeout() {
        this.showNotification('Your session has expired due to inactivity. Please login again.', 'error');
        this.handleLogout();
    }

    checkAuthStatus() {
        // Check if session has expired
        if (this.isAuthenticated && Date.now() - this.lastActivity > this.sessionTimeout) {
            this.handleSessionTimeout();
            return;
        }

        if (this.isAuthenticated && this.currentUser) {
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        try {
            const response = await apiClient.login({ username, password });
            
            if (response.success) {
                this.isAuthenticated = true;
                this.currentUser = username;
                this.lastActivity = Date.now();
                localStorage.setItem('lastActivity', this.lastActivity.toString());
                this.showMainApp();
                this.clearLoginForm();
                errorElement.style.display = 'none';
                this.showWelcomeMessage(response.user);
            }
        } catch (error) {
            errorElement.style.display = 'flex';
            // Clear password field for security
            document.getElementById('password').value = '';
            // Add shake animation to login box
            this.addShakeAnimation();
        }
    }

    addShakeAnimation() {
        const loginBox = document.querySelector('.login-box');
        loginBox.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginBox.style.animation = '';
        }, 500);

        // Add shake animation CSS if not already added
        if (!document.querySelector('#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showWelcomeMessage(user) {
        // Create a welcome notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Welcome back, ${user.company || user.username}! Successfully logged in.
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Save current data before logout
            if (window.tracker) {
                await window.tracker.saveAllData();
                
                // Destroy the tracker instance to prevent data leakage
                window.tracker = null;
                console.log('ExpenseTracker instance destroyed on logout');
            }
            
            await apiClient.logout();
            this.isAuthenticated = false;
            this.currentUser = null;
            localStorage.removeItem('lastActivity');
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        this.showLoginForm();
        
        // Clear any displayed data from the previous user
        this.clearMainAppData();
    }
    
    clearMainAppData() {
        // Clear summary cards
        const summaryElements = [
            'total-debits',
            'total-credits',
            'net-balance',
            'expense-count'
        ];
        
        summaryElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '₹0.00';
            }
        });
        
        // Clear expense count
        const expenseCount = document.getElementById('expense-count');
        if (expenseCount) {
            expenseCount.textContent = '0';
        }
        
        // Clear expense table
        const expenseTableBody = document.getElementById('expense-table-body');
        if (expenseTableBody) {
            expenseTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #718096;">No transactions yet</td></tr>';
        }
        
        // Clear vendor grid
        const vendorGrid = document.getElementById('vendor-grid');
        if (vendorGrid) {
            vendorGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #718096;">No vendors added yet</p>';
        }
        
        // Clear sites grid
        const sitesGrid = document.getElementById('sites-grid');
        if (sitesGrid) {
            sitesGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #718096;">No sites/projects added yet</p>';
        }
        
        console.log('Main app data cleared for user switch');
    }

    showMainApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        // Update company name in header and page title
        const userInfo = apiClient.getUserInfo();
        if (userInfo && userInfo.company) {
            // Update header
            const companyNameHeader = document.getElementById('company-name-header');
            if (companyNameHeader) {
                companyNameHeader.textContent = userInfo.company;
            }
            
            // Update page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = `${userInfo.company} - Expense Tracker`;
            } else {
                document.title = `${userInfo.company} - Expense Tracker`;
            }
        }
        
        // Always create a fresh ExpenseTracker instance for the logged-in user
        // This ensures data isolation between users
        console.log('Creating new ExpenseTracker instance for user:', apiClient.getCurrentUser());
        window.tracker = new ExpenseTracker();
        
        // Add debugging for the submit button after a short delay
        setTimeout(() => {
            const submitBtn = document.querySelector('#expense-form button[type="submit"]');
            if (submitBtn) {
                console.log('Submit button found after main app load:', submitBtn);
                console.log('Button is visible:', submitBtn.offsetParent !== null);
                console.log('Button is enabled:', !submitBtn.disabled);
                
                // Add a test click handler
                submitBtn.addEventListener('click', function testHandler(e) {
                    console.log('TEST: Submit button clicked!', e);
                }, { once: true });
            } else {
                console.error('Submit button not found after main app load');
            }
        }, 1000);
    }

    clearLoginForm() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    getCurrentUser() {
        return apiClient.getUserInfo();
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
                .notification.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                .notification.error {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

class ExpenseTracker {
    constructor() {
        this.currentUser = apiClient.getCurrentUser();
        if (!this.currentUser) {
            console.error('No current user found');
            return;
        }
        
        // Initialize data
        this.expenses = [];
        this.budget = 0;
        this.budgetEnabled = false;
        this.vendors = {};
        this.bankAccounts = {};
        this.sites = {};
        this.currentEditingVendor = null;
        this.currentSiteFilter = '';
        
        this.init();
    }

    async init() {
        console.log('=== ExpenseTracker.init() called ===');
        try {
            // Load data from server or localStorage
            const userData = await apiClient.syncData();
            
            if (userData) {
                this.expenses = userData.expenses || [];
                this.budget = userData.budget || 0;
                this.budgetEnabled = userData.budgetEnabled || false;
                this.vendors = userData.vendors || {};
                this.bankAccounts = userData.bankAccounts || this.getDefaultBankAccounts();
                this.sites = userData.sites || this.getDefaultSites();
            } else {
                // Initialize with defaults
                this.bankAccounts = this.getDefaultBankAccounts();
                this.sites = this.getDefaultSites();
            }
            
            this.migrateData();
            console.log('About to bind events...');
            this.bindEvents();
            console.log('Events bound successfully');
            this.setTodayDate();
            this.updateBudgetDisplay();
            this.toggleBudgetSection();
            this.updateVendorDropdown();
            this.renderVendorGrid();
            this.updateBankAccountDropdown();
            this.updateSiteDropdowns();
            this.renderSitesGrid();
            this.updateSummary();
            this.renderExpenses();
            
            // Save initial data
            await this.saveAllData();
            console.log('=== ExpenseTracker initialization complete ===');
        } catch (error) {
            console.error('Error initializing ExpenseTracker:', error);
            this.showNotification('Error loading data. Please try refreshing the page.', 'error');
        }
    }

    getDefaultBankAccounts() {
        const userInfo = apiClient.getUserInfo();
        const companyName = userInfo?.company || 'Your Company';
        
        return {
            'default-sbi': {
                id: 'default-sbi',
                bankName: 'State Bank of India',
                accountType: 'current',
                accountNumber: '1234567890',
                ifscCode: 'SBIN0001234',
                branchName: 'Main Branch',
                accountHolder: companyName,
                createdDate: new Date().toISOString()
            },
            'default-hdfc': {
                id: 'default-hdfc',
                bankName: 'HDFC Bank',
                accountType: 'current',
                accountNumber: '5678901234',
                ifscCode: 'HDFC0001234',
                branchName: 'Business Branch',
                accountHolder: companyName,
                createdDate: new Date().toISOString()
            }
        };
    }

    getDefaultSites() {
        const userInfo = apiClient.getUserInfo();
        const companyName = userInfo?.company || 'Your Company';
        
        return {
            'main-office': {
                id: 'main-office',
                name: 'Main Office',
                location: 'Head Office',
                client: companyName,
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
        };
    }

    // Save all user data to server
    async saveAllData() {
        try {
            const userData = {
                expenses: this.expenses,
                budget: this.budget,
                budgetEnabled: this.budgetEnabled,
                vendors: this.vendors,
                bankAccounts: this.bankAccounts,
                sites: this.sites
            };
            
            await apiClient.saveUserData(userData);
            console.log('All data saved to server');
            return true;
        } catch (error) {
            console.error('Error saving data to server:', error);
            // Fallback to localStorage
            this.saveToLocalStorage();
            return false;
        }
    }

    // Fallback localStorage save
    saveToLocalStorage() {
        if (!this.currentUser) return;
        
        const userData = {
            expenses: this.expenses,
            budget: this.budget,
            budgetEnabled: this.budgetEnabled,
            vendors: this.vendors,
            bankAccounts: this.bankAccounts,
            sites: this.sites
        };
        
        apiClient.saveToLocalStorage(userData);
    }

    // Legacy method for compatibility
    saveUserData() {
        this.saveAllData();
    }

    saveToStorage() {
        this.saveAllData();
    }

    setBudget() {
        const budgetInput = document.getElementById('budget-input');
        const budget = parseFloat(budgetInput.value);
        
        if (budget && budget > 0) {
            this.budget = budget;
            localStorage.setItem(this.userBudgetKey, budget.toString());
            this.updateSummary();
            budgetInput.value = '';
            this.showNotification('Budget updated successfully!', 'success');
        } else {
            this.showNotification('Please enter a valid budget amount', 'error');
        }
    }

    enableBudgetTracking() {
        this.budgetEnabled = true;
        localStorage.setItem(this.userBudgetEnabledKey, 'true');
        this.toggleBudgetSection();
        this.updateSummary();
        this.showNotification('Budget tracking enabled!', 'success');
    }

    disableBudgetTracking() {
        if (confirm('Are you sure you want to disable budget tracking? This will hide budget-related information.')) {
            this.budgetEnabled = false;
            this.budget = 0;
            localStorage.setItem(this.userBudgetEnabledKey, 'false');
            localStorage.removeItem(this.userBudgetKey);
            this.toggleBudgetSection();
            this.updateSummary();
            this.showNotification('Budget tracking disabled', 'success');
        }
    }

    saveVendor() {
        const name = document.getElementById('vendor-name').value.trim();
        const contact = document.getElementById('vendor-contact').value.trim();
        const email = document.getElementById('vendor-email').value.trim();
        const address = document.getElementById('vendor-address').value.trim();
        const gst = document.getElementById('vendor-gst').value.trim();
        const pan = document.getElementById('vendor-pan').value.trim();
        const bankName = document.getElementById('vendor-bank-name').value.trim();
        const accountNumber = document.getElementById('vendor-account-number').value.trim();
        const ifscCode = document.getElementById('vendor-ifsc').value.trim();
        const category = document.getElementById('vendor-category').value;
        
        if (!name) {
            this.showNotification('Please enter vendor name', 'error');
            return;
        }
        
        if (this.vendors[name]) {
            this.showNotification('Vendor already exists', 'error');
            return;
        }
        
        this.vendors[name] = {
            name: name,
            contact: contact,
            email: email,
            address: address,
            gst: gst,
            pan: pan,
            bankName: bankName,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            category: category,
            expenses: [],
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.updateVendorDropdown();
        this.renderVendorGrid();
        this.hideAddVendorForm();
        this.showNotification('Vendor added successfully!', 'success');
    }

    saveQuickVendor() {
        const name = document.getElementById('quick-vendor-name').value.trim();
        const contact = document.getElementById('quick-vendor-contact').value.trim();
        const email = document.getElementById('quick-vendor-email').value.trim();
        const address = document.getElementById('quick-vendor-address').value.trim();
        const gst = document.getElementById('quick-vendor-gst').value.trim();
        const pan = document.getElementById('quick-vendor-pan').value.trim();
        
        if (!name) {
            this.showNotification('Please enter vendor name', 'error');
            document.getElementById('quick-vendor-name').focus();
            return;
        }
        
        if (this.vendors[name]) {
            this.showNotification('Vendor already exists', 'error');
            return;
        }
        
        this.vendors[name] = {
            name: name,
            contact: contact,
            email: email,
            address: address,
            gst: gst,
            pan: pan,
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            category: '',
            expenses: [],
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.updateVendorDropdown();
        this.renderVendorGrid();
        
        // Select the newly created vendor
        document.getElementById('vendor-select').value = name;
        document.getElementById('vendor').value = name;
        
        this.hideQuickVendorForm();
        this.showNotification('Vendor added and selected successfully!', 'success');
    }

    updateVendor() {
        if (!this.currentEditingVendor) return;
        
        const vendor = this.vendors[this.currentEditingVendor];
        if (!vendor) return;
        
        // Update vendor with new data
        vendor.contact = document.getElementById('edit-vendor-contact').value.trim();
        vendor.email = document.getElementById('edit-vendor-email').value.trim();
        vendor.address = document.getElementById('edit-vendor-address').value.trim();
        vendor.gst = document.getElementById('edit-vendor-gst').value.trim();
        vendor.pan = document.getElementById('edit-vendor-pan').value.trim();
        vendor.bankName = document.getElementById('edit-vendor-bank-name').value.trim();
        vendor.accountNumber = document.getElementById('edit-vendor-account-number').value.trim();
        vendor.ifscCode = document.getElementById('edit-vendor-ifsc').value.trim();
        vendor.category = document.getElementById('edit-vendor-category').value;
        vendor.updatedDate = new Date().toISOString();
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.renderVendorGrid();
        this.hideEditVendorForm();
        this.showNotification('Vendor updated successfully!', 'success');
    }

    saveBankAccount() {
        const bankName = document.getElementById('bank-form-name').value.trim();
        const accountType = document.getElementById('bank-form-type').value;
        const accountNumber = document.getElementById('bank-form-number').value.trim();
        const ifscCode = document.getElementById('bank-form-ifsc').value.trim();
        const branchName = document.getElementById('bank-form-branch').value.trim();
        const accountHolder = document.getElementById('bank-form-holder').value.trim();
        
        if (!bankName || !accountType || !accountNumber || !ifscCode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // Check if account number already exists
        const existingAccount = Object.values(this.bankAccounts).find(acc => acc.accountNumber === accountNumber);
        if (existingAccount) {
            this.showNotification('Account number already exists', 'error');
            return;
        }
        
        const accountId = `${bankName.toLowerCase().replace(/\s+/g, '-')}-${accountType}-${Date.now()}`;
        
        this.bankAccounts[accountId] = {
            id: accountId,
            bankName: bankName,
            accountType: accountType,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            branchName: branchName,
            accountHolder: accountHolder,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
        this.updateBankAccountDropdown();
        this.renderBankAccountsGrid();
        this.hideBankAccountForm();
        this.showNotification('Bank account added successfully!', 'success');
    }

    updateBankAccount(accountId) {
        const account = this.bankAccounts[accountId];
        if (!account) {
            this.showNotification('Account not found', 'error');
            return;
        }
        
        const bankName = document.getElementById('bank-form-name').value.trim();
        const accountType = document.getElementById('bank-form-type').value;
        const accountNumber = document.getElementById('bank-form-number').value.trim();
        const ifscCode = document.getElementById('bank-form-ifsc').value.trim();
        const branchName = document.getElementById('bank-form-branch').value.trim();
        const accountHolder = document.getElementById('bank-form-holder').value.trim();
        
        if (!bankName || !accountType || !accountNumber || !ifscCode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // Check if account number already exists (excluding current account)
        const existingAccount = Object.values(this.bankAccounts).find(acc => 
            acc.accountNumber === accountNumber && acc.id !== accountId
        );
        if (existingAccount) {
            this.showNotification('Account number already exists', 'error');
            return;
        }
        
        // Update account details
        account.bankName = bankName;
        account.accountType = accountType;
        account.accountNumber = accountNumber;
        account.ifscCode = ifscCode;
        account.branchName = branchName;
        account.accountHolder = accountHolder;
        account.updatedDate = new Date().toISOString();
        
        localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
        this.updateBankAccountDropdown();
        this.renderBankAccountsGrid();
        this.hideBankAccountForm();
        this.showNotification('Bank account updated successfully!', 'success');
    }

    deleteBankAccount(accountId) {
        const account = this.bankAccounts[accountId];
        if (!account) {
            this.showNotification('Account not found', 'error');
            return;
        }
        
        // Check if this account is used in any transactions
        const usedInTransactions = this.expenses.some(expense => expense.bankAccount === accountId);
        
        let confirmMessage = `Are you sure you want to delete the bank account "${account.bankName} ${account.accountType}"?`;
        if (usedInTransactions) {
            confirmMessage += '\n\nWarning: This account is used in existing transactions. Deleting it will not affect existing transactions but the account will no longer be available for new transactions.';
        }
        
        if (confirm(confirmMessage)) {
            delete this.bankAccounts[accountId];
            localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
            this.updateBankAccountDropdown();
            this.renderBankAccountsGrid();
            this.showNotification('Bank account deleted successfully!', 'success');
        }
    }

    deleteAllBankAccounts() {
        if (Object.keys(this.bankAccounts).length === 0) {
            this.showNotification('No bank accounts to delete', 'error');
            return;
        }
        
        const usedAccounts = this.expenses.filter(expense => expense.bankAccount).length;
        let confirmMessage = `Are you sure you want to delete ALL bank accounts? This will remove ${Object.keys(this.bankAccounts).length} bank accounts.`;
        
        if (usedAccounts > 0) {
            confirmMessage += `\n\nWarning: Some accounts are used in ${usedAccounts} existing transactions. Deleting them will not affect existing transactions but the accounts will no longer be available for new transactions.`;
        }
        
        confirmMessage += '\n\nThis action cannot be undone!';
        
        if (confirm(confirmMessage)) {
            this.bankAccounts = {};
            localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
            this.updateBankAccountDropdown();
            this.renderBankAccountsGrid();
            this.showNotification('All bank accounts deleted successfully!', 'success');
        }
    }

    saveQuickSite() {
        const name = document.getElementById('quick-site-name').value.trim();
        const location = document.getElementById('quick-site-location').value.trim();
        const client = document.getElementById('quick-site-client').value.trim();
        const budget = parseFloat(document.getElementById('quick-site-budget').value) || 0;
        const startDate = document.getElementById('quick-site-start-date').value;
        const endDate = document.getElementById('quick-site-end-date').value;
        
        if (!name) {
            this.showNotification('Please enter site/project name', 'error');
            document.getElementById('quick-site-name').focus();
            return;
        }
        
        if (Object.values(this.sites).some(site => site.name === name)) {
            this.showNotification('Site/project already exists', 'error');
            return;
        }
        
        const siteId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
        
        this.sites[siteId] = {
            id: siteId,
            name: name,
            location: location,
            client: client,
            budget: budget,
            startDate: startDate,
            endDate: endDate,
            status: 'active',
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userSitesKey, JSON.stringify(this.sites));
        this.updateSiteDropdowns();
        this.renderSitesGrid();
        
        // Select the newly created site
        document.getElementById('site-select').value = name;
        document.getElementById('site-name').value = name;
        
        this.hideQuickSiteForm();
        this.showNotification('Site/project added and selected successfully!', 'success');
    }

    migrateData() {
        // Migrate expenses to include transaction type
        let needsSave = false;
        this.expenses.forEach(expense => {
            if (!expense.type) {
                expense.type = 'debit'; // Default old expenses to debit
                needsSave = true;
            }
        });

        // Migrate vendor data to include debit/credit totals
        Object.values(this.vendors).forEach(vendor => {
            if (vendor.totalAmount !== undefined && vendor.totalDebits === undefined) {
                vendor.totalDebits = vendor.totalAmount || 0;
                vendor.totalCredits = 0;
                vendor.netBalance = vendor.totalDebits;
                delete vendor.totalAmount;
                needsSave = true;
            }
        });

        if (needsSave) {
            this.saveToStorage();
            localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        }
    }

    bindEvents() {
        console.log('=== bindEvents called ===');
        
        // Note: No longer using form submission, using direct button click instead

        // Add transaction button handler (formerly debug button)
        const addTransactionBtn = document.getElementById('add-transaction-btn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', async (e) => {
                console.log('=== ADD TRANSACTION BUTTON CLICKED ===');
                e.preventDefault();
                
                // Add loading state
                addTransactionBtn.classList.add('loading');
                addTransactionBtn.disabled = true;
                const originalHTML = addTransactionBtn.innerHTML;
                addTransactionBtn.innerHTML = '<i class="fas fa-spinner"></i> Processing...';
                
                try {
                    // Get form values directly
                    const description = document.getElementById('description').value.trim();
                    const amount = document.getElementById('amount').value.trim();
                    const category = document.getElementById('category').value.trim();
                    const date = document.getElementById('date').value.trim();
                    
                    // Get site name from either dropdown or text input
                    const siteSelect = document.getElementById('site-select').value;
                    const siteInput = document.getElementById('site-name').value;
                    const siteName = siteSelect && siteSelect !== 'add-new' ? siteSelect : siteInput || 'General';
                    
                    // Get vendor name from either dropdown or text input
                    const vendorSelect = document.getElementById('vendor-select').value;
                    const vendorInput = document.getElementById('vendor').value;
                    const vendorName = vendorSelect && vendorSelect !== 'new' ? vendorSelect : vendorInput || 'N/A';
                    
                    const transactionType = document.getElementById('transaction-type').value;
                    
                    console.log('Form values:', { description, amount, category, date, siteName, vendorName, transactionType });
                    
                    // Basic validation
                    if (!description || !amount || !category || !date) {
                        const missing = [];
                        if (!description) missing.push('Description');
                        if (!amount) missing.push('Amount');
                        if (!category) missing.push('Category');
                        if (!date) missing.push('Date');
                        
                        this.showNotification(`Please fill required fields: ${missing.join(', ')}`, 'error');
                        
                        // Focus on first missing field
                        const firstMissingField = 
                            !description ? document.getElementById('description') :
                            !amount ? document.getElementById('amount') :
                            !category ? document.getElementById('category') :
                            document.getElementById('date');
                        
                        if (firstMissingField) firstMissingField.focus();
                        return;
                    }
                    
                    // Create transaction object
                    const transaction = {
                        id: Date.now(),
                        type: transactionType,
                        description: description,
                        amount: parseFloat(amount),
                        quantity: parseFloat(document.getElementById('quantity').value) || null,
                        unit: document.getElementById('unit').value || null,
                        category: category,
                        date: date,
                        vendor: vendorName,
                        site: siteName.trim(),
                        projectPhase: document.getElementById('project-phase').value || 'N/A',
                        // Payment details (only for credit transactions)
                        paymentMode: transactionType === 'credit' ? document.getElementById('payment-mode').value : null,
                        bankAccount: transactionType === 'credit' ? document.getElementById('bank-account').value : null,
                        paymentReference: transactionType === 'credit' ? document.getElementById('payment-reference-no').value : null,
                        paymentNumber: transactionType === 'credit' ? document.getElementById('payment-number').value : null
                    };
                    
                    console.log('Transaction created:', transaction);
                    
                    // Initialize expenses array if it doesn't exist
                    if (!this.expenses) {
                        this.expenses = [];
                        console.log('Initialized expenses array');
                    }
                    
                    // Add transaction to expenses
                    this.expenses.unshift(transaction);
                    console.log('Transaction added to expenses array, total expenses:', this.expenses.length);
                    
                    // Update vendor account if vendor is specified and not 'N/A'
                    if (vendorName && vendorName !== 'N/A') {
                        try {
                            this.updateVendorAccount(vendorName, transaction);
                            console.log('Vendor account updated');
                        } catch (e) {
                            console.error('Error updating vendor account:', e);
                        }
                    }
                    
                    // Save data
                    try {
                        await this.saveAllData();
                        console.log('Data saved successfully');
                    } catch (e) {
                        console.error('Error saving data:', e);
                        this.showNotification('Error saving data: ' + e.message, 'error');
                        return;
                    }
                    
                    // Update UI
                    try {
                        this.updateSummary();
                        this.renderExpenses();
                        console.log('UI updated successfully');
                    } catch (e) {
                        console.error('Error updating UI:', e);
                    }
                    
                    // Reset form
                    const form = document.getElementById('expense-form');
                    if (form) {
                        form.reset();
                        this.setTodayDate();
                        
                        // Hide payment details after reset
                        try {
                            document.getElementById('payment-details').style.display = 'none';
                            document.getElementById('payment-reference').style.display = 'none';
                        } catch (e) {
                            console.error('Error hiding payment details:', e);
                        }
                    }
                    
                    // Show success state
                    addTransactionBtn.classList.remove('loading');
                    addTransactionBtn.classList.add('success');
                    addTransactionBtn.innerHTML = '<i class="fas fa-check"></i> Added Successfully!';
                    
                    this.showNotification('Transaction added successfully!', 'success');
                    console.log('=== TRANSACTION COMPLETED SUCCESSFULLY ===');
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        addTransactionBtn.classList.remove('success');
                        addTransactionBtn.innerHTML = originalHTML;
                        addTransactionBtn.disabled = false;
                    }, 2000);
                    
                } catch (error) {
                    console.error('Add transaction error:', error);
                    this.showNotification('Error adding transaction: ' + error.message, 'error');
                } finally {
                    // Always reset loading state
                    addTransactionBtn.classList.remove('loading');
                    if (!addTransactionBtn.classList.contains('success')) {
                        addTransactionBtn.innerHTML = originalHTML;
                        addTransactionBtn.disabled = false;
                    }
                }
            });
            console.log('Add transaction button handler added');
        } else {
            console.log('Add transaction button not found');
        }

        document.getElementById('set-budget-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setBudget();
        });

        document.getElementById('enable-budget-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.enableBudgetTracking();
        });

        document.getElementById('disable-budget-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.disableBudgetTracking();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.renderExpenses();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            this.exportToPDF();
        });

        // Transaction type change event
        document.getElementById('transaction-type').addEventListener('change', (e) => {
            this.handleTransactionTypeChange(e.target.value);
        });

        // Bank account selection event
        document.getElementById('bank-account').addEventListener('change', (e) => {
            this.handleBankAccountSelection(e.target.value);
        });

        // Quick bank account events
        document.getElementById('save-quick-bank').addEventListener('click', () => {
            this.saveQuickBankAccount();
        });

        document.getElementById('cancel-quick-bank').addEventListener('click', () => {
            this.hideQuickBankForm();
        });

        document.getElementById('cancel-quick-bank-btn').addEventListener('click', () => {
            this.hideQuickBankForm();
        });

        // Vendor management events
        document.getElementById('vendor-select').addEventListener('change', (e) => {
            this.handleVendorSelection(e.target.value);
        });

        document.getElementById('add-vendor-btn').addEventListener('click', () => {
            this.showAddVendorForm();
        });

        document.getElementById('save-vendor-btn').addEventListener('click', () => {
            this.saveVendor();
        });

        document.getElementById('cancel-vendor-btn').addEventListener('click', () => {
            this.hideAddVendorForm();
        });

        // Vendor editing events
        document.getElementById('edit-vendor-btn').addEventListener('click', () => {
            this.showEditVendorForm();
        });

        document.getElementById('update-vendor-btn').addEventListener('click', () => {
            this.updateVendor();
        });

        document.getElementById('cancel-vendor-edit-btn').addEventListener('click', () => {
            this.hideEditVendorForm();
        });

        document.getElementById('close-vendor-edit-modal').addEventListener('click', () => {
            this.hideEditVendorForm();
        });

        // Vendor management events
        document.getElementById('vendor-select').addEventListener('change', (e) => {
            this.handleVendorSelection(e.target.value);
        });

        document.getElementById('add-vendor-btn').addEventListener('click', () => {
            this.showAddVendorForm();
        });

        document.getElementById('save-vendor-btn').addEventListener('click', () => {
            this.saveVendor();
        });

        document.getElementById('cancel-vendor-btn').addEventListener('click', () => {
            this.hideAddVendorForm();
        });

        // Quick vendor add events
        document.getElementById('save-quick-vendor').addEventListener('click', () => {
            this.saveQuickVendor();
        });

        document.getElementById('cancel-quick-vendor').addEventListener('click', () => {
            this.hideQuickVendorForm();
        });

        document.getElementById('cancel-quick-vendor-btn').addEventListener('click', () => {
            this.hideQuickVendorForm();
        });

        document.getElementById('close-vendor-modal').addEventListener('click', () => {
            this.closeVendorModal();
        });

        document.getElementById('vendor-summary-btn').addEventListener('click', () => {
            this.showVendorSummaryModal();
        });

        // Bank management events
        document.getElementById('manage-banks-btn').addEventListener('click', () => {
            this.showBankManagementModal();
        });

        document.getElementById('close-bank-management-modal').addEventListener('click', () => {
            this.hideBankManagementModal();
        });

        document.getElementById('add-bank-account-btn').addEventListener('click', () => {
            this.showBankAccountForm(false);
        });

        document.getElementById('delete-all-banks-btn').addEventListener('click', () => {
            this.deleteAllBankAccounts();
        });

        document.getElementById('save-bank-account-btn').addEventListener('click', () => {
            this.saveBankAccount();
        });

        document.getElementById('cancel-bank-account-btn').addEventListener('click', () => {
            this.hideBankAccountForm();
        });

        // Vendor summary events
        document.getElementById('close-vendor-summary-modal').addEventListener('click', () => {
            this.hideVendorSummaryModal();
        });

        // Site management events
        document.getElementById('site-select').addEventListener('change', (e) => {
            this.handleSiteSelection(e.target.value);
        });

        document.getElementById('save-quick-site').addEventListener('click', () => {
            this.saveQuickSite();
        });

        document.getElementById('cancel-quick-site').addEventListener('click', () => {
            this.hideQuickSiteForm();
        });

        document.getElementById('cancel-quick-site-btn').addEventListener('click', () => {
            this.hideQuickSiteForm();
        });

        document.getElementById('manage-sites-btn').addEventListener('click', () => {
            this.showSiteManagementModal();
        });

        document.getElementById('site-reports-btn').addEventListener('click', () => {
            this.showSiteReportsModal();
        });

        document.getElementById('close-site-management-modal').addEventListener('click', () => {
            this.hideSiteManagementModal();
        });

        document.getElementById('close-site-reports-modal').addEventListener('click', () => {
            this.hideSiteReportsModal();
        });

        document.getElementById('add-site-btn').addEventListener('click', () => {
            this.showAddSiteForm();
        });

        // Edit site modal events
        document.getElementById('close-edit-site-modal').addEventListener('click', () => {
            this.hideEditSiteModal();
        });

        document.getElementById('cancel-edit-site').addEventListener('click', () => {
            this.hideEditSiteModal();
        });

        document.getElementById('edit-site-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateSite();
        });

        document.getElementById('delete-site-btn').addEventListener('click', async () => {
            await this.deleteSite();
        });

        // Site filtering events
        document.getElementById('site-filter').addEventListener('change', (e) => {
            this.currentSiteFilter = e.target.value;
            this.renderExpenses();
        });

        document.getElementById('site-filter-summary').addEventListener('change', (e) => {
            console.log('=== Site Filter Summary Changed ===');
            console.log('New value:', e.target.value);
            console.log('Selected text:', e.target.options[e.target.selectedIndex].text);
            
            this.currentSiteFilter = e.target.value;
            console.log('Set currentSiteFilter to:', this.currentSiteFilter);
            console.log('Total expenses before filter:', this.expenses.length);
            
            // Count expenses for this site
            if (this.currentSiteFilter) {
                const matchingExpenses = this.expenses.filter(exp => exp.site === this.currentSiteFilter);
                console.log('Matching expenses for site:', matchingExpenses.length);
                console.log('Sample expense sites:', this.expenses.slice(0, 3).map(e => e.site));
            }
            
            this.updateSummary();
            this.renderExpenses();
            
            // Update the other filter to match
            document.getElementById('site-filter').value = e.target.value;
            console.log('Updated site-filter to match');
            console.log('=== Filter Update Complete ===');
        });
    }

    handleTransactionTypeChange(transactionType) {
        const paymentDetails = document.getElementById('payment-details');
        const paymentReference = document.getElementById('payment-reference');
        
        if (transactionType === 'credit') {
            // Show payment details for credit transactions (payments made)
            paymentDetails.style.display = 'flex';
            paymentReference.style.display = 'flex';
            this.generatePaymentNumber();
            this.updateBankAccountDropdown();
        } else {
            // Hide payment details for debit transactions (expenses received)
            paymentDetails.style.display = 'none';
            paymentReference.style.display = 'none';
            document.getElementById('payment-number').value = '';
            this.hideQuickBankForm();
        }
    }

    handleBankAccountSelection(value) {
        const bankQuickAdd = document.getElementById('bank-quick-add');
        
        if (value === 'add-new') {
            bankQuickAdd.style.display = 'block';
            document.getElementById('quick-bank-name').focus();
        } else {
            bankQuickAdd.style.display = 'none';
        }
    }

    updateBankAccountDropdown() {
        const bankAccountSelect = document.getElementById('bank-account');
        const currentValue = bankAccountSelect.value;
        
        // Clear existing options except default ones
        bankAccountSelect.innerHTML = `
            <option value="">Select Bank Account</option>
        `;
        
        // Add existing bank accounts
        Object.values(this.bankAccounts).forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.bankName} ${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} A/c - ****${account.accountNumber.slice(-4)}`;
            bankAccountSelect.appendChild(option);
        });
        
        // Add "Add New" option
        const addNewOption = document.createElement('option');
        addNewOption.value = 'add-new';
        addNewOption.textContent = '+ Add New Bank Account';
        bankAccountSelect.appendChild(addNewOption);
        
        // Restore selection if it still exists
        if (currentValue && this.bankAccounts[currentValue]) {
            bankAccountSelect.value = currentValue;
        }
    }

    showQuickBankForm() {
        document.getElementById('bank-quick-add').style.display = 'block';
        document.getElementById('quick-bank-name').focus();
    }

    hideQuickBankForm() {
        document.getElementById('bank-quick-add').style.display = 'none';
        document.getElementById('bank-account').value = '';
        this.clearQuickBankForm();
    }

    clearQuickBankForm() {
        document.getElementById('quick-bank-name').value = '';
        document.getElementById('quick-account-type').value = '';
        document.getElementById('quick-account-number').value = '';
        document.getElementById('quick-ifsc-code').value = '';
        document.getElementById('quick-branch-name').value = '';
        document.getElementById('quick-account-holder').value = '';
    }

    saveQuickBankAccount() {
        const bankName = document.getElementById('quick-bank-name').value.trim();
        const accountType = document.getElementById('quick-account-type').value;
        const accountNumber = document.getElementById('quick-account-number').value.trim();
        const ifscCode = document.getElementById('quick-ifsc-code').value.trim();
        const branchName = document.getElementById('quick-branch-name').value.trim();
        const accountHolder = document.getElementById('quick-account-holder').value.trim();
        
        if (!bankName || !accountType || !accountNumber || !ifscCode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const accountId = `${bankName.toLowerCase().replace(/\s+/g, '-')}-${accountType}-${Date.now()}`;
        
        this.bankAccounts[accountId] = {
            id: accountId,
            bankName: bankName,
            accountType: accountType,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            branchName: branchName,
            accountHolder: accountHolder,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
        this.updateBankAccountDropdown();
        
        // Select the newly created bank account
        document.getElementById('bank-account').value = accountId;
        
        this.hideQuickBankForm();
        this.showNotification('Bank account added and selected successfully!', 'success');
    }

    generatePaymentNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-4);
        
        const paymentNumber = `PAY${year}${month}${day}${time}`;
        document.getElementById('payment-number').value = paymentNumber;
        document.getElementById('payment-number').classList.add('auto-generated');
    }

    enableBudgetTracking() {
        this.budgetEnabled = true;
        localStorage.setItem(this.userBudgetEnabledKey, 'true');
        this.toggleBudgetSection();
        this.updateSummary();
        this.showNotification('Budget tracking enabled!', 'success');
    }

    disableBudgetTracking() {
        if (confirm('Are you sure you want to disable budget tracking? This will hide budget-related information.')) {
            this.budgetEnabled = false;
            this.budget = 0;
            localStorage.setItem(this.userBudgetEnabledKey, 'false');
            localStorage.removeItem(this.userBudgetKey);
            this.toggleBudgetSection();
            this.updateSummary();
            this.showNotification('Budget tracking disabled', 'success');
        }
    }

    toggleBudgetSection() {
        const budgetSection = document.getElementById('budget-section');
        const budgetToggle = document.getElementById('budget-toggle');
        const budgetSummary = document.getElementById('budget-summary');

        if (this.budgetEnabled) {
            budgetSection.style.display = 'block';
            budgetToggle.style.display = 'none';
            budgetSummary.style.display = 'block';
        } else {
            budgetSection.style.display = 'none';
            budgetToggle.style.display = 'block';
            budgetSummary.style.display = 'none';
        }
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
        
        // Initialize site field required attributes
        const siteSelect = document.getElementById('site-select');
        const siteInput = document.getElementById('site-name');
        
        if (siteSelect && siteInput) {
            // By default, the site input is hidden and site select is visible
            if (siteInput.style.display === 'none' || !siteInput.style.display) {
                siteSelect.setAttribute('required', 'required');
                siteInput.removeAttribute('required');
            } else {
                siteInput.setAttribute('required', 'required');
                siteSelect.removeAttribute('required');
            }
        }
    }

    async addExpense() {
        console.log('=== addExpense called ===');
        console.log('Current user:', this.currentUser);
        console.log('Expenses array length:', this.expenses?.length || 0);
        
        try {
            const form = document.getElementById('expense-form');
            console.log('Form found:', !!form);
            
            if (!form) {
                console.error('Form not found!');
                this.showNotification('Error: Form not found', 'error');
                return false;
            }
            
            // Get basic required fields
            const description = document.getElementById('description').value.trim();
            const amount = document.getElementById('amount').value.trim();
            const category = document.getElementById('category').value.trim();
            const date = document.getElementById('date').value.trim();
            
            // Get site name from either dropdown or text input
            const siteSelect = document.getElementById('site-select').value;
            const siteInput = document.getElementById('site-name').value;
            const siteName = siteSelect && siteSelect !== 'add-new' ? siteSelect : siteInput || '';
            
            console.log('Form values:', { description, amount, category, date, siteName });
            
            // Validate required fields
            const missingFields = [];
            if (!description) missingFields.push('Description');
            if (!amount) missingFields.push('Amount');
            if (!category) missingFields.push('Category');
            if (!date) missingFields.push('Date');
            if (!siteName.trim()) missingFields.push('Site/Project Name');
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                this.showNotification(`Please fill the required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`, 'error');
                
                // Focus on the first missing field
                let firstMissingField = null;
                if (missingFields[0] === 'Description') firstMissingField = document.getElementById('description');
                else if (missingFields[0] === 'Amount') firstMissingField = document.getElementById('amount');
                else if (missingFields[0] === 'Category') firstMissingField = document.getElementById('category');
                else if (missingFields[0] === 'Date') firstMissingField = document.getElementById('date');
                else if (missingFields[0] === 'Site/Project Name') {
                    // Focus on the visible site field
                    const siteSelectField = document.getElementById('site-select');
                    const siteNameField = document.getElementById('site-name');
                    firstMissingField = siteNameField.style.display !== 'none' ? siteNameField : siteSelectField;
                }
                
                if (firstMissingField) firstMissingField.focus();
                
                return false;
            }
            
            // Get vendor name from either dropdown or text input
            const vendorSelect = document.getElementById('vendor-select').value;
            const vendorInput = document.getElementById('vendor').value;
            const vendorName = vendorSelect && vendorSelect !== 'new' ? vendorSelect : vendorInput || 'N/A';
            
            const transactionType = document.getElementById('transaction-type').value;
            
            const transaction = {
                id: Date.now(),
                type: transactionType,
                description: description,
                amount: parseFloat(amount),
                quantity: parseFloat(document.getElementById('quantity').value) || null,
                unit: document.getElementById('unit').value || null,
                category: category,
                date: date,
                vendor: vendorName,
                site: siteName.trim(),
                projectPhase: document.getElementById('project-phase').value || 'N/A',
                // Payment details (only for credit transactions)
                paymentMode: transactionType === 'credit' ? document.getElementById('payment-mode').value : null,
                bankAccount: transactionType === 'credit' ? document.getElementById('bank-account').value : null,
                paymentReference: transactionType === 'credit' ? document.getElementById('payment-reference-no').value : null,
                paymentNumber: transactionType === 'credit' ? document.getElementById('payment-number').value : null
            };

            console.log('Transaction created:', transaction);

            // Initialize expenses array if it doesn't exist
            if (!this.expenses) {
                this.expenses = [];
                console.log('Initialized expenses array');
            }

            this.expenses.unshift(transaction);
            console.log('Transaction added to expenses array, total expenses:', this.expenses.length);
            
            // Update vendor account if vendor is specified and not 'N/A'
            if (vendorName && vendorName !== 'N/A') {
                try {
                    this.updateVendorAccount(vendorName, transaction);
                } catch (e) {
                    console.error('Error updating vendor account:', e);
                }
            }
            
            // Save and update UI
            try {
                await this.saveAllData();
                console.log('Saved to storage');
            } catch (e) {
                console.error('Error saving to storage:', e);
            }
            
            try {
                this.updateSummary();
                console.log('Updated summary');
            } catch (e) {
                console.error('Error updating summary:', e);
            }
            
            try {
                this.renderExpenses();
                console.log('Rendered expenses');
            } catch (e) {
                console.error('Error rendering expenses:', e);
            }
            
            // Reset form
            form.reset();
            this.setTodayDate();
            
            // Hide payment details after reset
            try {
                document.getElementById('payment-details').style.display = 'none';
                document.getElementById('payment-reference').style.display = 'none';
            } catch (e) {
                console.error('Error hiding payment details:', e);
            }
            
            this.showNotification('Transaction added successfully!', 'success');
            console.log('=== addExpense completed successfully ===');
            return true;
            
        } catch (error) {
            console.error('Error in addExpense:', error);
            this.showNotification('Error adding transaction: ' + error.message, 'error');
            return false;
        }
    }

    updateVendorAccount(vendorName, transaction) {
        if (!this.vendors[vendorName]) {
            this.vendors[vendorName] = {
                name: vendorName,
                contact: '',
                email: '',
                address: '',
                gst: '',
                pan: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                category: '',
                expenses: [],
                totalDebits: 0,
                totalCredits: 0,
                netBalance: 0,
                createdDate: new Date().toISOString(),
                lastTransactionDate: transaction.date
            };
        }
        
        // Update last transaction date and modified date
        this.vendors[vendorName].lastTransactionDate = transaction.date;
        this.vendors[vendorName].updatedDate = new Date().toISOString();
        
        this.vendors[vendorName].expenses.push(transaction);
        
        if (transaction.type === 'debit') {
            // When materials/services are received, it increases the expense/liability
            this.vendors[vendorName].totalDebits += transaction.amount;
        } else {
            // When payment is made to vendor, it reduces the liability
            this.vendors[vendorName].totalCredits += transaction.amount;
        }
        
        // Outstanding balance: positive means company owes vendor, negative means overpaid
        this.vendors[vendorName].netBalance = this.vendors[vendorName].totalDebits - this.vendors[vendorName].totalCredits;
        
        // Auto-categorize vendor based on transaction category if not already set
        if (!this.vendors[vendorName].category && transaction.category) {
            this.vendors[vendorName].category = this.getCategoryBasedVendorType(transaction.category);
        }
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        
        // Update vendor dropdown and grid to reflect changes immediately
        this.updateVendorDropdown();
        this.renderVendorGrid();
        
        // Show notification about vendor update
        if (this.vendors[vendorName].expenses.length === 1) {
            this.showNotification(`New vendor "${vendorName}" created and transaction added!`, 'success');
        } else {
            this.showNotification(`Vendor "${vendorName}" updated with new transaction!`, 'success');
        }
        
        // Auto-save to server
        this.saveAllData();
    }

    // Helper method to determine vendor category based on transaction category
    getCategoryBasedVendorType(transactionCategory) {
        const categoryMapping = {
            'materials': 'material-supplier',
            'labor': 'contractor',
            'equipment': 'equipment-rental',
            'permits': 'service-provider',
            'utilities': 'service-provider',
            'transportation': 'service-provider',
            'other': 'other'
        };
        return categoryMapping[transactionCategory] || 'other';
    }

    // Method to get vendor activity statistics
    getVendorActivityStats() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const stats = {
            totalVendors: Object.keys(this.vendors).length,
            activeLastWeek: 0,
            activeLastMonth: 0,
            newThisMonth: 0,
            topVendorsByAmount: [],
            recentTransactions: []
        };
        
        Object.values(this.vendors).forEach(vendor => {
            // Check activity
            if (vendor.lastTransactionDate) {
                const lastTransaction = new Date(vendor.lastTransactionDate);
                if (lastTransaction >= sevenDaysAgo) {
                    stats.activeLastWeek++;
                }
                if (lastTransaction >= thirtyDaysAgo) {
                    stats.activeLastMonth++;
                }
            }
            
            // Check if vendor is new this month
            if (vendor.createdDate) {
                const created = new Date(vendor.createdDate);
                if (created >= thirtyDaysAgo) {
                    stats.newThisMonth++;
                }
            }
            
            // Add to top vendors list
            const totalAmount = (vendor.totalDebits || 0) + (vendor.totalCredits || 0);
            if (totalAmount > 0) {
                stats.topVendorsByAmount.push({
                    name: vendor.name,
                    totalAmount: totalAmount,
                    outstanding: (vendor.totalDebits || 0) - (vendor.totalCredits || 0),
                    transactionCount: vendor.expenses.length
                });
            }
        });
        
        // Sort top vendors by total amount
        stats.topVendorsByAmount.sort((a, b) => b.totalAmount - a.totalAmount);
        stats.topVendorsByAmount = stats.topVendorsByAmount.slice(0, 5);
        
        return stats;
    }

    handleVendorSelection(value) {
        const vendorInput = document.getElementById('vendor');
        const quickAddForm = document.getElementById('vendor-quick-add');
        
        if (value === 'new') {
            vendorInput.style.display = 'none';
            quickAddForm.style.display = 'block';
            document.getElementById('quick-vendor-name').focus();
        } else if (value === '') {
            vendorInput.style.display = 'block';
            vendorInput.value = '';
            quickAddForm.style.display = 'none';
        } else {
            vendorInput.style.display = 'none';
            vendorInput.value = value;
            quickAddForm.style.display = 'none';
        }
    }

    showQuickVendorForm() {
        document.getElementById('vendor-quick-add').style.display = 'block';
        document.getElementById('quick-vendor-name').focus();
    }

    hideQuickVendorForm() {
        document.getElementById('vendor-quick-add').style.display = 'none';
        document.getElementById('vendor-select').value = '';
        document.getElementById('vendor').style.display = 'block';
        this.clearQuickVendorForm();
    }

    clearQuickVendorForm() {
        document.getElementById('quick-vendor-name').value = '';
        document.getElementById('quick-vendor-contact').value = '';
        document.getElementById('quick-vendor-email').value = '';
        document.getElementById('quick-vendor-address').value = '';
        document.getElementById('quick-vendor-gst').value = '';
        document.getElementById('quick-vendor-pan').value = '';
    }

    saveQuickVendor() {
        const name = document.getElementById('quick-vendor-name').value.trim();
        const contact = document.getElementById('quick-vendor-contact').value.trim();
        const email = document.getElementById('quick-vendor-email').value.trim();
        const address = document.getElementById('quick-vendor-address').value.trim();
        const gst = document.getElementById('quick-vendor-gst').value.trim();
        const pan = document.getElementById('quick-vendor-pan').value.trim();
        
        if (!name) {
            this.showNotification('Please enter vendor name', 'error');
            document.getElementById('quick-vendor-name').focus();
            return;
        }
        
        if (this.vendors[name]) {
            this.showNotification('Vendor already exists', 'error');
            return;
        }
        
        this.vendors[name] = {
            name: name,
            contact: contact,
            email: email,
            address: address,
            gst: gst,
            pan: pan,
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            category: '',
            expenses: [],
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.updateVendorDropdown();
        this.renderVendorGrid();
        
        // Select the newly created vendor
        document.getElementById('vendor-select').value = name;
        document.getElementById('vendor').value = name;
        
        this.hideQuickVendorForm();
        this.showNotification('Vendor added and selected successfully!', 'success');
    }

    updateVendorDropdown() {
        const vendorSelect = document.getElementById('vendor-select');
        const currentValue = vendorSelect.value;
        
        // Clear existing options except default ones
        vendorSelect.innerHTML = `
            <option value="">Select Vendor</option>
            <option value="new">+ Add New Vendor</option>
        `;
        
        // Add existing vendors
        Object.keys(this.vendors).forEach(vendorName => {
            const option = document.createElement('option');
            option.value = vendorName;
            option.textContent = vendorName;
            vendorSelect.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && this.vendors[currentValue]) {
            vendorSelect.value = currentValue;
        }
    }

    showAddVendorForm() {
        document.getElementById('add-vendor-form').style.display = 'block';
        document.getElementById('vendor-name').focus();
    }

    hideAddVendorForm() {
        document.getElementById('add-vendor-form').style.display = 'none';
        this.clearVendorForm();
    }

    clearVendorForm() {
        document.getElementById('vendor-name').value = '';
        document.getElementById('vendor-contact').value = '';
        document.getElementById('vendor-email').value = '';
        document.getElementById('vendor-address').value = '';
    }

    saveVendor() {
        const name = document.getElementById('vendor-name').value.trim();
        const contact = document.getElementById('vendor-contact').value.trim();
        const email = document.getElementById('vendor-email').value.trim();
        const address = document.getElementById('vendor-address').value.trim();
        const gst = document.getElementById('vendor-gst').value.trim();
        const pan = document.getElementById('vendor-pan').value.trim();
        const bankName = document.getElementById('vendor-bank-name').value.trim();
        const accountNumber = document.getElementById('vendor-account-number').value.trim();
        const ifscCode = document.getElementById('vendor-ifsc').value.trim();
        const category = document.getElementById('vendor-category').value;
        
        if (!name) {
            this.showNotification('Please enter vendor name', 'error');
            return;
        }
        
        if (this.vendors[name]) {
            this.showNotification('Vendor already exists', 'error');
            return;
        }
        
        this.vendors[name] = {
            name: name,
            contact: contact,
            email: email,
            address: address,
            gst: gst,
            pan: pan,
            bankName: bankName,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            category: category,
            expenses: [],
            totalDebits: 0,
            totalCredits: 0,
            netBalance: 0,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.updateVendorDropdown();
        this.renderVendorGrid();
        this.hideAddVendorForm();
        this.showNotification('Vendor added successfully!', 'success');
    }

    renderVendorGrid() {
        const vendorGrid = document.getElementById('vendor-grid');
        const vendors = Object.values(this.vendors);
        
        if (vendors.length === 0) {
            vendorGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-store" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                    <p>No vendors added yet</p>
                    <p style="color: #666; font-size: 0.9rem;">Add vendors to track expenses by supplier</p>
                </div>
            `;
            return;
        }
        
        vendorGrid.innerHTML = vendors.map(vendor => {
            const outstandingBalance = (vendor.totalDebits || 0) - (vendor.totalCredits || 0);
            const lastTransactionDate = vendor.lastTransactionDate ? this.formatDate(vendor.lastTransactionDate) : 'No transactions';
            const isRecentlyActive = vendor.lastTransactionDate && 
                (new Date() - new Date(vendor.lastTransactionDate)) < (7 * 24 * 60 * 60 * 1000); // 7 days
            
            return `
                <div class="vendor-card ${isRecentlyActive ? 'recently-active' : ''}" onclick="window.tracker.showVendorDetails('${vendor.name}')">
                    <div class="vendor-card-header">
                        <h4 class="vendor-name">${vendor.name}</h4>
                        <span class="vendor-total ${outstandingBalance > 0 ? 'net-negative' : outstandingBalance < 0 ? 'net-positive' : ''}">
                            ₹${this.formatCurrency(Math.abs(outstandingBalance))}
                        </span>
                    </div>
                    ${vendor.category ? `<div class="vendor-category">
                        <span class="vendor-category-badge category-${vendor.category}">
                            ${vendor.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        ${isRecentlyActive ? '<span class="activity-indicator" title="Active in last 7 days"><i class="fas fa-circle"></i></span>' : ''}
                    </div>` : isRecentlyActive ? `<div class="vendor-category">
                        <span class="activity-indicator" title="Active in last 7 days"><i class="fas fa-circle"></i> Recently Active</span>
                    </div>` : ''}
                    <div class="vendor-details">
                        ${vendor.contact ? `<div><i class="fas fa-phone"></i> ${vendor.contact}</div>` : ''}
                        ${vendor.email ? `<div><i class="fas fa-envelope"></i> ${vendor.email}</div>` : ''}
                        ${vendor.address ? `<div><i class="fas fa-map-marker-alt"></i> ${vendor.address}</div>` : ''}
                        ${vendor.gst ? `<div><i class="fas fa-file-invoice"></i> GST: ${vendor.gst}</div>` : ''}
                        <div class="last-transaction">
                            <i class="fas fa-clock"></i> Last: ${lastTransactionDate}
                        </div>
                    </div>
                    <div class="vendor-stats">
                        <span>${vendor.expenses.length} transactions</span>
                        <span class="debit">Expenses: ₹${this.formatCurrency(vendor.totalDebits || 0)}</span>
                        <span class="credit">Paid: ₹${this.formatCurrency(vendor.totalCredits || 0)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    showVendorDetails(vendorName) {
        const vendor = this.vendors[vendorName];
        if (!vendor) return;
        
        this.currentEditingVendor = vendorName;
        
        const outstandingBalance = (vendor.totalDebits || 0) - (vendor.totalCredits || 0);
        
        document.getElementById('modal-vendor-name').textContent = vendor.name;
        document.getElementById('modal-vendor-contact').textContent = vendor.contact || '-';
        document.getElementById('modal-vendor-email').textContent = vendor.email || '-';
        document.getElementById('modal-vendor-address').textContent = vendor.address || '-';
        document.getElementById('modal-vendor-gst').textContent = vendor.gst || '-';
        document.getElementById('modal-vendor-pan').textContent = vendor.pan || '-';
        document.getElementById('modal-vendor-category').textContent = vendor.category ? vendor.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
        document.getElementById('modal-vendor-bank').textContent = vendor.bankName || '-';
        document.getElementById('modal-vendor-account').textContent = vendor.accountNumber ? `****${vendor.accountNumber.slice(-4)}` : '-';
        document.getElementById('modal-vendor-ifsc').textContent = vendor.ifscCode || '-';
        document.getElementById('modal-vendor-debits').textContent = `₹${this.formatCurrency(vendor.totalDebits || 0)}`;
        document.getElementById('modal-vendor-credits').textContent = `₹${this.formatCurrency(vendor.totalCredits || 0)}`;
        
        const balanceElement = document.getElementById('modal-vendor-balance');
        balanceElement.textContent = `₹${this.formatCurrency(Math.abs(outstandingBalance))}`;
        balanceElement.className = `amount ${outstandingBalance > 0 ? 'net-negative' : outstandingBalance < 0 ? 'net-positive' : ''}`;
        
        const expensesBody = document.getElementById('modal-vendor-expenses');
        if (vendor.expenses.length === 0) {
            expensesBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                        No transactions recorded for this vendor
                    </td>
                </tr>
            `;
        } else {
            expensesBody.innerHTML = vendor.expenses.map(expense => `
                <tr>
                    <td>${this.formatDate(expense.date)}</td>
                    <td>
                        <span class="transaction-type transaction-${expense.type || 'debit'}">
                            ${(expense.type || 'debit') === 'debit' ? 'EXPENSE' : 'PAYMENT'}
                        </span>
                    </td>
                    <td>${expense.description}</td>
                    <td>
                        ${expense.paymentMode ? `<span class="payment-mode-badge payment-${expense.paymentMode}">${expense.paymentMode.toUpperCase()}</span>` : '-'}
                    </td>
                    <td>
                        ${expense.paymentNumber ? `<span class="payment-number">${expense.paymentNumber}</span>` : '-'}
                    </td>
                    <td class="amount ${(expense.type || 'debit') === 'debit' ? 'debit' : ''}">
                        ${(expense.type || 'debit') === 'debit' ? '₹' + this.formatCurrency(expense.amount) : '-'}
                    </td>
                    <td class="amount ${(expense.type || 'debit') === 'credit' ? 'credit' : ''}">
                        ${(expense.type || 'debit') === 'credit' ? '₹' + this.formatCurrency(expense.amount) : '-'}
                    </td>
                </tr>
            `).join('');
        }
        
        document.getElementById('vendor-modal').style.display = 'flex';
    }

    showEditVendorForm() {
        if (!this.currentEditingVendor) return;
        
        const vendor = this.vendors[this.currentEditingVendor];
        if (!vendor) return;
        
        // Populate edit form with current vendor data
        document.getElementById('edit-vendor-name').value = vendor.name;
        document.getElementById('edit-vendor-contact').value = vendor.contact || '';
        document.getElementById('edit-vendor-email').value = vendor.email || '';
        document.getElementById('edit-vendor-address').value = vendor.address || '';
        document.getElementById('edit-vendor-gst').value = vendor.gst || '';
        document.getElementById('edit-vendor-pan').value = vendor.pan || '';
        document.getElementById('edit-vendor-bank-name').value = vendor.bankName || '';
        document.getElementById('edit-vendor-account-number').value = vendor.accountNumber || '';
        document.getElementById('edit-vendor-ifsc').value = vendor.ifscCode || '';
        document.getElementById('edit-vendor-category').value = vendor.category || '';
        
        // Hide vendor details modal and show edit modal
        document.getElementById('vendor-modal').style.display = 'none';
        document.getElementById('vendor-edit-modal').style.display = 'flex';
    }

    hideEditVendorForm() {
        document.getElementById('vendor-edit-modal').style.display = 'none';
        this.currentEditingVendor = null;
    }

    updateVendor() {
        if (!this.currentEditingVendor) return;
        
        const vendor = this.vendors[this.currentEditingVendor];
        if (!vendor) return;
        
        // Update vendor with new data
        vendor.contact = document.getElementById('edit-vendor-contact').value.trim();
        vendor.email = document.getElementById('edit-vendor-email').value.trim();
        vendor.address = document.getElementById('edit-vendor-address').value.trim();
        vendor.gst = document.getElementById('edit-vendor-gst').value.trim();
        vendor.pan = document.getElementById('edit-vendor-pan').value.trim();
        vendor.bankName = document.getElementById('edit-vendor-bank-name').value.trim();
        vendor.accountNumber = document.getElementById('edit-vendor-account-number').value.trim();
        vendor.ifscCode = document.getElementById('edit-vendor-ifsc').value.trim();
        vendor.category = document.getElementById('edit-vendor-category').value;
        vendor.updatedDate = new Date().toISOString();
        
        localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
        this.renderVendorGrid();
        this.hideEditVendorForm();
        this.showNotification('Vendor updated successfully!', 'success');
    }

    closeVendorModal() {
        document.getElementById('vendor-modal').style.display = 'none';
    }

    showVendorSummaryModal() {
        const vendors = Object.values(this.vendors);
        if (vendors.length === 0) {
            this.showNotification('No vendors to show summary for', 'error');
            return;
        }
        
        // Calculate summary statistics
        let totalOutstanding = 0;
        let totalTransactions = 0;
        
        vendors.forEach(vendor => {
            const outstanding = (vendor.totalDebits || 0) - (vendor.totalCredits || 0);
            totalOutstanding += outstanding;
            totalTransactions += vendor.expenses.length;
        });
        
        // Update summary stats
        document.getElementById('total-vendors-count').textContent = vendors.length;
        document.getElementById('total-outstanding-amount').textContent = `₹${this.formatCurrency(Math.abs(totalOutstanding))}`;
        document.getElementById('total-transactions-count').textContent = totalTransactions;
        
        // Sort vendors by outstanding amount (highest first)
        vendors.sort((a, b) => {
            const outstandingA = (a.totalDebits || 0) - (a.totalCredits || 0);
            const outstandingB = (b.totalDebits || 0) - (b.totalCredits || 0);
            return outstandingB - outstandingA;
        });
        
        // Populate vendor summary table
        const tbody = document.getElementById('vendor-summary-tbody');
        tbody.innerHTML = vendors.map(vendor => {
            const outstanding = (vendor.totalDebits || 0) - (vendor.totalCredits || 0);
            return `
                <tr>
                    <td><strong>${vendor.name}</strong></td>
                    <td>
                        ${vendor.category ? `<span class="vendor-category-badge category-${vendor.category}">
                            ${vendor.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>` : '-'}
                    </td>
                    <td>${vendor.expenses.length}</td>
                    <td class="amount debit">₹${this.formatCurrency(vendor.totalDebits || 0)}</td>
                    <td class="amount credit">₹${this.formatCurrency(vendor.totalCredits || 0)}</td>
                    <td class="amount ${outstanding > 0 ? 'outstanding-positive' : outstanding < 0 ? 'outstanding-negative' : ''}">
                        ₹${this.formatCurrency(Math.abs(outstanding))}
                        ${outstanding > 0 ? ' (Owe)' : outstanding < 0 ? ' (Advance)' : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('vendor-summary-modal').style.display = 'flex';
    }

    hideVendorSummaryModal() {
        document.getElementById('vendor-summary-modal').style.display = 'none';
    }

    showBankManagementModal() {
        this.renderBankAccountsGrid();
        document.getElementById('bank-management-modal').style.display = 'flex';
    }

    hideBankManagementModal() {
        document.getElementById('bank-management-modal').style.display = 'none';
        this.hideBankAccountForm();
    }

    renderBankAccountsGrid() {
        const bankGrid = document.getElementById('bank-accounts-grid');
        const accounts = Object.values(this.bankAccounts);
        
        if (accounts.length === 0) {
            bankGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-university" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                    <p>No bank accounts added yet</p>
                    <p style="color: #666; font-size: 0.9rem;">Add bank accounts to track payments</p>
                </div>
            `;
            return;
        }
        
        bankGrid.innerHTML = accounts.map(account => `
            <div class="bank-account-card">
                <div class="bank-card-header">
                    <h4 class="bank-name">${account.bankName}</h4>
                    <div class="bank-card-actions">
                        <span class="account-type">${account.accountType}</span>
                        <button class="edit-bank-btn" onclick="window.tracker.editBankAccount('${account.id}')" title="Edit Account">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-bank-btn" onclick="window.tracker.deleteBankAccount('${account.id}')" title="Delete Account">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="bank-details">
                    <div><strong>Account Number:</strong> <span class="account-number">****${account.accountNumber.slice(-4)}</span></div>
                    <div><strong>IFSC Code:</strong> ${account.ifscCode}</div>
                    ${account.branchName ? `<div><strong>Branch:</strong> ${account.branchName}</div>` : ''}
                    ${account.accountHolder ? `<div><strong>Account Holder:</strong> ${account.accountHolder}</div>` : ''}
                    <div class="bank-meta">
                        <small>Added: ${new Date(account.createdDate || Date.now()).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showBankAccountForm(editMode = false, accountId = null) {
        const formContainer = document.getElementById('bank-account-form-container');
        const formTitle = document.getElementById('bank-form-title');
        const saveBtn = document.getElementById('save-bank-account-btn');
        const cancelBtn = document.getElementById('cancel-bank-account-btn');
        
        if (editMode && accountId) {
            const account = this.bankAccounts[accountId];
            if (account) {
                formTitle.textContent = 'Edit Bank Account';
                saveBtn.textContent = 'Update Account';
                saveBtn.onclick = () => this.updateBankAccount(accountId);
                
                // Populate form with existing data
                document.getElementById('bank-form-name').value = account.bankName;
                document.getElementById('bank-form-type').value = account.accountType;
                document.getElementById('bank-form-number').value = account.accountNumber;
                document.getElementById('bank-form-ifsc').value = account.ifscCode;
                document.getElementById('bank-form-branch').value = account.branchName || '';
                document.getElementById('bank-form-holder').value = account.accountHolder || '';
            }
        } else {
            formTitle.textContent = 'Add New Bank Account';
            saveBtn.textContent = 'Add Account';
            saveBtn.onclick = () => this.saveBankAccount();
            this.clearBankAccountForm();
        }
        
        formContainer.style.display = 'block';
        document.getElementById('bank-form-name').focus();
    }

    hideBankAccountForm() {
        document.getElementById('bank-account-form-container').style.display = 'none';
        this.clearBankAccountForm();
    }

    clearBankAccountForm() {
        document.getElementById('bank-form-name').value = '';
        document.getElementById('bank-form-type').value = '';
        document.getElementById('bank-form-number').value = '';
        document.getElementById('bank-form-ifsc').value = '';
        document.getElementById('bank-form-branch').value = '';
        document.getElementById('bank-form-holder').value = '';
    }

    saveBankAccount() {
        const bankName = document.getElementById('bank-form-name').value.trim();
        const accountType = document.getElementById('bank-form-type').value;
        const accountNumber = document.getElementById('bank-form-number').value.trim();
        const ifscCode = document.getElementById('bank-form-ifsc').value.trim();
        const branchName = document.getElementById('bank-form-branch').value.trim();
        const accountHolder = document.getElementById('bank-form-holder').value.trim();
        
        if (!bankName || !accountType || !accountNumber || !ifscCode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // Check if account number already exists
        const existingAccount = Object.values(this.bankAccounts).find(acc => acc.accountNumber === accountNumber);
        if (existingAccount) {
            this.showNotification('Account number already exists', 'error');
            return;
        }
        
        const accountId = `${bankName.toLowerCase().replace(/\s+/g, '-')}-${accountType}-${Date.now()}`;
        
        this.bankAccounts[accountId] = {
            id: accountId,
            bankName: bankName,
            accountType: accountType,
            accountNumber: accountNumber,
            ifscCode: ifscCode,
            branchName: branchName,
            accountHolder: accountHolder,
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
        this.updateBankAccountDropdown();
        this.renderBankAccountsGrid();
        this.hideBankAccountForm();
        this.showNotification('Bank account added successfully!', 'success');
    }

    editBankAccount(accountId) {
        this.showBankAccountForm(true, accountId);
    }

    updateBankAccount(accountId) {
        const account = this.bankAccounts[accountId];
        if (!account) {
            this.showNotification('Account not found', 'error');
            return;
        }
        
        const bankName = document.getElementById('bank-form-name').value.trim();
        const accountType = document.getElementById('bank-form-type').value;
        const accountNumber = document.getElementById('bank-form-number').value.trim();
        const ifscCode = document.getElementById('bank-form-ifsc').value.trim();
        const branchName = document.getElementById('bank-form-branch').value.trim();
        const accountHolder = document.getElementById('bank-form-holder').value.trim();
        
        if (!bankName || !accountType || !accountNumber || !ifscCode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        // Check if account number already exists (excluding current account)
        const existingAccount = Object.values(this.bankAccounts).find(acc => 
            acc.accountNumber === accountNumber && acc.id !== accountId
        );
        if (existingAccount) {
            this.showNotification('Account number already exists', 'error');
            return;
        }
        
        // Update account details
        account.bankName = bankName;
        account.accountType = accountType;
        account.accountNumber = accountNumber;
        account.ifscCode = ifscCode;
        account.branchName = branchName;
        account.accountHolder = accountHolder;
        account.updatedDate = new Date().toISOString();
        
        localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
        this.updateBankAccountDropdown();
        this.renderBankAccountsGrid();
        this.hideBankAccountForm();
        this.showNotification('Bank account updated successfully!', 'success');
    }

    deleteBankAccount(accountId) {
        const account = this.bankAccounts[accountId];
        if (!account) {
            this.showNotification('Account not found', 'error');
            return;
        }
        
        // Check if this account is used in any transactions
        const usedInTransactions = this.expenses.some(expense => expense.bankAccount === accountId);
        
        let confirmMessage = `Are you sure you want to delete the bank account "${account.bankName} ${account.accountType}"?`;
        if (usedInTransactions) {
            confirmMessage += '\n\nWarning: This account is used in existing transactions. Deleting it will not affect existing transactions but the account will no longer be available for new transactions.';
        }
        
        if (confirm(confirmMessage)) {
            delete this.bankAccounts[accountId];
            localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
            this.updateBankAccountDropdown();
            this.renderBankAccountsGrid();
            this.showNotification('Bank account deleted successfully!', 'success');
        }
    }

    deleteAllBankAccounts() {
        if (Object.keys(this.bankAccounts).length === 0) {
            this.showNotification('No bank accounts to delete', 'error');
            return;
        }
        
        const usedAccounts = this.expenses.filter(expense => expense.bankAccount).length;
        let confirmMessage = `Are you sure you want to delete ALL bank accounts? This will remove ${Object.keys(this.bankAccounts).length} bank accounts.`;
        
        if (usedAccounts > 0) {
            confirmMessage += `\n\nWarning: Some accounts are used in ${usedAccounts} existing transactions. Deleting them will not affect existing transactions but the accounts will no longer be available for new transactions.`;
        }
        
        confirmMessage += '\n\nThis action cannot be undone!';
        
        if (confirm(confirmMessage)) {
            this.bankAccounts = {};
            localStorage.setItem(this.userBankAccountsKey, JSON.stringify(this.bankAccounts));
            this.updateBankAccountDropdown();
            this.renderBankAccountsGrid();
            this.showNotification('All bank accounts deleted successfully!', 'success');
        }
    }

    setBudget() {
        const budgetInput = document.getElementById('budget-input');
        const budget = parseFloat(budgetInput.value);
        
        if (budget && budget > 0) {
            this.budget = budget;
            localStorage.setItem(this.userBudgetKey, budget.toString());
            this.updateSummary();
            budgetInput.value = '';
            this.showNotification('Budget updated successfully!', 'success');
        } else {
            this.showNotification('Please enter a valid budget amount', 'error');
        }
    }

    updateBudgetDisplay() {
        const budgetInput = document.getElementById('budget-input');
        if (this.budget > 0) {
            budgetInput.placeholder = `Current: ₹${this.formatCurrency(this.budget)}`;
        }
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            const transactionToDelete = this.expenses.find(expense => expense.id === id);
            
            if (transactionToDelete && transactionToDelete.vendor && transactionToDelete.vendor !== 'N/A') {
                // Update vendor account
                const vendor = this.vendors[transactionToDelete.vendor];
                if (vendor) {
                    vendor.expenses = vendor.expenses.filter(expense => expense.id !== id);
                    
                    if (transactionToDelete.type === 'debit') {
                        vendor.totalDebits -= transactionToDelete.amount;
                    } else {
                        vendor.totalCredits -= transactionToDelete.amount;
                    }
                    
                    vendor.netBalance = vendor.totalDebits - vendor.totalCredits;
                    
                    // Remove vendor if no expenses left and it was auto-created
                    if (vendor.expenses.length === 0 && !vendor.contact && !vendor.email && !vendor.address) {
                        delete this.vendors[transactionToDelete.vendor];
                    }
                    
                    localStorage.setItem(this.userVendorsKey, JSON.stringify(this.vendors));
                }
            }
            
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveToStorage();
            this.updateSummary();
            this.renderExpenses();
            this.updateVendorDropdown();
            this.renderVendorGrid();
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }

    updateSummary() {
        console.log('=== updateSummary called ===');
        console.log('currentSiteFilter:', this.currentSiteFilter);
        console.log('Total expenses:', this.expenses.length);
        
        // Filter expenses by site if a site filter is active
        let filteredExpenses = this.expenses;
        if (this.currentSiteFilter) {
            filteredExpenses = this.expenses.filter(expense => expense.site === this.currentSiteFilter);
            console.log('Filtered expenses count:', filteredExpenses.length);
        }

        const totalExpensesReceivables = filteredExpenses
            .filter(expense => expense.type === 'debit')
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const totalPaymentsMade = filteredExpenses
            .filter(expense => expense.type === 'credit')
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const outstandingBalance = totalExpensesReceivables - totalPaymentsMade;
        const expenseCount = filteredExpenses.length;

        console.log('Summary calculated:', {
            totalExpensesReceivables,
            totalPaymentsMade,
            outstandingBalance,
            expenseCount
        });

        // Update main summary cards
        document.getElementById('total-debits').textContent = `₹${this.formatCurrency(totalExpensesReceivables)}`;
        document.getElementById('total-credits').textContent = `₹${this.formatCurrency(totalPaymentsMade)}`;
        document.getElementById('net-balance').textContent = `₹${this.formatCurrency(Math.abs(outstandingBalance))}`;
        document.getElementById('expense-count').textContent = expenseCount;

        // Update outstanding balance color - from construction company perspective
        const netBalanceElement = document.getElementById('net-balance');
        if (outstandingBalance > 0) {
            netBalanceElement.className = 'net-negative'; // Company owes money (has unpaid expenses)
        } else if (outstandingBalance < 0) {
            netBalanceElement.className = 'net-positive'; // Company has overpaid (advance payments)
        } else {
            netBalanceElement.className = '';
        }

        // Update budget summary if enabled (consider total expenses for budget)
        if (this.budgetEnabled && this.budget > 0) {
            const remaining = this.budget - totalExpensesReceivables;
            const percentage = (totalExpensesReceivables / this.budget) * 100;

            document.getElementById('budget-amount').textContent = `₹${this.formatCurrency(this.budget)}`;
            document.getElementById('remaining-amount').textContent = `₹${this.formatCurrency(remaining)}`;

            // Update progress bar
            const progressFill = document.getElementById('progress-fill');
            progressFill.style.width = `${Math.min(percentage, 100)}%`;

            // Update progress bar color based on percentage
            progressFill.className = 'progress-fill';
            if (percentage >= 100) {
                progressFill.classList.add('danger');
            } else if (percentage >= 80) {
                progressFill.classList.add('warning');
            }

            // Update remaining amount color
            const remainingElement = document.getElementById('remaining-amount');
            if (remaining < 0) {
                remainingElement.style.color = '#e74c3c';
            } else if (remaining < this.budget * 0.1) {
                remainingElement.style.color = '#f39c12';
            } else {
                remainingElement.style.color = '#27ae60';
            }
        }
    }

    renderExpenses() {
        const tbody = document.getElementById('expenses-tbody');
        const categoryFilter = document.getElementById('category-filter').value;
        const siteFilter = document.getElementById('site-filter').value;
        
        let filteredExpenses = this.expenses;
        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        }
        if (siteFilter) {
            filteredExpenses = filteredExpenses.filter(expense => expense.site === siteFilter);
        }

        if (filteredExpenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>No expenses found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredExpenses.map(expense => `
            <tr>
                <td>${this.formatDate(expense.date)}</td>
                <td>${expense.site || 'N/A'}</td>
                <td>
                    <span class="transaction-type transaction-${expense.type || 'debit'}">
                        ${(expense.type || 'debit') === 'debit' ? 'EXPENSE' : 'PAYMENT'}
                    </span>
                </td>
                <td>${expense.description}</td>
                <td>${expense.vendor}</td>
                <td>
                    ${expense.paymentMode ? `<span class="payment-mode-badge payment-${expense.paymentMode}">${expense.paymentMode.toUpperCase()}</span>` : '-'}
                </td>
                <td>
                    ${expense.paymentNumber ? `<span class="payment-number">${expense.paymentNumber}</span>` : '-'}
                </td>
                <td class="amount ${(expense.type || 'debit') === 'debit' ? 'debit' : ''}">
                    ${(expense.type || 'debit') === 'debit' ? '₹' + this.formatCurrency(expense.amount) : '-'}
                </td>
                <td class="amount ${(expense.type || 'debit') === 'credit' ? 'credit' : ''}">
                    ${(expense.type || 'debit') === 'credit' ? '₹' + this.formatCurrency(expense.amount) : '-'}
                </td>
                <td>
                    <button class="delete-btn" onclick="window.tracker.deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        // Format currency in Indian style with commas
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatQuantity(quantity) {
        if (quantity === null || quantity === undefined) {
            return '-';
        }
        // Format quantity with appropriate decimal places
        return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
    }

    formatUnit(unit) {
        if (!unit) {
            return '-';
        }
        return unit;
    }

    getUnitDisplayName(unit) {
        const unitMap = {
            'mm': 'mm', 'cm': 'cm', 'm': 'm', 'km': 'km', 'ft': 'ft', 'inch': 'in',
            'sqm': 'sq.m', 'sqft': 'sq.ft', 'acre': 'acre',
            'cum': 'cu.m', 'cuft': 'cu.ft', 'liter': 'L',
            'kg': 'kg', 'ton': 't', 'quintal': 'q', 'lb': 'lb',
            'nos': 'nos', 'pcs': 'pcs', 'set': 'set', 'pair': 'pair', 'dozen': 'dozen',
            'bundle': 'bundle', 'bag': 'bag', 'box': 'box',
            'hour': 'hr', 'day': 'day', 'week': 'week', 'month': 'month',
            'lot': 'lot', 'job': 'job', 'service': 'service'
        };
        return unitMap[unit] || unit;
    }

    exportToCSV() {
        if (this.expenses.length === 0) {
            this.showNotification('No expenses to export', 'error');
            return;
        }

        const headers = ['Date', 'Site/Project', 'Type', 'Description', 'Vendor', 'Payment Mode', 'Payment Number', 'Bank Account', 'Reference No.', 'Expense/Receivable (₹)', 'Payment Made (₹)'];
        const csvContent = [
            headers.join(','),
            ...this.expenses.map(expense => [
                expense.date,
                `"${expense.site || 'N/A'}"`,
                (expense.type || 'debit') === 'debit' ? 'EXPENSE' : 'PAYMENT',
                `"${expense.description}"`,
                `"${expense.vendor}"`,
                expense.paymentMode || '',
                expense.paymentNumber || '',
                expense.bankAccount || '',
                expense.paymentReference || '',
                (expense.type || 'debit') === 'debit' ? expense.amount : '',
                (expense.type || 'debit') === 'credit' ? expense.amount : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `construction-expenses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Expenses exported successfully!', 'success');
    }

    exportToPDF() {
        if (this.expenses.length === 0) {
            this.showNotification('No expenses to export', 'error');
            return;
        }

        // Get jsPDF from the global scope
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

        // Get user info for company name
        const userInfo = apiClient.getUserInfo();
        const companyName = userInfo?.company || 'Construction Company';

        // Get current filters
        const siteFilter = document.getElementById('site-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;

        // Filter expenses based on current filters
        let filteredExpenses = this.expenses;
        if (siteFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.site === siteFilter);
        }
        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
        }

        // Add header with company name
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text(companyName, 148, 15, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('Expense Report', 148, 23, { align: 'center' });

        // Add generation date and filters
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const generatedDate = new Date().toLocaleString('en-IN', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        });
        doc.text(`Generated: ${generatedDate}`, 14, 30);

        let yPos = 35;
        if (siteFilter || categoryFilter) {
            doc.setFont(undefined, 'bold');
            doc.text('Filters Applied:', 14, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 5;
            if (siteFilter) {
                const siteName = this.sites[siteFilter]?.name || siteFilter;
                doc.text(`Site/Project: ${siteName}`, 14, yPos);
                yPos += 5;
            }
            if (categoryFilter) {
                doc.text(`Category: ${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}`, 14, yPos);
                yPos += 5;
            }
        }

        // Prepare table data
        const tableData = filteredExpenses.map(expense => {
            const type = (expense.type || 'debit') === 'debit' ? 'EXPENSE' : 'PAYMENT';
            const debitAmount = (expense.type || 'debit') === 'debit' ? 'Rs.' + this.formatCurrency(expense.amount) : '-';
            const creditAmount = (expense.type || 'debit') === 'credit' ? 'Rs.' + this.formatCurrency(expense.amount) : '-';
            
            return [
                expense.date,
                expense.site || 'N/A',
                type,
                expense.description,
                expense.vendor,
                expense.paymentMode || '-',
                expense.paymentNumber || '-',
                debitAmount,
                creditAmount
            ];
        });

        // Add table
        doc.autoTable({
            startY: yPos + 5,
            head: [[
                'Date',
                'Site/Project',
                'Type',
                'Description',
                'Vendor',
                'Payment Mode',
                'Payment No.',
                'Expense (Rs.)',
                'Payment (Rs.)'
            ]],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [102, 126, 234],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 2
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            columnStyles: {
                0: { cellWidth: 22 }, // Date
                1: { cellWidth: 30 }, // Site
                2: { cellWidth: 20 }, // Type
                3: { cellWidth: 45 }, // Description
                4: { cellWidth: 30 }, // Vendor
                5: { cellWidth: 25 }, // Payment Mode
                6: { cellWidth: 25 }, // Payment No.
                7: { cellWidth: 25, halign: 'right' }, // Expense
                8: { cellWidth: 25, halign: 'right' }  // Payment
            },
            margin: { left: 14, right: 14 }
        });

        // Calculate totals
        const totalDebits = filteredExpenses
            .filter(e => (e.type || 'debit') === 'debit')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        const totalCredits = filteredExpenses
            .filter(e => (e.type || 'debit') === 'credit')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        const netBalance = totalDebits - totalCredits;

        // Add summary section
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary', 14, finalY);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Use string concatenation instead of template literals to avoid encoding issues
        const totalExpensesText = 'Total Expenses/Receivables: Rs.' + this.formatCurrency(totalDebits);
        const totalPaymentsText = 'Total Payments Made: Rs.' + this.formatCurrency(totalCredits);
        const outstandingText = 'Outstanding Balance: Rs.' + this.formatCurrency(netBalance);
        
        doc.text(totalExpensesText, 14, finalY + 7);
        doc.text(totalPaymentsText, 14, finalY + 14);
        
        doc.setFont(undefined, 'bold');
        const balanceColor = netBalance >= 0 ? [239, 68, 68] : [16, 185, 129];
        doc.setTextColor(...balanceColor);
        doc.text(outstandingText, 14, finalY + 21);
        doc.setTextColor(0, 0, 0);

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save the PDF
        const fileName = `${companyName.replace(/\s+/g, '-')}-Expense-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        this.showNotification('PDF exported successfully!', 'success');
    }

    saveToStorage() {
        localStorage.setItem(this.userDataKey, JSON.stringify(this.expenses));
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                .notification.success {
                    background: #27ae60;
                }
                .notification.error {
                    background: #e74c3c;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Method to get expense statistics
    getExpenseStats() {
        const stats = {};
        this.expenses.forEach(expense => {
            if (!stats[expense.category]) {
                stats[expense.category] = 0;
            }
            stats[expense.category] += expense.amount;
        });
        return stats;
    }

    // Method to calculate unit rate
    calculateUnitRate(expense) {
        if (expense.quantity && expense.quantity > 0) {
            return expense.amount / expense.quantity;
        }
        return null;
    }

    // Method to get expenses with unit rates
    getExpensesWithRates() {
        return this.expenses.map(expense => ({
            ...expense,
            unitRate: this.calculateUnitRate(expense)
        }));
    }

    // Method to get material quantity summary
    getMaterialQuantitySummary() {
        const summary = {};
        this.expenses.forEach(expense => {
            if (expense.quantity && expense.unit && expense.category === 'materials') {
                const key = `${expense.description}_${expense.unit}`;
                if (!summary[key]) {
                    summary[key] = {
                        description: expense.description,
                        unit: expense.unit,
                        totalQuantity: 0,
                        totalAmount: 0,
                        entries: 0
                    };
                }
                summary[key].totalQuantity += expense.quantity;
                summary[key].totalAmount += expense.amount;
                summary[key].entries += 1;
            }
        });
        return summary;
    }

    // Method to get expenses by date range
    getExpensesByDateRange(startDate, endDate) {
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
    }

    // Method to get payment statistics
    getPaymentStats() {
        const paymentStats = {};
        this.expenses
            .filter(expense => expense.type === 'credit' && expense.paymentMode)
            .forEach(expense => {
                if (!paymentStats[expense.paymentMode]) {
                    paymentStats[expense.paymentMode] = {
                        count: 0,
                        totalAmount: 0
                    };
                }
                paymentStats[expense.paymentMode].count++;
                paymentStats[expense.paymentMode].totalAmount += expense.amount;
            });
        return paymentStats;
    }

    // Method to get bank account usage
    getBankAccountUsage() {
        const bankStats = {};
        this.expenses
            .filter(expense => expense.type === 'credit' && expense.bankAccount)
            .forEach(expense => {
                if (!bankStats[expense.bankAccount]) {
                    bankStats[expense.bankAccount] = {
                        count: 0,
                        totalAmount: 0
                    };
                }
                bankStats[expense.bankAccount].count++;
                bankStats[expense.bankAccount].totalAmount += expense.amount;
            });
        return bankStats;
    }

    // Method to search payments by payment number
    searchByPaymentNumber(paymentNumber) {
        return this.expenses.filter(expense => 
            expense.paymentNumber && 
            expense.paymentNumber.toLowerCase().includes(paymentNumber.toLowerCase())
        );
    }

    // Site Management Methods
    updateSiteDropdowns() {
        this.updateSiteSelectDropdown();
        this.updateSiteFilterDropdowns();
    }

    updateSiteSelectDropdown() {
        const siteSelect = document.getElementById('site-select');
        const currentValue = siteSelect.value;
        
        // Clear existing options except default ones
        siteSelect.innerHTML = `
            <option value="">Select Site/Project</option>
            <option value="add-new">+ Add New Site/Project</option>
        `;
        
        // Add existing sites
        Object.values(this.sites).forEach(site => {
            const option = document.createElement('option');
            option.value = site.name;
            option.textContent = site.name;
            siteSelect.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && Object.values(this.sites).some(site => site.name === currentValue)) {
            siteSelect.value = currentValue;
        }
    }

    updateSiteFilterDropdowns() {
        const siteFilter = document.getElementById('site-filter');
        const siteFilterSummary = document.getElementById('site-filter-summary');
        const currentValue = this.currentSiteFilter || '';
        
        console.log('=== Updating Site Filter Dropdowns ===');
        console.log('Current filter value:', currentValue);
        console.log('Available sites:', Object.keys(this.sites).length);
        
        // Update both filter dropdowns
        [siteFilter, siteFilterSummary].forEach(dropdown => {
            if (dropdown) {
                console.log(`Updating dropdown: ${dropdown.id}`);
                dropdown.innerHTML = `<option value="">All Sites</option>`;
                
                Object.values(this.sites).forEach(site => {
                    const option = document.createElement('option');
                    option.value = site.name;
                    option.textContent = site.name;
                    dropdown.appendChild(option);
                    console.log(`Added site option: ${site.name}`);
                });
                
                console.log(`Total options in ${dropdown.id}: ${dropdown.options.length}`);
                
                // Restore selection if it still exists
                if (currentValue && Object.values(this.sites).some(site => site.name === currentValue)) {
                    dropdown.value = currentValue;
                    console.log(`Restored selection: ${currentValue}`);
                } else {
                    dropdown.value = '';
                    console.log('Reset to "All Sites"');
                }
            } else {
                console.error('Dropdown element not found!');
            }
        });
        
        console.log('=== Site Filter Dropdowns Updated ===');
    }

    handleSiteSelection(value) {
        const siteInput = document.getElementById('site-name');
        const siteSelect = document.getElementById('site-select');
        const quickAddForm = document.getElementById('site-quick-add');
        
        if (value === 'add-new') {
            siteInput.style.display = 'none';
            siteInput.removeAttribute('required');
            siteSelect.removeAttribute('required');
            quickAddForm.style.display = 'block';
            document.getElementById('quick-site-name').focus();
        } else if (value === '') {
            siteInput.style.display = 'block';
            siteInput.setAttribute('required', 'required');
            siteSelect.removeAttribute('required');
            siteInput.value = '';
            quickAddForm.style.display = 'none';
        } else {
            siteInput.style.display = 'none';
            siteInput.removeAttribute('required');
            siteSelect.setAttribute('required', 'required');
            siteInput.value = value;
            quickAddForm.style.display = 'none';
        }
    }

    hideQuickSiteForm() {
        const siteSelect = document.getElementById('site-select');
        const siteInput = document.getElementById('site-name');
        
        document.getElementById('site-quick-add').style.display = 'none';
        siteSelect.value = '';
        siteInput.style.display = 'block';
        siteInput.setAttribute('required', 'required');
        siteSelect.removeAttribute('required');
        this.clearQuickSiteForm();
    }

    clearQuickSiteForm() {
        document.getElementById('quick-site-name').value = '';
        document.getElementById('quick-site-location').value = '';
        document.getElementById('quick-site-client').value = '';
        document.getElementById('quick-site-budget').value = '';
        document.getElementById('quick-site-start-date').value = '';
        document.getElementById('quick-site-end-date').value = '';
    }

    saveQuickSite() {
        const name = document.getElementById('quick-site-name').value.trim();
        const location = document.getElementById('quick-site-location').value.trim();
        const client = document.getElementById('quick-site-client').value.trim();
        const budget = parseFloat(document.getElementById('quick-site-budget').value) || 0;
        const startDate = document.getElementById('quick-site-start-date').value;
        const endDate = document.getElementById('quick-site-end-date').value;
        
        if (!name) {
            this.showNotification('Please enter site/project name', 'error');
            document.getElementById('quick-site-name').focus();
            return;
        }
        
        if (Object.values(this.sites).some(site => site.name === name)) {
            this.showNotification('Site/project already exists', 'error');
            return;
        }
        
        const siteId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
        
        this.sites[siteId] = {
            id: siteId,
            name: name,
            location: location,
            client: client,
            budget: budget,
            startDate: startDate,
            endDate: endDate,
            status: 'active',
            createdDate: new Date().toISOString()
        };
        
        localStorage.setItem(this.userSitesKey, JSON.stringify(this.sites));
        this.updateSiteDropdowns();
        this.renderSitesGrid();
        
        // Select the newly created site
        const siteSelect = document.getElementById('site-select');
        const siteInput = document.getElementById('site-name');
        
        siteSelect.value = name;
        siteInput.value = name;
        
        // Set proper required attributes since a site is now selected
        siteSelect.setAttribute('required', 'required');
        siteInput.removeAttribute('required');
        
        this.hideQuickSiteForm();
        this.showNotification('Site/project added and selected successfully!', 'success');
    }

    showSiteManagementModal() {
        this.renderSitesGrid();
        document.getElementById('site-management-modal').style.display = 'flex';
    }

    hideSiteManagementModal() {
        document.getElementById('site-management-modal').style.display = 'none';
    }

    showAddSiteForm() {
        // Close site management modal and show the quick add form in expense section
        this.hideSiteManagementModal();
        
        // Show site quick add form
        document.getElementById('site-select').value = 'add-new';
        this.handleSiteSelection('add-new');
        
        this.showNotification('Add new site/project in the expense form', 'success');
    }

    renderSitesGrid() {
        const sitesGrid = document.getElementById('sites-grid');
        const sites = Object.values(this.sites);
        
        if (sites.length === 0) {
            sitesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-building" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                    <p>No sites/projects added yet</p>
                    <p style="color: #666; font-size: 0.9rem;">Add sites to track expenses by project</p>
                </div>
            `;
            return;
        }
        
        sitesGrid.innerHTML = sites.map(site => {
            const siteExpenses = this.expenses.filter(expense => expense.site === site.name);
            const totalExpenses = siteExpenses
                .filter(expense => expense.type === 'debit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            const totalPayments = siteExpenses
                .filter(expense => expense.type === 'credit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            const outstanding = totalExpenses - totalPayments;
            const budgetUsed = site.budget > 0 ? (totalExpenses / site.budget) * 100 : 0;
            
            return `
                <div class="site-card" data-site-id="${site.id}">
                    <div class="site-card-header">
                        <h4 class="site-name">${site.name}</h4>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="site-status status-${site.status}">${site.status.toUpperCase()}</span>
                            <button type="button" class="icon-btn edit-site-btn" data-site-id="${site.id}" title="Edit Site">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="site-details">
                        ${site.location ? `<div><i class="fas fa-map-marker-alt"></i> ${site.location}</div>` : ''}
                        ${site.client ? `<div><i class="fas fa-user"></i> ${site.client}</div>` : ''}
                        ${site.budget > 0 ? `<div><i class="fas fa-rupee-sign"></i> Budget: ₹${this.formatCurrency(site.budget)}</div>` : ''}
                        ${site.startDate ? `<div><i class="fas fa-calendar-alt"></i> ${this.formatDate(site.startDate)} - ${site.endDate ? this.formatDate(site.endDate) : 'Ongoing'}</div>` : ''}
                    </div>
                    <div class="site-stats">
                        <div>
                            <span>${siteExpenses.length} transactions</span>
                            <span class="site-expense-amount">₹${this.formatCurrency(Math.abs(outstanding))}</span>
                        </div>
                    </div>
                    ${site.budget > 0 ? `
                        <div class="site-budget-progress">
                            <div class="site-progress-fill ${budgetUsed >= 100 ? 'danger' : budgetUsed >= 80 ? 'warning' : ''}" 
                                 style="width: ${Math.min(budgetUsed, 100)}%"></div>
                        </div>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                            Budget used: ${budgetUsed.toFixed(1)}%
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Add click event listeners to edit buttons
        document.querySelectorAll('.edit-site-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const siteId = btn.getAttribute('data-site-id');
                this.showEditSiteModal(siteId);
            });
        });
    }

    showEditSiteModal(siteId) {
        const site = this.sites[siteId];
        if (!site) {
            this.showNotification('Site not found', 'error');
            return;
        }
        
        // Store the current site being edited
        this.currentEditingSite = siteId;
        
        // Populate form fields
        document.getElementById('edit-site-name').value = site.name || '';
        document.getElementById('edit-site-location').value = site.location || '';
        document.getElementById('edit-site-client').value = site.client || '';
        document.getElementById('edit-site-budget').value = site.budget || '';
        document.getElementById('edit-site-start-date').value = site.startDate || '';
        document.getElementById('edit-site-end-date').value = site.endDate || '';
        document.getElementById('edit-site-status').value = site.status || 'active';
        
        // Show modal
        document.getElementById('edit-site-modal').style.display = 'flex';
    }

    hideEditSiteModal() {
        document.getElementById('edit-site-modal').style.display = 'none';
        this.currentEditingSite = null;
    }

    async updateSite() {
        if (!this.currentEditingSite) {
            this.showNotification('No site selected for editing', 'error');
            return;
        }
        
        const site = this.sites[this.currentEditingSite];
        if (!site) {
            this.showNotification('Site not found', 'error');
            return;
        }
        
        const oldName = site.name;
        const newName = document.getElementById('edit-site-name').value.trim();
        
        if (!newName) {
            this.showNotification('Please enter a site name', 'error');
            return;
        }
        
        // Check if name changed and if new name already exists
        if (newName !== oldName && Object.values(this.sites).some(s => s.name === newName && s.id !== this.currentEditingSite)) {
            this.showNotification('A site with this name already exists', 'error');
            return;
        }
        
        // Update site data
        site.name = newName;
        site.location = document.getElementById('edit-site-location').value.trim();
        site.client = document.getElementById('edit-site-client').value.trim();
        site.budget = parseFloat(document.getElementById('edit-site-budget').value) || 0;
        site.startDate = document.getElementById('edit-site-start-date').value;
        site.endDate = document.getElementById('edit-site-end-date').value;
        site.status = document.getElementById('edit-site-status').value;
        
        // If site name changed, update all expenses with the old name
        if (newName !== oldName) {
            this.expenses.forEach(expense => {
                if (expense.site === oldName) {
                    expense.site = newName;
                }
            });
        }
        
        // Save and update UI
        await this.saveAllData();
        this.updateSiteDropdowns();
        this.renderSitesGrid();
        this.updateSummary();
        this.renderExpenses();
        
        this.hideEditSiteModal();
        this.showNotification('Site updated successfully!', 'success');
    }

    async deleteSite() {
        if (!this.currentEditingSite) {
            this.showNotification('No site selected for deletion', 'error');
            return;
        }
        
        const site = this.sites[this.currentEditingSite];
        if (!site) {
            this.showNotification('Site not found', 'error');
            return;
        }
        
        // Check if site has transactions
        const siteExpenses = this.expenses.filter(expense => expense.site === site.name);
        
        if (siteExpenses.length > 0) {
            const confirmMsg = `This site has ${siteExpenses.length} transaction(s). Deleting the site will NOT delete the transactions, but they will no longer be associated with a site. Are you sure you want to delete this site?`;
            if (!confirm(confirmMsg)) {
                return;
            }
        } else {
            if (!confirm(`Are you sure you want to delete "${site.name}"?`)) {
                return;
            }
        }
        
        // Delete the site
        delete this.sites[this.currentEditingSite];
        
        // Save and update UI
        await this.saveAllData();
        this.updateSiteDropdowns();
        this.renderSitesGrid();
        this.updateSummary();
        this.renderExpenses();
        
        this.hideEditSiteModal();
        this.showNotification('Site deleted successfully!', 'success');
    }

    showSiteReportsModal() {
        this.renderSiteReports();
        document.getElementById('site-reports-modal').style.display = 'flex';
    }

    hideSiteReportsModal() {
        document.getElementById('site-reports-modal').style.display = 'none';
    }

    renderSiteReports() {
        const sites = Object.values(this.sites);
        
        // Calculate overall statistics
        let overallExpenses = 0;
        let overallPayments = 0;
        
        this.expenses.forEach(expense => {
            if (expense.type === 'debit') {
                overallExpenses += expense.amount;
            } else {
                overallPayments += expense.amount;
            }
        });
        
        const overallOutstanding = overallExpenses - overallPayments;
        
        // Update overall stats
        document.getElementById('total-sites-count').textContent = sites.length;
        document.getElementById('overall-expenses-amount').textContent = `₹${this.formatCurrency(overallExpenses)}`;
        document.getElementById('overall-payments-amount').textContent = `₹${this.formatCurrency(overallPayments)}`;
        document.getElementById('overall-outstanding-amount').textContent = `₹${this.formatCurrency(Math.abs(overallOutstanding))}`;
        
        // Populate site reports table
        const tbody = document.getElementById('site-reports-tbody');
        if (sites.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                        No sites/projects to show reports for
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = sites.map(site => {
            const siteExpenses = this.expenses.filter(expense => expense.site === site.name);
            const totalExpenses = siteExpenses
                .filter(expense => expense.type === 'debit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            const totalPayments = siteExpenses
                .filter(expense => expense.type === 'credit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            const outstanding = totalExpenses - totalPayments;
            const budgetUsed = site.budget > 0 ? (totalExpenses / site.budget) * 100 : 0;
            
            return `
                <tr>
                    <td><strong>${site.name}</strong></td>
                    <td>${site.location || '-'}</td>
                    <td>${site.client || '-'}</td>
                    <td class="amount">${site.budget > 0 ? '₹' + this.formatCurrency(site.budget) : '-'}</td>
                    <td class="amount debit">₹${this.formatCurrency(totalExpenses)}</td>
                    <td class="amount credit">₹${this.formatCurrency(totalPayments)}</td>
                    <td class="amount ${outstanding > 0 ? 'outstanding-positive' : outstanding < 0 ? 'outstanding-negative' : ''}">
                        ₹${this.formatCurrency(Math.abs(outstanding))}
                    </td>
                    <td class="budget-usage ${budgetUsed >= 100 ? 'danger' : budgetUsed >= 80 ? 'warning' : 'good'}">
                        ${site.budget > 0 ? budgetUsed.toFixed(1) + '%' : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Method to get site-wise expense statistics
    getSiteExpenseStats() {
        const siteStats = {};
        Object.values(this.sites).forEach(site => {
            const siteExpenses = this.expenses.filter(expense => expense.site === site.name);
            const totalExpenses = siteExpenses
                .filter(expense => expense.type === 'debit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            const totalPayments = siteExpenses
                .filter(expense => expense.type === 'credit')
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            siteStats[site.name] = {
                site: site,
                expenses: siteExpenses,
                totalExpenses: totalExpenses,
                totalPayments: totalPayments,
                outstanding: totalExpenses - totalPayments,
                budgetUsed: site.budget > 0 ? (totalExpenses / site.budget) * 100 : 0
            };
        });
        return siteStats;
    }

    // Method to get expenses by site
    getExpensesBySite(siteName) {
        return this.expenses.filter(expense => expense.site === siteName);
    }
}

// Initialize the authentication manager and expense tracker
const authManager = new AuthManager();

// Global error handler to prevent page reloads from unhandled errors
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    event.preventDefault();
    return false;
});

// Prevent unhandled promise rejections from causing issues
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
    return false;
});
