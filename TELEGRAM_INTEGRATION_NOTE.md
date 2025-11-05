# Telegram Integration Issue

## Problem
The `telegram` (gramjs) library doesn't work in Supabase Edge Functions (Deno runtime) due to:
- Missing Node.js-specific crypto APIs
- Module bundling issues with esm.sh
- Runtime incompatibilities between Node.js and Deno

## Current Error
```
Cannot read properties of undefined (reading 'generateRandomLong')
```

## Solutions

### Option 1: Use Telegram Bot API (Recommended for Bots)
If you're building a bot, use the official Telegram Bot API:
```typescript
// Works perfectly in edge functions
await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    text: message,
  }),
});
```

### Option 2: Use grammY Framework (Recommended for Bots)
grammY works natively in Deno:
```typescript
import { Bot } from "https://deno.land/x/grammy/mod.ts";
const bot = new Bot(BOT_TOKEN);
```

### Option 3: User Account Automation (Current Goal)
For automating **user accounts** (not bots), you need:
- MTProto API client (what gramjs provides)
- Works with phone number authentication
- Can send messages as a user

**Current Status:** gramjs doesn't work in Supabase Edge Functions.

**Alternatives:**
1. **MTKruto** - Deno-native MTProto client (requires significant rewrite)
2. **External Service** - Run gramjs on a Node.js server and call it from edge functions
3. **Different Hosting** - Use a platform that supports Node.js for this feature

### Option 4: Hybrid Approach
1. Keep edge functions for bot operations (grammY)
2. Use external Node.js service for user account operations (gramjs)
3. Connect them via webhooks/API calls

## Recommendation
If you need **user account** automation with scheduled messages:
- Consider deploying the Telegram client code to a Node.js environment (Vercel, Railway, etc.)
- Use Supabase edge functions only for database operations and scheduling
- Call the Node.js service from your edge functions when messages need to be sent

If you only need **bot** functionality:
- Switch to grammY or direct Bot API
- This works perfectly in Supabase edge functions
