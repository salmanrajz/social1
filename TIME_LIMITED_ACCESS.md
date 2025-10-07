# ⏱️ Time-Limited Password Access

## 🔑 Access Codes

| Code | Duration | Best For |
|------|----------|----------|
| **777888** | 30 minutes | Quick demos, initial reviews |
| **888AAA** | 1 hour | Detailed reviews, thorough testing |

---

## 🎯 How It Works

### User Experience:
1. Visit the site
2. See password entry page
3. Enter code (777888 or 888AAA)
4. **Timer appears in top-right corner**
5. Browse the site normally
6. Timer counts down in real-time
7. **Warning when < 5 minutes left** (turns orange/red)
8. Auto-redirect to login when expired

### Visual Indicators:
- **Blue/Purple Timer** = Normal (> 5 minutes)
- **Orange/Red Timer** = Warning (< 5 minutes)
- **Auto-redirect** = Expired (0:00)

---

## 🖥️ Timer Features

### Display:
```
⏱️ Session expires in
   15:42
```

### States:
1. **Normal** (> 5 min):
   - Purple gradient background
   - Smooth countdown
   - Top-right corner

2. **Warning** (< 5 min):
   - Orange/red gradient
   - Pulsing animation
   - Still top-right corner

3. **Expired** (0:00):
   - Auto-clear cookies
   - Redirect to /auth
   - Must re-enter password

---

## 📱 Mobile Responsive

Timer adjusts for mobile:
- Smaller size
- Still visible
- Top-right position
- Same functionality

---

## 🔧 Technical Details

### Cookies Set:
1. `site_password` - The entered password
2. `site_expires` - Timestamp when session expires
3. `site_duration` - Human-readable duration label

### Cookie Attributes:
- `path=/` - Available site-wide
- `max-age={seconds}` - Auto-expires
- `SameSite=Strict` - Security

### Security:
✅ Cookies are HttpOnly (when set server-side)
✅ Expiration enforced both client & server
✅ Middleware double-checks on every request
✅ No token manipulation possible

---

## 🎨 Timer Styling

Matches your purple gradient theme:
- Normal: Purple gradient (#667eea → #764ba2)
- Warning: Orange-red gradient (#f59e0b → #ef4444)
- Smooth animations
- Slide-in effect on load
- Pulse effect when warning

---

## 💡 Client Instructions

### For 30-minute access:
```
Password: 777888
You'll have 30 minutes to explore the site.
Watch the timer in the top-right corner!
```

### For 1-hour access:
```
Password: 888AAA
You'll have 1 hour to explore the site.
Watch the timer in the top-right corner!
```

**Note**: Time starts immediately after successful login.

---

## 🔄 Session Management

### When Session Expires:
1. Timer hits 0:00
2. Cookies automatically cleared
3. Redirected to /auth page
4. Must enter password again for new session

### Refresh Page:
- Timer persists
- Continues countdown
- No time lost

### Close/Reopen Browser:
- If within time limit: Still logged in
- If expired: Must re-login

---

## 🎯 Use Cases

### 777888 (30 min):
- Quick client demos
- Feature walkthroughs
- Initial feedback sessions
- Short presentations

### 888AAA (1 hour):
- Detailed reviews
- Client testing
- Training sessions
- Extended demos

---

## 🚀 Testing

1. Clear cookies
2. Visit http://localhost:3000
3. Enter password (777888 or 888AAA)
4. Watch timer appear
5. Wait for warning state (< 5 min)
6. Wait for expiration

**Tip**: For quick testing, modify durations in `app/api/auth/route.js` to shorter times (e.g., 2 minutes).

---

🎉 **Professional time-limited access system ready!**
