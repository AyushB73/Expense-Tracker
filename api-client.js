// API Client for Construction Expense Tracker
class ApiClient {
    constructor() {
        // Automatically detect environment and use appropriate base URL
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1' &&
                            !window.location.hostname.includes('192.168');
        
        if (isProduction) {
            // PRODUCTION: Replace this with your deployed backend URL
            // Examples:
            // - Render: 'https://your-app-name.onrender.com/api'
            // - Railway: 'https://your-app-name.up.railway.app/api'
            // - Heroku: 'https://your-app-name.herokuapp.com/api'
            
            // TODO: Replace with your actual backend URL
            this.baseURL = 'https://expense-tracker-mjoj.onrender.com/api';  // Fixed: Added /api
            
            console.log('✅ PRODUCTION MODE: Using backend URL:', this.baseURL);
        } else {
            // DEVELOPMENT: Use local server
            const hostname = window.location.hostname;
            const port = 3000;
            this.baseURL = `http://${hostname}:${port}/api`;
        }
        
        console.log('API Client initialized with base URL:', this.baseURL);
        console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
        
        this.sessionToken = localStorage.getItem('sessionToken');
        this.currentUser = localStorage.getItem('currentUser');
    }

    // Helper method to make API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if we have a session token
        if (this.sessionToken) {
            config.headers.Authorization = `Bearer ${this.sessionToken}`;
        }

        try {
            console.log('Making request to:', url);
            const response = await fetch(url, config);
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Server returned HTML or other non-JSON content
                const text = await response.text();
                console.error('Server returned non-JSON response:', text.substring(0, 200));
                
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    throw new Error('Backend server is not responding correctly. Please check if the server is running and the URL is correct.');
                }
                
                throw new Error('Server returned invalid response format');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            
            // Provide more helpful error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            }
            
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return response;
    }

    async login(credentials) {
        const response = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success) {
            this.sessionToken = response.user.sessionToken;
            this.currentUser = response.user.username;
            localStorage.setItem('sessionToken', this.sessionToken);
            localStorage.setItem('currentUser', this.currentUser);
            localStorage.setItem('userInfo', JSON.stringify(response.user));
        }

        return response;
    }

    async resetPassword(resetData) {
        const response = await this.request('/reset-password', {
            method: 'POST',
            body: JSON.stringify(resetData)
        });
        return response;
    }

    async logout() {
        if (this.currentUser) {
            try {
                await this.request(`/logout/${this.currentUser}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear local storage
        this.sessionToken = null;
        this.currentUser = null;
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userInfo');
        
        // Clear all user-specific data from localStorage
        this.clearAllUserData();
    }

    // Data methods
    async getUserData() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        const response = await this.request(`/user-data/${this.currentUser}`);
        return response;
    }

    async saveUserData(data) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        const response = await this.request(`/user-data/${this.currentUser}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response;
    }

    // Helper methods
    isAuthenticated() {
        return !!(this.sessionToken && this.currentUser);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // Clear all user-specific data from localStorage
    clearAllUserData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith('expenses_') ||
                key.startsWith('budget_') ||
                key.startsWith('budgetEnabled_') ||
                key.startsWith('vendors_') ||
                key.startsWith('bankAccounts_') ||
                key.startsWith('sites_')
            )) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Auto-save functionality
    async autoSave(data) {
        if (this.isAuthenticated()) {
            try {
                await this.saveUserData(data);
                console.log('Data auto-saved to server');
            } catch (error) {
                console.error('Auto-save failed:', error);
                // Fallback to localStorage if server is unavailable
                this.saveToLocalStorage(data);
            }
        }
    }

    // Fallback localStorage methods
    saveToLocalStorage(data) {
        if (!this.currentUser) return;
        
        const userDataKey = `userData_${this.currentUser}`;
        localStorage.setItem(userDataKey, JSON.stringify({
            ...data,
            lastSaved: new Date().toISOString()
        }));
    }

    loadFromLocalStorage() {
        if (!this.currentUser) return null;
        
        const userDataKey = `userData_${this.currentUser}`;
        const data = localStorage.getItem(userDataKey);
        return data ? JSON.parse(data) : null;
    }

    // Sync data between server and localStorage
    async syncData() {
        if (!this.isAuthenticated()) return null;

        try {
            // Try to get data from server first
            const serverData = await this.getUserData();
            
            // Save to localStorage as backup
            this.saveToLocalStorage(serverData);
            
            return serverData;
        } catch (error) {
            console.error('Failed to sync from server, using localStorage:', error);
            
            // Fallback to localStorage
            return this.loadFromLocalStorage();
        }
    }
}

// Create global API client instance
window.apiClient = new ApiClient();
