# BILAN Monthly Client Content Portal

This is the monthly client content review site for BILAN. October 2026 is the historical archive and November 2026 is the first creative review month.

## Publishing / review status
- October 1–28: reported posted by campaign manager; not individually confirmed from social media.
- October 29–31: no posting confirmation.
- November: planned / needs review. Local browser approval does NOT publish a post or sync notes with other visitors. Clients must EXPORT a CSV to share feedback.

## Structure
- `index.html`: portal layout and script bootstrap.
- `styles.css`, `app.js`: the reusable UI.
- `oct_2026_00.js` ... `oct_2026_07.js`: October content extracted directly from original October workbook with embedded JPG previews and Drive links.
- `data_00.js` ... `data_14.js`: existing November campaign data and original/revised image pairs in GitHub. Keep these in place.

## Next month
1. Prepare a dated client calendar and verified product reference.
2. Prepare one or more `month_YYYY_MM_XX.js` files adding entries into `window.BILAN_POSTS` (see schema in existing `data_00.js`).
3. Register the new month in `months` inside `app.js`.
4. Load the new data scripts in `index.html`, verify post counts and full slide/reel display, then deploy via GitHub/Vercel.
5. Move only confirmed published posts to a recorded posting status. Never infer confirmation merely from a scheduled date.

The site is statically hosted; it does not yet have a multi-user database or approval backend.