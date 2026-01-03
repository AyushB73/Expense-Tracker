# Construction Site Expense Tracker

A comprehensive multi-user expense tracking system designed specifically for construction companies to manage expenses across multiple sites and projects.

## 🌟 Features

### 🔐 Multi-User Authentication
- **User Registration**: Create accounts with company information
- **Secure Login**: Password-protected access with session management
- **Password Recovery**: Reset passwords using email verification
- **Complete Data Isolation**: Each user's data is completely private and secure

### 💰 Expense Management
- **Dual Transaction Types**: 
  - Material/Service Received (Debit) - Track expenses incurred
  - Payment Made to Vendor (Credit) - Track payments made
- **Outstanding Balance Tracking**: Automatic calculation of amounts owed
- **Multi-Site Support**: Track expenses across different construction sites
- **Category Management**: Organize expenses by materials, labor, equipment, etc.

### 🏢 Vendor Management
- **Automatic Vendor Creation**: Vendors are created automatically when adding transactions
- **Comprehensive Profiles**: Contact details, GST/PAN numbers, bank information
- **Activity Tracking**: See recently active vendors and transaction history
- **Outstanding Balances**: Track what you owe each vendor

### 🏗️ Site/Project Management
- **Multiple Sites**: Manage expenses for different construction projects
- **Budget Tracking**: Set and monitor budgets for each site
- **Progress Monitoring**: Track budget utilization and project expenses
- **Site Reports**: Comprehensive reports for each construction site

### 🏦 Banking Integration
- **Multiple Bank Accounts**: Manage payments from different bank accounts
- **Payment Modes**: Support for cash, cheque, NEFT, RTGS, UPI, etc.
- **Payment Tracking**: Auto-generated payment numbers and references

### 📊 Reporting & Analytics
- **Real-time Dashboards**: Live expense summaries and outstanding balances
- **Export Functionality**: Export data to CSV and PDF formats for external analysis
- **Professional PDF Reports**: Generate beautifully formatted PDF reports with company branding
- **Vendor Reports**: Detailed vendor-wise expense breakdowns
- **Site-wise Reports**: Project-specific expense analysis

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project files**

2. **Install dependencies and start the server**:
   ```bash
   node start-server.js
   ```
   
   Or manually:
   ```bash
   npm install
   npm start
   ```

3. **Access the application**:
   - Open your browser and go to: `http://localhost:3000`
   - The server will automatically create a default admin account

### Default Login Credentials
- **Username**: `admin`
- **Password**: `construction123`

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API**: Clean API endpoints for all operations
- **File-based Database**: JSON files for data persistence (easily upgradeable to SQL/NoSQL)
- **Session Management**: Secure user sessions with token-based authentication
- **Data Isolation**: Complete separation of user data

### Frontend (Vanilla JavaScript)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Immediate UI updates after data changes
- **Offline Fallback**: LocalStorage backup when server is unavailable
- **Premium UI**: Modern, professional interface with smooth animations

### Data Storage
- **Server-side**: JSON files in `/data` directory
- **Client-side Backup**: LocalStorage for offline functionality
- **Auto-sync**: Automatic synchronization between server and client

## 📁 Project Structure

```
construction-expense-tracker/
├── server.js              # Backend server
├── api-client.js          # Frontend API client
├── script.js              # Main application logic
├── index.html             # Frontend interface
├── styles.css             # Styling and animations
├── package.json           # Dependencies and scripts
├── start-server.js        # Setup and start script
├── data/                  # Data storage directory
│   ├── users.json         # User accounts
│   └── [username].json    # Individual user data files
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login
- `POST /api/reset-password` - Reset user password
- `POST /api/logout/:username` - User logout

### Data Management
- `GET /api/user-data/:username` - Get user's data
- `POST /api/user-data/:username` - Save user's data

## 💾 Data Privacy & Security

### Complete User Isolation
- Each user has a separate data file on the server
- No user can access another user's data
- Session tokens ensure secure access
- Passwords are hashed using SHA-256

### Data Backup
- Server-side JSON files provide persistent storage
- Client-side localStorage provides offline backup
- Automatic synchronization between server and client

## 🎯 Usage Guide

### Getting Started
1. **Register**: Create a new account with your company details
2. **Login**: Access your private workspace
3. **Add Sites**: Create construction sites/projects
4. **Add Vendors**: Vendors are created automatically when adding transactions
5. **Track Expenses**: Add material receipts and payments

### Best Practices
1. **Regular Updates**: Add transactions as they occur
2. **Vendor Details**: Complete vendor profiles for better tracking
3. **Site Organization**: Use clear site names and descriptions
4. **Budget Monitoring**: Set and monitor site budgets regularly

## 🔄 Data Migration

The system automatically migrates data from older versions and localStorage-only setups to the new server-based system while maintaining complete data integrity.

## 🛠️ Customization

### Adding New Features
- Extend the API in `server.js`
- Update the frontend in `script.js`
- Add new UI elements in `index.html`
- Style with `styles.css`

### Database Upgrade
The current JSON file system can be easily upgraded to:
- PostgreSQL
- MySQL
- MongoDB
- Any other database system

## 📞 Support

For issues, questions, or feature requests, please check the code comments and console logs for debugging information.

## 🔮 Future Enhancements

- **Mobile App**: Native mobile applications
- **Advanced Reporting**: More detailed analytics and charts
- **Document Management**: Attach receipts and invoices
- **Team Collaboration**: Multiple users per company
- **Integration**: Connect with accounting software
- **Cloud Deployment**: Deploy to cloud platforms

---

**Built for Construction Companies** - Manage your expenses efficiently across multiple sites with complete data privacy and professional reporting capabilities.