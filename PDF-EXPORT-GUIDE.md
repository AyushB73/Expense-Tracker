# PDF Export Feature Guide

## Overview
The expense tracker now supports exporting your transaction reports as professional PDF documents in addition to CSV format.

## How to Use

### 1. Export All Transactions
- Navigate to the **Transaction History** section
- Click the **"Export PDF"** button (red button with PDF icon)
- A PDF file will be automatically downloaded to your computer

### 2. Export Filtered Data
You can export only specific transactions by applying filters before exporting:

**Filter by Site/Project:**
- Select a site from the "Site/Project" dropdown in the Transaction History section
- Click "Export PDF" to export only that site's transactions

**Filter by Category:**
- Select a category (Materials, Labor, Equipment, etc.) from the dropdown
- Click "Export PDF" to export only that category's transactions

**Combine Filters:**
- You can apply both site and category filters together
- The PDF will show only transactions matching both criteria

## PDF Contents

Each exported PDF includes:

### Header Section
- **Company Name** - Your personalized company name
- **Report Title** - "Expense Report"
- **Generation Date & Time** - When the PDF was created
- **Applied Filters** - Shows which filters were active (if any)

### Transaction Table
A detailed table with the following columns:
- Date
- Site/Project
- Type (EXPENSE or PAYMENT)
- Description
- Vendor
- Payment Mode
- Payment Number
- Expense/Receivable Amount (₹)
- Payment Made Amount (₹)

### Summary Section
- **Total Expenses/Receivables** - Sum of all debit transactions
- **Total Payments Made** - Sum of all credit transactions
- **Outstanding Balance** - Net balance (shown in red if positive, green if negative)

### Footer
- Page numbers (e.g., "Page 1 of 3")

## PDF Features

✅ **Professional Layout** - Landscape orientation for better readability
✅ **Company Branding** - Your company name appears at the top
✅ **Color-Coded** - Headers in purple, alternating row colors for easy reading
✅ **Automatic Formatting** - Indian Rupee symbol (₹) with proper number formatting
✅ **Multi-Page Support** - Automatically handles large datasets across multiple pages
✅ **Filter Information** - Shows which filters were applied to the report
✅ **Timestamp** - Records when the report was generated

## File Naming

PDF files are automatically named with the format:
```
[Company-Name]-Expense-Report-[YYYY-MM-DD].pdf
```

Example: `Arihant-Construction-Expense-Report-2026-01-03.pdf`

## Tips

1. **Apply filters before exporting** to create focused reports for specific sites or categories
2. **Export regularly** to maintain backup records of your transactions
3. **Use PDF for presentations** - The professional format is ideal for sharing with clients or stakeholders
4. **Use CSV for data analysis** - CSV format is better for importing into Excel or other tools

## Troubleshooting

**PDF not downloading?**
- Check your browser's download settings
- Ensure pop-ups are not blocked
- Try a different browser if issues persist

**PDF looks incorrect?**
- Refresh the page and try again
- Clear your browser cache
- Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)

**Need help?**
- Make sure you have at least one transaction before exporting
- Check that the server is running (http://localhost:3000)

## Browser Compatibility

The PDF export feature works on:
- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

---

**Note:** Both CSV and PDF export options are available. Choose the format that best suits your needs!
