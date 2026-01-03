# Current View Dropdown - Troubleshooting Guide

## Issue Description
The "Current View" dropdown in the summary cards section may not be filtering the expense data correctly.

## What I've Done

### 1. Added Enhanced Debugging
I've added comprehensive console logging to help identify the issue:

**In the dropdown change event handler:**
- Logs the selected value
- Logs the selected text
- Logs the current filter state
- Counts matching expenses
- Shows sample expense sites

**In the updateSummary method:**
- Logs when the method is called
- Logs the current filter value
- Logs total expenses count
- Logs filtered expenses count
- Logs calculated totals

### 2. Created Test Page
Created `test-current-view-debug.html` - a standalone test page to verify the filtering logic works correctly.

## How to Debug

### Step 1: Open the Application
1. Go to http://localhost:3000
2. Login with your credentials
3. Open browser console (Press F12)

### Step 2: Check Console Logs
When you change the "Current View" dropdown, you should see:
```
=== Site Filter Summary Changed ===
New value: [selected site name]
Selected text: [selected site name]
Set currentSiteFilter to: [selected site name]
Total expenses before filter: [number]
Matching expenses for site: [number]
Sample expense sites: [array of site names]
=== updateSummary called ===
currentSiteFilter: [selected site name]
Total expenses: [number]
Filtered expenses count: [number]
Summary calculated: {object with totals}
```

### Step 3: Use Test Page
1. Open `test-current-view-debug.html` in your browser
2. Click "Load Test Expenses"
3. Select different sites from the dropdown
4. Watch the console output and summary cards update

### Step 4: Verify Data
Check if your expenses have the correct site names:
1. In the console, type: `tracker.expenses`
2. Look at the `site` property of each expense
3. Verify it matches the site names in the dropdown

## Common Issues and Solutions

### Issue 1: Dropdown is Empty
**Symptom:** The "Current View" dropdown only shows "All Sites"

**Solution:**
- Check if you have any sites/projects created
- Go to Site Management section and add sites
- The dropdown populates from `tracker.sites` object

### Issue 2: Site Names Don't Match
**Symptom:** Selecting a site shows 0 expenses even though you have data

**Possible Causes:**
1. **Case sensitivity:** "Main Office" vs "main office"
2. **Extra spaces:** "Main Office " vs "Main Office"
3. **Different names:** Expense has "Office" but dropdown shows "Main Office"

**Solution:**
- Check console logs for "Sample expense sites"
- Compare with dropdown options
- Expenses must have exact site name match

### Issue 3: Summary Cards Don't Update
**Symptom:** Dropdown changes but cards show same numbers

**Check:**
1. Open console and look for errors
2. Verify `updateSummary()` is being called
3. Check if `currentSiteFilter` is being set correctly

**Solution:**
- Refresh the page
- Clear browser cache
- Check console for JavaScript errors

### Issue 4: Filter Resets After Adding Transaction
**Symptom:** After adding a new transaction, filter resets to "All Sites"

**This is expected behavior** - the filter resets when:
- New transaction is added
- Page is refreshed
- User logs out and back in

**To maintain filter:**
- Reselect your site after adding transactions

## Technical Details

### How It Works

1. **Dropdown Change Event:**
   ```javascript
   document.getElementById('site-filter-summary').addEventListener('change', (e) => {
       this.currentSiteFilter = e.target.value;
       this.updateSummary();
       this.renderExpenses();
   });
   ```

2. **Filtering Logic:**
   ```javascript
   let filteredExpenses = this.expenses;
   if (this.currentSiteFilter) {
       filteredExpenses = this.expenses.filter(expense => 
           expense.site === this.currentSiteFilter
       );
   }
   ```

3. **Summary Calculation:**
   - Filters expenses by selected site
   - Calculates total debits (expenses)
   - Calculates total credits (payments)
   - Updates summary cards with filtered totals

### Data Flow

```
User selects site
    ↓
Dropdown change event fires
    ↓
currentSiteFilter is set
    ↓
updateSummary() is called
    ↓
Expenses are filtered by site
    ↓
Totals are calculated
    ↓
Summary cards are updated
    ↓
renderExpenses() updates table
```

## Verification Checklist

- [ ] Console shows no JavaScript errors
- [ ] Dropdown is populated with site names
- [ ] Selecting a site logs the change in console
- [ ] Summary cards update when site is selected
- [ ] Transaction table filters to show only selected site
- [ ] Selecting "All Sites" shows all transactions
- [ ] Numbers match expected values

## If Still Not Working

### 1. Check Browser Console
Look for any red error messages. Common errors:
- "Cannot read property 'value' of null" - Element not found
- "filter is not a function" - Data structure issue
- "Uncaught TypeError" - JavaScript error

### 2. Verify Data Structure
In console, run:
```javascript
// Check if tracker exists
console.log('Tracker:', window.tracker);

// Check expenses
console.log('Expenses:', window.tracker.expenses);

// Check sites
console.log('Sites:', window.tracker.sites);

// Check current filter
console.log('Current filter:', window.tracker.currentSiteFilter);
```

### 3. Test Manually
In console, run:
```javascript
// Set filter manually
window.tracker.currentSiteFilter = 'Main Office';

// Update summary
window.tracker.updateSummary();

// Check if cards updated
console.log('Total debits:', document.getElementById('total-debits').textContent);
```

### 4. Check for Conflicts
- Disable browser extensions
- Try in incognito/private mode
- Try a different browser
- Clear browser cache and cookies

## Need More Help?

If the issue persists:

1. **Collect Information:**
   - Browser and version
   - Console error messages
   - Steps to reproduce
   - Screenshot of console logs

2. **Check Files:**
   - Verify `script.js` has the updated code
   - Check if server is running
   - Ensure no file corruption

3. **Test Isolation:**
   - Use the test page (`test-current-view-debug.html`)
   - If test page works, issue is with main app
   - If test page fails, issue is with browser/environment

## Recent Changes

**Enhanced Debugging (Just Added):**
- Added detailed console logging to dropdown change event
- Added debugging to updateSummary method
- Created standalone test page
- Added expense count verification

**These changes help identify:**
- If dropdown is firing change events
- If filter value is being set correctly
- If expenses are being filtered
- If summary is being calculated correctly

---

**Status:** Debugging tools added ✅  
**Next Step:** Open the application and check console logs when changing the dropdown
