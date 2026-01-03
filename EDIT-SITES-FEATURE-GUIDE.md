# Edit Sites Feature - User Guide

## ✅ Feature Added: Edit Existing Sites/Projects

You can now edit and delete existing sites/projects in your expense tracker!

---

## 🎯 How to Edit a Site

### Step 1: Open Site Management
1. Scroll down to the **Site Management** section (grey box)
2. Click the **"Site Management"** button
3. The Site Management modal will open showing all your sites

### Step 2: Click Edit Button
1. Find the site you want to edit
2. Look for the **blue edit icon** (pencil) in the top-right corner of the site card
3. Click the edit button

### Step 3: Make Changes
The Edit Site modal will open with all current information pre-filled:
- **Site/Project Name** - Change the name
- **Location** - Update the location
- **Client Name** - Modify client information
- **Project Budget** - Adjust the budget
- **Start Date** - Change start date
- **Expected End Date** - Update end date
- **Status** - Change status (Active, On Hold, Completed)

### Step 4: Save Changes
1. Click **"Save Changes"** button
2. Your site will be updated immediately
3. All related transactions will be updated if you changed the site name

---

## 🗑️ How to Delete a Site

### From the Edit Modal:
1. Open the site for editing (follow steps above)
2. Click the **red "Delete Site"** button at the bottom
3. Confirm the deletion

### Important Notes:
- If the site has transactions, you'll be warned
- Deleting a site does NOT delete its transactions
- Transactions will remain but won't be associated with a site
- This action cannot be undone

---

## 📝 What You Can Edit

### Site Information:
✅ Site/Project Name  
✅ Location  
✅ Client Name  
✅ Project Budget  
✅ Start Date  
✅ Expected End Date  
✅ Status (Active/On Hold/Completed)

### Automatic Updates:
When you edit a site, the following are automatically updated:
- All dropdowns (Current View, Site Filter, Add Transaction)
- All transactions with the old site name (if name changed)
- Summary cards and statistics
- Site reports

---

## 🎨 Visual Guide

### Site Card with Edit Button:

```
┌─────────────────────────────────────────┐
│  Main Office              ACTIVE  [✏️]  │ ← Click this edit icon
│                                         │
│  📍 Downtown Office                     │
│  👤 ABC Corporation                     │
│  ₹ Budget: ₹1,000,000                   │
│  📅 2026-01-01 - Ongoing                │
│                                         │
│  5 transactions    ₹50,000              │
│  ▓▓▓▓░░░░░░ Budget used: 5.0%          │
└─────────────────────────────────────────┘
```

### Edit Site Modal:

```
┌─────────────────────────────────────────┐
│  ✏️ Edit Site/Project              [✕]  │
├─────────────────────────────────────────┤
│                                         │
│  Site/Project Name *                    │
│  [Main Office                      ]    │
│                                         │
│  Location                               │
│  [Downtown Office                  ]    │
│                                         │
│  Client Name                            │
│  [ABC Corporation                  ]    │
│                                         │
│  Project Budget (₹)                     │
│  [1000000                          ]    │
│                                         │
│  Start Date        Expected End Date    │
│  [2026-01-01]      [                ]   │
│                                         │
│  Status                                 │
│  [Active ▼]                             │
│                                         │
│  [💾 Save Changes] [✕ Cancel]           │
│                          [🗑️ Delete Site]│
└─────────────────────────────────────────┘
```

---

## ⚠️ Important Warnings

### Changing Site Name:
- All transactions with the old name will be updated to the new name
- This affects all historical data
- Make sure you really want to change the name

### Deleting a Site:
- **Cannot be undone!**
- Transactions are NOT deleted
- Transactions will lose their site association
- Budget tracking for that site will be lost
- Consider changing status to "Completed" instead

---

## 💡 Use Cases

### 1. Fix Typos
Quickly correct spelling mistakes in site names or locations.

### 2. Update Budget
Adjust project budget as scope changes.

### 3. Change Status
Mark projects as "On Hold" or "Completed" when status changes.

### 4. Update Client Info
Correct or update client information.

### 5. Extend Timeline
Update end dates when projects are extended.

---

## 🔄 What Happens When You Edit

### Name Change:
1. Site name is updated in the sites database
2. All transactions with old name are updated to new name
3. All dropdowns are refreshed
4. Summary cards recalculate
5. Transaction history updates

### Other Changes:
1. Site information is updated
2. Dropdowns remain the same
3. Statistics recalculate based on new budget
4. Site cards refresh with new information

---

## 🎯 Best Practices

### DO:
✅ Double-check before changing site names  
✅ Update status when projects complete  
✅ Keep budget information current  
✅ Use descriptive site names  
✅ Update end dates as needed

### DON'T:
❌ Delete sites with many transactions  
❌ Change names frequently  
❌ Leave important fields empty  
❌ Delete sites just to clean up (use status instead)

---

## 🔍 Troubleshooting

### Edit Button Not Visible?
- Make sure you're in the Site Management modal
- Check if the site card has loaded completely
- Refresh the page and try again

### Can't Save Changes?
- Site name is required
- Check if new name already exists
- Ensure budget is a valid number
- Check browser console for errors

### Changes Not Reflecting?
- Refresh the page
- Check if you clicked "Save Changes"
- Verify you're logged in
- Check server is running

---

## 📊 Status Options

### Active
- Project is currently ongoing
- Default status for new sites
- Shows in green

### On Hold
- Project is temporarily paused
- Use instead of deleting
- Shows in yellow/orange

### Completed
- Project is finished
- Keep for historical records
- Shows in blue/grey

---

## 🎉 Benefits

### Flexibility:
- Fix mistakes easily
- Update information as projects evolve
- Keep data current

### Data Integrity:
- Automatic transaction updates
- No broken references
- Consistent data across the app

### Organization:
- Mark completed projects
- Track project status
- Maintain accurate records

---

## 📝 Example Workflow

### Scenario: Project Name Typo

1. **Notice Issue:**
   - Site is named "Projct Alpha" (typo)

2. **Open Edit:**
   - Go to Site Management
   - Click edit icon on "Projct Alpha"

3. **Fix Name:**
   - Change to "Project Alpha"
   - Click "Save Changes"

4. **Result:**
   - Site name updated everywhere
   - All 15 transactions now show "Project Alpha"
   - Dropdowns updated
   - No data lost

### Scenario: Project Completed

1. **Project Finishes:**
   - Construction completed

2. **Update Status:**
   - Open edit for the site
   - Change status to "Completed"
   - Update end date to completion date
   - Save changes

3. **Result:**
   - Site marked as completed
   - Still visible in reports
   - Historical data preserved
   - Can still add final transactions

---

## 🚀 Quick Reference

| Action | Steps | Result |
|--------|-------|--------|
| Edit Site | Site Management → Edit Icon → Make Changes → Save | Site updated |
| Change Name | Edit → Change Name → Save | All transactions updated |
| Update Budget | Edit → Change Budget → Save | Budget tracking updated |
| Change Status | Edit → Select Status → Save | Status badge updated |
| Delete Site | Edit → Delete Site → Confirm | Site removed |

---

## ✅ Feature Complete!

The edit sites feature is fully functional and ready to use. You can now:
- ✅ Edit any site information
- ✅ Update site names (with automatic transaction updates)
- ✅ Change project status
- ✅ Delete sites when needed
- ✅ Keep your project data current and accurate

---

**Server:** http://localhost:3000  
**Status:** Ready to use! 🎯
