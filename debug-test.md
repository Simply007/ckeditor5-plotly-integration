# 🔍 CKEditor Plotly Integration Debug Guide

## Step-by-Step Testing Instructions

### 1. Start the Development Server
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### 2. Open Browser Console
Press `F12` or `Ctrl+Shift+I` to open Developer Tools and go to the Console tab.

### 3. Test Sequence

#### A. Test Toolbar Chart Button
1. Look for the chart icon (📊) in the CKEditor toolbar
2. Click on it - you should see a dropdown menu
3. Try clicking on "Scatter Plot" or any chart type
4. **Watch the console for these logs:**
   - `🔥 DROPDOWN ITEM CLICKED: scatter`
   - `🚀 _insertChart called with type: scatter`
   - `📊 Sample data generated: [...]`
   - `🏗️ Converting model to editing view:`

#### B. Test Debug Buttons
1. Click **"Insert Test Chart Directly"** button
2. **Watch console for:**
   - `🔥 DEBUG: Insert chart button clicked`
   - `🔧 Creating debug chart element...`
   - `🔧 Debug chart inserted`

3. Click **"Check DOM State"** button
4. **Watch console for:**
   - `🔍 DEBUG: Checking DOM state...`
   - `📊 Total charts found: X`
   - `⏳ Pending charts found: X`

### 4. What to Look For

#### ❌ **If Toolbar Button Doesn't Work:**
- No dropdown appears → UI plugin issue
- Dropdown appears but no console logs → Event binding issue
- Console shows errors → Check error messages

#### ❌ **If Debug Button Doesn't Work:**
- No console logs → JavaScript not loading
- Error messages → Check specific error

#### ❌ **If Charts Don't Render:**
- Console shows model creation but no DOM conversion → Converter issue
- Console shows DOM elements but no charts appear → Rendering issue
- Console shows "DOM root not ready" → Timing issue

### 5. Common Issues to Check

1. **Plugin Loading:**
   ```
   🎨 Setting up chart rendering...
   ```

2. **Model Creation:**
   ```
   ✍️ Creating plotlyChart element...
   📝 Chart element created:
   ```

3. **View Conversion:**
   ```
   🏗️ Converting model to editing view:
   📦 Created plotlyDiv element
   ```

4. **DOM Rendering:**
   ```
   🎯 _renderPendingCharts called
   📍 Got DOM root via getDomRoot():
   📊 Found X pending charts:
   ```

### 6. Report Back

Please share:
1. Which logs you see in the console
2. Whether the toolbar button appears and works
3. Whether the debug buttons work
4. Any error messages
5. Whether you can see any chart elements in the editor (even if empty)

This will help identify exactly where the issue is occurring!