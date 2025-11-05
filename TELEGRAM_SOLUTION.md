# Telegram Integration Solution

## Problem
Both `gramjs` and `MTKruto` are too complex for Supabase Edge Functions:
- **gramjs**: Requires Node.js crypto APIs not available in Deno
- **MTKruto**: Has 100+ dependencies causing build timeouts

## Recommended Solution: External Node.js Service

### Architecture
1. **Supabase** (Current): Database, scheduling, authentication
2. **External Node.js Service** (New): Telegram message sending
3. **Your App** (Current): UI for scheduling messages

### Option 1: Vercel Serverless Function (Recommended)

**Setup:**
1. Create a new Node.js project with gramjs
2. Deploy to Vercel as serverless function
3. Call from Supabase Edge Function via HTTP

**Pros:**
- Free tier available
- Simple deployment
- Works with gramjs

**Steps:**
```bash
# 1. Create new project
npm init -y
npm install telegram @supabase/supabase-js

# 2. Create api/send-telegram.js
# 3. Deploy to Vercel
vercel deploy
```

### Option 2: Railway / Render

Similar setup, deploy Node.js service that:
- Accepts webhook calls from Supabase
- Handles Telegram authentication
- Sends messages using gramjs

### Option 3: Use Telegram Bot API Instead

**If bot functionality is acceptable:**
- Much simpler
- No session management needed
- Works directly in Edge Functions
- **Limitation**: Messages sent as bot, not personal account

```typescript
// Simple Bot API example
const response = await fetch(
  `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: recipient,
      text: message
    })
  }
);
```

## Implementation Guide

### For Option 1 (Node.js Service):

**File: external-service/api/send-telegram.js**
```javascript
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // Verify request from Supabase
  // Get account session from Supabase DB
  // Initialize gramjs client
  // Send message
  // Return success/failure
};
```

**Update Supabase Edge Functions:**
```typescript
// Call external service instead of gramjs directly
const response = await fetch('https://your-service.vercel.app/api/send-telegram', {
  method: 'POST',
  body: JSON.stringify({ accountId, recipient, message })
});
```

## Next Steps

Choose your approach:
1. **External Service** - Full personal account automation
2. **Bot API** - Simpler but messages from bot account
3. **Different Platform** - Move entire app to Node.js environment

Would you like me to implement Option 3 (Bot API) for simpler setup, or help set up Option 1 (External Service)?
