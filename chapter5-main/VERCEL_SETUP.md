# RE:VERSE Vercel Setup (Server-Side Code Verification)

This project now verifies puzzle answers on the server using a Vercel Function.
The answers are **no longer stored in browser JavaScript**.

## What changed

- Added server endpoint: `api/verify-code.js`
- Updated client logic: `Archive/script.js`
  - `record-code` forms now POST to `/api/verify-code`
  - browser stores only verified flags in `sessionStorage`
  - plaintext answers were removed from client code
- Added env template: `.env.example`
- Added env ignore rules: `.gitignore`

## How verification works

1. User enters a code and presses **Verify**.
2. Browser sends request to `POST /api/verify-code` with:
   - `recordKey` (`alliance`, `scout`, `healer`, `strategy`)
   - `answer` (user input)
3. Vercel Function reads expected values from environment variables.
4. Function compares normalized values (trim + lowercase).
5. Function returns `{ ok: true, isCorrect: true|false }`.
6. If correct, client marks that record verified for the current browser session.

## Configure environment variables in Vercel

In Vercel Project Settings → **Environment Variables**, add:

- `RV_CODE_ALLIANCE`
- `RV_CODE_SCOUT`
- `RV_CODE_HEALER`
- `RV_CODE_STRATEGY`

Use your real values (example values are in `.env.example`).

## Local development

1. Copy `.env.example` to `.env.local`
2. Set your values in `.env.local`
3. Run with Vercel dev server so functions work:

```bash
vercel dev
```

Then open the local URL printed by Vercel.

## Deploy on Vercel

1. Push repository to GitHub.
2. Import repo in Vercel.
3. Add the 4 environment variables listed above.
4. Deploy.
5. After deployment, test each record page verify button.

## Security notes

- This hides answers from static client files and page source.
- A user can still inspect network requests and frontend behavior, but cannot directly read answer keys from shipped JS.
- For stronger anti-abuse, add server-side rate limiting (optional future enhancement).
