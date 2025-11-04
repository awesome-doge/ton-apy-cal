# TON APY Calculator - Testing Guide

## 🚀 Quick Start

### 1. Environment Setup
✅ `.env` file created with all required contract addresses:
- KTON Pool
- TonStakers Pool
- Stakee Pool
- Hipo Treasury
- Bemo Financial (+ Nominator contracts)

### 2. Development Server
```bash
npm run dev
```
**Status**: ✅ Running on http://localhost:5174/apy-cal/

---

## 📊 Features to Test

### Phase 1: Core Metrics (5 features)

#### 1. Total Value Locked (TVL)
- **Location**: Row 7 (green highlighted)
- **Expected**: Shows TON amounts for KTON/TonStakers/Stakee/Hipo
- **Data Source**:
  - KTON: `totalBalance`
  - Hipo: `totalCoins`
  - Bemo: `tonTotalSupply`

#### 2. Token Exchange Rate
- **Location**: Row 10
- **Expected**: Shows ratio like "1.023456 TON"
- **Formula**: `totalBalance / poolJettonSupply`

#### 3. Pool Utilization Rate
- **Location**: Row 11
- **Expected**: Percentage like "45.23%"
- **Formula**: `(borrowed / totalBalance) * 100`

#### 4. Active Borrowers Count
- **Location**: Row 12
- **Expected**: Integer count for KTON/TonStakers/Stakee
- **Data Source**: `currentRound.activeBorrowers`

#### 5. Actual Round Profit
- **Location**: Rows 27 & 34 (cyan text)
- **Expected**: TON amounts
- **Data Source**: `currentRound.profit` (preferred) or calculated

---

### Phase 2: Operational Insights (9 features)

#### 6. Pool Status
- **Location**: Row 1
- **Expected**: 🟢 Active or 🔴 Halted badges
- **Test**: Should show green for healthy pools

#### 7. Deposits Status
- **Location**: Row 2
- **Expected**: ✓ Open or ✗ Closed badges
- **Test**: Verify color coding (green/yellow)

#### 8. Accrued Fees
- **Location**: Row 4
- **Expected**: TON amounts of collected fees
- **Data Source**: `accruedGovernanceFee`

#### 9. Instant Withdrawal Fee
- **Location**: Row 5
- **Expected**: Percentage like "0.50%"
- **Test**: Should be present for KTON/TonStakers/Stakee

#### 10-11. Min/Max Loan per Validator
- **Location**: Rows 13-14
- **Expected**: TON amounts
- **Test**: Max should be larger than Min

#### 12-13. Pending Deposits/Withdrawals
- **Location**: Rows 15-16
- **Expected**: TON amounts or "-"
- **Test**: Shows liquidity queue

---

### Phase 3: Advanced Analytics (15 features)

#### 14. Pool Jetton Supply
- **Location**: Row 8
- **Expected**: Large numbers for all protocols
- **Test**: Should match with TVL calculations

#### 15. Projected Balance
- **Location**: Row 9
- **Expected**: Future TON estimates (KTON only)
- **Test**: Compare with current TVL

#### 16-17. Total Staking/Unstaking (Hipo)
- **Location**: Rows 17-18
- **Expected**: TON amounts showing flow
- **Test**: Hipo column only

#### 18-20. Bemo Lockup Details
- **Location**: Rows 19-21
- **Expected**: Shows locked amounts across epochs
- **Test**: Bemo column only (if enabled)

#### 21. Disbalance Tolerance
- **Location**: Row 22
- **Expected**: Percentage (KTON pools)
- **Test**: Risk parameter

#### 22. Contract Surplus
- **Location**: Row 23
- **Expected**: TON amount (Hipo)
- **Test**: Should show positive surplus

#### 23-25. Hipo Timing Information
- **Location**: Rows 24-26
- **Expected**: Formatted dates like "Dec 15, 02:30 PM"
- **Test**:
  - Current Round Since: Past date
  - Participate Until: Near future
  - Next Round Since: Future date

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] All 41 metrics display without errors
- [ ] Status badges show correct colors
- [ ] Green highlight on TVL row
- [ ] Cyan text on Profit rows
- [ ] Blue bold text on APY row
- [ ] Table is responsive on mobile
- [ ] No layout breaking

### Data Validation Tests
- [ ] All TON amounts formatted to 5 decimals
- [ ] All percentages show % symbol
- [ ] Exchange rates show 6 decimals
- [ ] Dates formatted in readable format
- [ ] No "undefined" or "NaN" values
- [ ] "-" shown for unavailable data

### Protocol-Specific Tests
- [ ] **KTON**: All 41 metrics available
- [ ] **TonStakers**: Same as KTON
- [ ] **Stakee**: Same as KTON
- [ ] **Hipo**:
  - [ ] Timing data present
  - [ ] Staking/Unstaking flow
  - [ ] Surplus shown
  - [ ] No current round borrowed/expected
- [ ] **Bemo** (if enabled):
  - [ ] Lockup data present
  - [ ] Commission shown

### Performance Tests
- [ ] Page loads within 5 seconds
- [ ] No console errors
- [ ] API calls complete successfully
- [ ] Data updates on refresh

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## 🐛 Common Issues & Solutions

### Issue 1: API Rate Limiting
**Symptom**: Some data shows "-" or errors in console
**Solution**: Add `VITE_TON_CLIENT_API_KEY` to `.env` file
- Get free API key from https://toncenter.com/
- Add to `.env`: `VITE_TON_CLIENT_API_KEY=your_key_here`
- Restart dev server

### Issue 2: Hipo Timing Shows "-"
**Symptom**: Timing rows show "-" for Hipo
**Solution**: Check console for errors
- Verify `getTimes()` API call succeeds
- May need to retry if blockchain RPC is slow

### Issue 3: Bemo Data Missing
**Symptom**: Bemo column shows all "-"
**Solution**: Bemo is commented out in App.vue
- Uncomment lines 51-53 in `src/App.vue`
- Restart dev server

### Issue 4: Layout Issues
**Symptom**: Table overflows or breaks
**Solution**:
- Use horizontal scroll on mobile
- Table has `min-width: 600px`
- Wrapper has `overflow-x: auto`

---

## 📝 Expected Console Output

### Successful Load
```
Hipo Treasury State: {totalCoins: ..., totalTokens: ...}
Hipo Times: {currentRoundSince: ..., participateSince: ...}
Hipo Surplus: 123456789n
```

### API Calls
- 4-5 blockchain API calls on page load
- Each protocol fetches in parallel
- Total load time: 2-5 seconds

---

## 🎯 Test Scenarios

### Scenario 1: First-Time Load
1. Open http://localhost:5174/apy-cal/
2. Wait for "Loading data..." to disappear
3. Verify all 4 protocols load
4. Check console for any errors
5. Verify all 41 metrics populate

### Scenario 2: Data Accuracy
1. Pick one protocol (e.g., KTON)
2. Verify TVL matches on-chain data
3. Calculate Exchange Rate manually
4. Compare APY with official protocol website
5. Verify round data consistency

### Scenario 3: Mobile Responsiveness
1. Open DevTools (F12)
2. Switch to mobile view (375px width)
3. Verify table scrolls horizontally
4. Check status badges display correctly
5. Verify all text is readable

### Scenario 4: Error Handling
1. Disconnect internet
2. Refresh page
3. Should show error gracefully
4. Reconnect internet
5. Refresh should load data

---

## 📊 Expected Data Ranges

### KTON/TonStakers/Stakee Pools
- **TVL**: 50,000 - 500,000 TON
- **Exchange Rate**: 1.00 - 1.10 TON
- **Utilization**: 40% - 80%
- **Active Borrowers**: 5 - 50
- **Governance Fee**: 0 - 5000
- **APY**: 2% - 8%

### Hipo Treasury
- **TVL**: 100,000 - 1,000,000 TON
- **Exchange Rate**: 1.00 - 1.05 TON
- **Staking**: 10,000 - 100,000 TON
- **Unstaking**: 1,000 - 50,000 TON
- **Surplus**: 1,000 - 50,000 TON
- **APY**: 3% - 6%

---

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] `.env` not committed to git
- [ ] Build completes successfully
- [ ] Dist files generated

### Build Command
```bash
npm run build
```

### Verify Build
```bash
ls -lh dist/
# Should see:
# - index.html
# - assets/index-*.css
# - assets/index-*.js
```

### Deploy to GitHub Pages
```bash
# Build already creates files in dist/
# GitHub Actions will deploy automatically on push to main
git push origin main
```

---

## 📞 Support

### Documentation
- Project README: `/README.md`
- Commit History: `git log --oneline`
- Latest Commit: bd14439

### Issues
Report bugs or feature requests at your repository's Issues page.

---

## ✅ Success Criteria

Your calculator is working correctly if:
1. ✅ All 41 metrics display
2. ✅ No errors in console
3. ✅ Data loads within 5 seconds
4. ✅ APY calculations match protocol websites
5. ✅ Status badges show correct colors
6. ✅ Responsive on mobile devices
7. ✅ Hipo timing data displays
8. ✅ All protocols load successfully

---

**Happy Testing! 🎉**
