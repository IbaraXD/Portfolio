# Jan Ibarra Portfolio + Admin

A lightweight static portfolio with a real Supabase-powered admin dashboard and Google Drive link support.

## What you get

- `index.html` — public dark portfolio showcase
- `admin.html` — private project manager
- `config.js` — Supabase URL + public/anon key
- `supabase.sql` — database + Row Level Security setup
- `app.js` — public portfolio loader
- `admin.js` — login, CRUD, media manager
- `demo-data.js` — fallback content before Supabase is connected
- `assets/resume/` — current resume PDF

## 1. Create Supabase

Create a Supabase project, then open **SQL Editor** and run `supabase.sql`.

Add your email as the portfolio admin:

```sql
insert into public.portfolio_admin_users(email)
values ('YOUR_EMAIL@example.com')
on conflict do nothing;
```

## 2. Add the public frontend credentials

In Supabase, copy:

- Project URL
- anon / publishable key

Paste them into `config.js`.

Never put the `service_role` key in this website.

## 3. Create your admin account

Open `/admin.html`, enter the same email you allowlisted in SQL, choose **Create Account**, then sign in.

If Supabase email confirmation is enabled, confirm the email first.

## 4. Google Drive files

For each image/video in Drive:

1. Right-click the file → **Share**
2. Set **General access** to **Anyone with the link** → Viewer
3. Copy the link
4. Paste the link into the Admin project form

The site automatically extracts the Google Drive file ID.

### Images
Drive images are shown through Google's thumbnail endpoint.

### Videos
Drive videos open using the Google Drive preview player inside the project viewer. This works without exposing a direct MP4 URL.

For the fastest final site, you can later move videos/images to Supabase Storage or another CDN, but Drive links are supported out of the box.

## 5. Add a project

In `/admin.html`:

- Add title, client, year, category, description and tags
- Paste a cover image link
- Add as many images/videos as you want
- Use **Quick add Google Drive links** to paste multiple links at once
- Save

The public portfolio automatically reads the updated database.

## Deploy

This is a static site and can be deployed directly to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host. No npm install is required.

For Vercel, upload this folder or connect it as a project. `index.html` will be the homepage and `admin.html` will be your admin page.

## Performance notes

The animated background uses CSS transforms only. Project images are lazy-loaded. Drive videos are only loaded after the user opens a project, which keeps the homepage much lighter.
