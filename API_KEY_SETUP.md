# TonCenter API Key Setup Guide

## 🚨 Problem: 429 Too Many Requests

You're seeing this error because the application is using the public TonCenter API endpoint without authentication, which has very limited rate limits.

```
POST https://toncenter.com/api/v2/jsonRPC 429 (Too Many Requests)
```

## ✅ Solution: Get a FREE API Key

### Option 1: Get API Key from TonCenter (Recommended)

1. **Visit TonCenter**
   - Go to: https://toncenter.com/

2. **Register/Login**
   - Click on "API" or "Get API Key"
   - Create a free account
   - No credit card required!

3. **Get Your API Key**
   - After login, you'll see your API key
   - Copy it (looks like: `abc123def456...`)

4. **Add to .env file**
   ```bash
   # Open .env file and add:
   VITE_TON_CLIENT_API_KEY=your_api_key_here
   ```

5. **Restart Dev Server**
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

### Option 2: Use Alternative RPC Endpoint

If you can't get an API key immediately, you can use a different endpoint:

1. **Edit `src/utils/getTonClient.ts`**

   Find this line:
   ```typescript
   endpoint: 'https://toncenter.com/api/v2/jsonRPC',
   ```

   Replace with:
   ```typescript
   endpoint: 'https://tonapi.io/v2',
   ```

   Or:
   ```typescript
   endpoint: 'https://toncenter.com/api/v3',
   ```

### Option 3: Reduce API Calls (Temporary)

For testing, you can temporarily disable some protocols:

1. **Edit `src/App.vue`**

   Comment out some protocols (lines 31-33):
   ```typescript
   // Temporarily comment these out
   // tonStakersData.value = await getTonStakersPool();
   // stakeeData.value = await getStakeePool();

   // Keep only KTON and Hipo for testing
   ktonData.value = await getKTONPool();
   hipoData.value = await getHipoTreasury().then(res => {
     // ... existing code
   });
   ```

2. **Restart server**

---

## 📊 API Rate Limits

### Without API Key (Public)
- **Limit**: 1 request per second
- **Daily**: ~1,000 requests
- **Problem**: Your app makes 4-5 requests on load

### With FREE API Key
- **Limit**: 10 requests per second
- **Daily**: ~100,000 requests
- **Perfect for**: Development and small production apps

### With Paid API Key (Optional)
- **Limit**: 100+ requests per second
- **Daily**: Unlimited
- **Cost**: Starting at $10/month

---

## 🔧 Quick Fix Commands

### 1. Check current .env
```bash
cat .env | grep API_KEY
```

### 2. Add API key (after getting it)
```bash
echo "VITE_TON_CLIENT_API_KEY=your_api_key_here" >> .env
```

### 3. Verify it's set
```bash
cat .env
```

### 4. Restart server
```bash
# Kill current server (Ctrl+C or Command+C)
npm run dev
```

---

## 🎯 Testing Without API Key

If you want to test the UI without making real API calls:

### Create Mock Data (Optional)

1. **Create mock data file** (`src/utils/mockData.ts`):
```typescript
export const mockKtonData = {
  totalBalance: BigInt(100000000000000), // 100,000 TON
  poolJettonSupply: BigInt(98000000000000),
  governanceFee: 500,
  interestRate: 2500,
  halted: false,
  depositsOpen: true,
  currentRound: {
    borrowed: BigInt(50000000000000),
    expected: BigInt(51000000000000),
    profit: BigInt(1000000000000),
    activeBorrowers: 25
  },
  previousRound: {
    borrowed: BigInt(48000000000000),
    expected: BigInt(49000000000000),
    profit: BigInt(1000000000000),
    activeBorrowers: 24
  }
};
```

2. **Use mock data in development**:
```typescript
// In App.vue
if (import.meta.env.DEV && !import.meta.env.VITE_TON_CLIENT_API_KEY) {
  // Use mock data for testing
  ktonData.value = mockKtonData;
} else {
  // Real API call
  ktonData.value = await getKTONPool();
}
```

---

## 🔍 Verify API Key is Working

After adding the API key:

1. **Check Console**
   - Open DevTools (F12)
   - Look for successful API responses
   - Should NOT see 429 errors

2. **Check Network Tab**
   - Open DevTools > Network
   - Filter by "jsonRPC"
   - Look for status 200 (success)

3. **Expected Console Output**
   ```
   Hipo Treasury State: {totalCoins: 500000000000000n, ...}
   Hipo Times: {currentRoundSince: 1234567890n, ...}
   Hipo Surplus: 5000000000000n
   ```

---

## ⚠️ Important Notes

### Security
- ✅ **DO**: Add `.env` to `.gitignore` (already done)
- ❌ **DON'T**: Commit API keys to git
- ❌ **DON'T**: Share your API key publicly

### Rate Limits
- Free tier is perfect for development
- Upgrade only if you need more
- Consider caching data to reduce calls

### Alternative Solutions
- Use WebSocket connections (real-time)
- Implement server-side caching
- Use TON GraphQL APIs

---

## 🚀 Next Steps After Adding API Key

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test the Application**
   - Open http://localhost:5174/apy-cal/
   - Wait for data to load
   - Verify no 429 errors

3. **Check All Protocols Load**
   - All 4 columns should have data
   - No "-" symbols everywhere
   - Console shows success logs

4. **Continue Development**
   - All features should work
   - Can make changes and test
   - Ready for production deployment

---

## 📞 Getting Help

### TonCenter Support
- Website: https://toncenter.com/
- Telegram: @tonapibot
- Documentation: https://toncenter.com/api/v2/

### TON Developer Resources
- TON Documentation: https://ton.org/docs/
- TON Community: https://t.me/tondev
- GitHub: https://github.com/ton-blockchain

---

## ✅ Success Checklist

- [ ] Got TonCenter API key
- [ ] Added to `.env` file
- [ ] Verified `.env` contains key
- [ ] Restarted dev server
- [ ] No 429 errors in console
- [ ] All protocols load data
- [ ] All metrics display correctly

**Once you get the API key, the application will work perfectly!** 🎉
