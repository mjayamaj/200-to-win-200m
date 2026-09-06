# ₦200 to win ₦200M — Sports Betting Web Platform

A mobile-first, high-converting betting predictions and booking code distribution hub built for the sports betting community (Stake.com, SportyBet, Bet9ja, 1xBet, BetKing, MSport).

---

## ⚡ Quick Start (Run Instantly)

You can launch the web platform locally with zero extra dependencies using Python's built-in web server:

```powershell
python -m http.server 3000
```

Open your browser to:
```
http://localhost:3000
```
*(Tip: In Chrome or Edge DevTools, switch to Mobile View with iPhone 14 Pro or Pixel 7 to see the mobile sportsbook experience.)*

---

## 📱 Features Included

### Mobile Visitor Experience
- **One-Tap "Copy Code":** Bulletproof 3-tier clipboard engine with haptic feedback and instant visual toast.
- **Dynamic Kickoff Timers:** Real-time countdowns per slip; auto-flags matches in-play.
- **Categorized Feeds:**
  - `₦200M Mega Accumulator` (50x - 1,000x Odds)
  - `Daily Banker` (1.80 - 2.50 Odds)
  - `Over/Under Goals`
  - `Rollover Challenge`
  - `Won Archive` (Transparent winning records with ROI metrics)
- **Direct Bookmaker Deep-Links:** "Load in SportyBet" with affiliate query tags.
- **Telegram Onboarding Funnel:** High-converting sticky cards and banners linked to [Official Telegram Group](https://t.me/+GYo8-GqoBzlmNDA0).

### Admin Fast-Ops (Under 60s Posting)
- Tap the **Shield Icon** on the header to launch the Admin Control Modal.
- Input title, booking code, total odds, bookmaker, and kickoff hours.
- Live preview of potential returns for ₦200 stake (`₦200 * totalOdds`).
- Single-tap status switcher: mark any live slip as `Won 🏆` or `Lost ❌` with auto-updating community win rates.

---

## 🏗️ Production Architecture (Next.js + Supabase)

For deploying to production on **Vercel** + **Supabase**:

### 1. Database Setup (Supabase)
Run the SQL migration script located in:
```
/supabase/schema.sql
```
This provisions:
- `slips` table with auto-calculated `potential_win` generated column.
- `bookmakers` reference table with affiliate deep-link templates.
- `slip_matches` table for optional game-by-game tracking.
- `platform_stats` cache table for 0ms analytics queries.
- Row-Level Security (RLS) policies allowing public reads and authenticated admin writes.

### 2. Frontend Components (Next.js / React)
The `/src` folder contains strict TypeScript definitions and modular React components:
- `src/types/betting.ts`: TypeScript data models.
- `src/lib/clipboard.ts`: Resilient 3-tier clipboard utility.
- `src/components/SlipCard.tsx`: Complete Tailwind CSS slip card with live countdowns and copy feedback.
- `src/components/AdminSlipModal.tsx`: Ultra-fast slip creation modal with live math calculations.

---

## 💰 VIP Monetization Setup (Paystack & Telegram)

### 1. Paystack Integration Flow
1. Create a Payment Plan on [Paystack Dashboard](https://dashboard.paystack.com/) for VIP subscriptions (e.g. ₦3,000 / month).
2. Use the Paystack Inline JS SDK or standard checkout redirect.
3. Configure a Webhook pointing to `/api/paystack-webhook`.

### 2. Automated Telegram Invite Bot
When Paystack fires the `charge.success` webhook:
```javascript
// Example Server Action / Webhook handler
const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createChatInviteLink`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: TELEGRAM_VIP_CHANNEL_ID,
    member_limit: 1, // Single-use invite link
    expire_date: Math.floor(Date.now() / 1000) + (24 * 3600) // Expires in 24 hrs
  })
});
const data = await response.json();
const inviteLink = data.result.invite_link;
```
Redirect the subscriber to `inviteLink` or send via SMS/WhatsApp.
