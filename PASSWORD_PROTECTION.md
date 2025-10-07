# 🔒 Password Protection with Time Limits

## Access Codes

| Password | Duration | Use Case |
|----------|----------|----------|
| `777888` | 30 minutes | Quick demos, short reviews |
| `888AAA` | 1 hour | Extended demos, detailed reviews |

## How It Works

### For Users:
1. Visit the site (e.g., `http://localhost:3000` or your deployed URL)
2. You'll be redirected to a password entry page
3. Enter one of the passwords:
   - `777888` for 30-minute access
   - `888AAA` for 1-hour access
4. Click "Access Site"
5. You'll see a countdown timer in the top-right corner
6. Session expires automatically when time runs out

### For Developers:

#### Files Added:
- **`middleware.js`** - Intercepts all requests and checks for password + expiration
- **`app/auth/page.js`** - Password entry page with styled form and hints
- **`app/api/auth/route.js`** - API endpoint to verify password and return duration
- **`app/components/SessionTimer.js`** - Countdown timer component
- **`app/layout.js`** - Updated to include SessionTimer

#### How Password Protection Works:
1. **Middleware** checks every request for `site_password` and `site_expires` cookies
2. If cookies don't exist or session expired → redirect to `/auth`
3. If cookies valid and not expired → allow access
4. **SessionTimer** displays countdown in top-right corner
5. Timer turns orange/red when < 5 minutes remaining
6. Auto-redirects to login when time expires

#### To Add/Change Passwords:
Edit in 2 places:

1. `app/api/auth/route.js`:
```javascript
const PASSWORDS = {
  '777888': { duration: 30, label: '30 minutes' },  // 30 minutes
  '888AAA': { duration: 60, label: '1 hour' },      // 60 minutes
  'NEWCODE': { duration: 120, label: '2 hours' }    // Add new codes here
};
```

2. `middleware.js`:
```javascript
const PASSWORDS = {
  '777888': true,
  '888AAA': true,
  'NEWCODE': true  // Add new codes here
};
```

#### To Disable Password Protection:
Simply delete or rename `middleware.js`

## Additional Feature: TikTok Shop Links

### What Was Added:
- 🛒 "View in TikTok Shop" button on all product cards
- Links to: `https://shop.tiktok.com/view/product/{product_id}`
- Opens in new tab
- Styled with purple gradient to match theme

### Location:
- Video cards with products now show shop link
- Example: [Nekteck Foot Massager](https://shop.tiktok.com/view/product/1729398961287238061)

## Sharing with Clients

### Option 1: Quick Demo (30 minutes)
```
Hi! Here's the TikTok Viral Trends demo:

🌐 URL: http://localhost:3000
🔑 Password: 777888
⏱️ Duration: 30 minutes

A countdown timer will show in the top-right corner.
```

### Option 2: Extended Review (1 hour)
```
Hi! Here's the TikTok Viral Trends site:

🌐 URL: http://localhost:3000
🔑 Password: 888AAA
⏱️ Duration: 1 hour

A countdown timer will show in the top-right corner.
```

**Features:**
- ⏱️ Real-time countdown timer (top-right)
- 🟠 Timer turns orange when < 5 minutes left
- 🔄 Auto-redirect to login when expired
- 🔐 No session sharing (cookie-based)

**Security Note**: This is basic time-limited password protection suitable for sharing with clients. For production, consider implementing proper authentication with user accounts.

## Features Protected:
✅ Main video explorer page
✅ Product search page
✅ All API endpoints (already server-side)
✅ All routes except `/auth`

## What's NOT Protected:
- Static assets (images, CSS, JS files)
- Next.js internal routes
- The auth page itself (obviously!)

🎉 Your site is now password-protected and includes TikTok Shop links!
