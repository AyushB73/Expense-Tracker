# 🔐 Login Troubleshooting Guide

## ✅ Server Status: RUNNING

Your server is now running successfully on:
- **Local:** http://localhost:3000
- **Mobile:** http://192.168.29.223:3000

---

## 🔑 Default Login Credentials

```
Username: admin
Password: construction123
```

**Important:** Type exactly as shown (case-sensitive!)

---

## 🐛 Common Login Issues & Solutions

### Issue 1: "Invalid credentials" Error

**Possible Causes:**
- Typing error in username or password
- Extra spaces before/after username or password
- Caps Lock is ON

**Solutions:**
✅ Copy and paste the credentials:
   - Username: `admin`
   - Password: `construction123`

✅ Make sure Caps Lock is OFF

✅ Check for extra spaces

---

### Issue 2: Login Button Not Responding

**Solutions:**
✅ Refresh the page (F5 or Ctrl+R)

✅ Clear browser cache:
   - Chrome: Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Click "Clear data"

✅ Try a different browser (Chrome, Firefox, Edge)

---

### Issue 3: Page Won't Load

**Check if server is running:**

1. Open Command Prompt
2. Run: `netstat -ano | findstr :3000`
3. If you see output, server is running ✅
4. If no output, restart server: `node server.js`

**Or check the terminal where you started the server:**
- You should see: "🚀 Construction Expense Tracker Server running..."
- If not, restart: `node server.js`

---

### Issue 4: API Connection Failed

**Symptoms:**
- Login button works but nothing happens
- Console shows "Failed to fetch" errors

**Solutions:**

✅ **Check if server is running**
   ```bash
   node server.js
   ```

✅ **Test API endpoint**
   - Open browser
   - Go to: http://localhost:3000/api/
   - You should see some response (not an error page)

✅ **Check browser console for errors**
   - Press F12
   - Click "Console" tab
   - Look for red error messages
   - Share them if you need help

---

### Issue 5: Mobile Login Not Working

**Solutions:**

✅ **Check Wi-Fi connection**
   - Phone and computer on SAME Wi-Fi
   - Turn OFF mobile data on phone

✅ **Use correct URL**
   - Mobile URL: `http://192.168.29.223:3000`
   - NOT: `http://localhost:3000` (won't work on mobile)

✅ **Check Windows Firewall**
   - May be blocking mobile connections
   - See firewall instructions below

---

## 🔥 Windows Firewall Configuration

If mobile can't connect:

1. Press Windows key
2. Type: "Windows Defender Firewall"
3. Click "Allow an app through firewall"
4. Click "Change settings" button
5. Click "Allow another app"
6. Click "Browse"
7. Navigate to: `C:\Program Files\nodejs\node.exe`
8. Click "Add"
9. Check BOTH "Private" and "Public" boxes
10. Click OK

---

## 🧪 Test Your Setup

### Test 1: Server Running
```bash
# Open browser and go to:
http://localhost:3000

# You should see the login page
```

### Test 2: API Working
```bash
# Open browser and go to:
http://localhost:3000/api/

# You should see some JSON response or message
```

### Test 3: Login Working
1. Go to: http://localhost:3000
2. Enter username: `admin`
3. Enter password: `construction123`
4. Click "Login"
5. You should see the main dashboard

---

## 🆕 Create New Account

If you want to create your own account:

1. Click "Create New Account" on login page
2. Fill in all fields:
   - Username (at least 3 characters)
   - Password (at least 6 characters)
   - Confirm Password (must match)
   - Email (for password recovery)
   - Company Name
3. Click "Create Account"
4. Login with your new credentials

---

## 📱 Mobile-Specific Issues

### Can't Access from Mobile

**Checklist:**
- [ ] Server is running on computer
- [ ] Phone is on SAME Wi-Fi as computer
- [ ] Mobile data is turned OFF
- [ ] Using correct IP: `http://192.168.29.223:3000`
- [ ] Windows Firewall allows Node.js
- [ ] No VPN running on phone or computer

**Test on computer first:**
- If login works on computer but not mobile
- It's likely a firewall/network issue
- Follow firewall instructions above

---

## 🔄 Quick Reset

If nothing works, try this complete reset:

### Step 1: Stop Everything
```bash
# Close all browser tabs
# Close all terminals
```

### Step 2: Restart Server
```bash
# Open NEW Command Prompt
cd "C:\Users\bhalw\OneDrive\Desktop\Expense Tracker"
node server.js
```

### Step 3: Test Login
```bash
# Open browser
# Go to: http://localhost:3000
# Login with: admin / construction123
```

---

## 📊 Check Server Logs

If login fails, check the server terminal for errors:

**Good output (working):**
```
🚀 Construction Expense Tracker Server running on http://localhost:3000
📱 Mobile access: Find your computer's IP address and use http://YOUR_IP:3000
```

**Bad output (error):**
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Port is in use, kill the process and restart

---

## 🆘 Still Not Working?

### Collect This Information:

1. **What happens when you try to login?**
   - Button doesn't respond?
   - Error message appears?
   - Page reloads but nothing happens?

2. **Check browser console (F12)**
   - Any red error messages?
   - Copy the error text

3. **Check server terminal**
   - Any error messages?
   - Copy the error text

4. **What URL are you using?**
   - localhost:3000 (computer)
   - 192.168.29.223:3000 (mobile)

5. **What device/browser?**
   - Computer: Chrome/Firefox/Edge?
   - Mobile: iOS Safari/Android Chrome?

---

## ✅ Current Status

**Server:** ✅ Running on port 3000

**Default Account:** ✅ Available
- Username: `admin`
- Password: `construction123`

**Local Access:** ✅ http://localhost:3000

**Mobile Access:** ✅ http://192.168.29.223:3000

---

**Try logging in now with the default credentials!** 🚀
