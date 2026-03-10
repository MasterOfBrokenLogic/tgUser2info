# 4NSIL TG API

Telegram username → phone number lookup.
Your friend calls YOUR api — the real backend is 100% hidden.

```
friend's app → /?key=drazeX&q=@username → YOUR API → real backend → response
```

---

## File Structure

```
4nsil-tg/
├── api/
│   ├── index.js          ← GET /?key=X&q=@username  (main endpoint)
│   └── admin/
│       ├── index.js      ← GET /api/admin  (dashboard)
│       └── keys.js       ← admin CRUD
├── lib/
│   └── store.js
├── public/
│   └── admin.html
├── keys.json             ← add your keys here
├── vercel.json
└── package.json
```

---

## Deploy

```bash
npm install -g vercel
cd 4nsil-tg
vercel
```

---

## Environment Variables

Set these in **Vercel → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `UPSTREAM_KEY` | `rootxsuryansh` |
| `UPSTREAM_URL` | `https://tg-to-num-six.vercel.app/` |
| `ADMIN_SECRET` | anything you want e.g. `4nsil2025` |

Then redeploy:
```bash
vercel --prod
```

---

## Usage

### Your friend calls:
```
GET https://your-project.vercel.app/?key=drazeX&q=@toxicXsuryansh
```

### Admin dashboard:
```
https://your-project.vercel.app/api/admin
```
Login with your `ADMIN_SECRET`.

---

## Adding Keys

**Permanent** — edit `keys.json`, add entry, redeploy:
```json
"newkey": {
  "label": "Friend Name",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "totalRequests": 0,
  "lastUsed": null,
  "dailyUsage": {}
}
```

**Temporary (session only)** — use the admin dashboard → + NEW KEY.
