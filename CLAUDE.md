# Celebrations by Chanelle — website

Wedding celebrant website for Chanelle (Gold Coast, QLD). Static HTML/CSS/JS with **no build step, no frameworks and no dependencies**. GitHub Pages publishes the `main` branch root to https://harryrconway.github.io/Celebrationsbychanelle/ (the capital C is part of the address).

Two people edit this repo: Harry (owner) and Jydon (collaborator). Keep that in mind for every change.

## Workflow (every session)

1. **`git pull` before touching anything.** The other person may have pushed since your last session.
2. Make focused changes. Preview locally with `python3 -m http.server 8000` and open http://localhost:8000.
3. Run the checks under "Before you push".
4. Commit with a clear message and `git push` to `main`. Pages redeploys in about 1–2 minutes. Confirm with `gh api repos/harryrconway/Celebrationsbychanelle/pages/builds/latest --jq .status` (expect `built`), then load the live URL.
5. Never force-push, rewrite history or delete branches. If a push is rejected, `git pull` (merge), resolve any conflict, then push again.

## File map

| Path | What it holds |
|---|---|
| `index.html` | The whole one-page site: SVG icon sprite, loader, header, fullscreen menu, seven sections, footer, resource drawers (`<dialog>`). The Content Security Policy is in `<head>`. |
| `style.css` | Design tokens (`:root`), components, one block per section, responsive rules at the end. Photo slots are listed at the top of the file. |
| `main.js` | All behaviour, in one IIFE. `CONFIG` at the top holds the email, social links and the optional form endpoint. |
| `fonts.css`, `fonts/` | Self-hosted fonts (woff2, split by `unicode-range`). |
| `images/` | Web-ready photos (`.jpg` plus `.webp`), `favicon.svg`, and `ui/` (small decorative SVGs). |
| `resources/` | Printable planning checklist (`planning-checklist.html` plus its own `.css`/`.js`). |

## Security rules (strict, so don't relax them)

Both HTML pages ship a strict CSP (`default-src 'none'`, self-only sources, Trusted Types enforced). Anything below is **silently blocked** on the live site, so the page looks broken with no obvious error:

- **No inline code or styles:** no `<style>` blocks, no `style="…"` attributes, no `onclick=`-style handler attributes, and no new inline `<script>`. Put styles in `style.css` and behaviour in `main.js`. Setting styles from JS with `el.style.setProperty()` or `el.style.x =` is fine.
- **The one inline script** in `index.html` `<head>` is allowed by its sha256 hash. If you ever change it, recompute the hash and update the CSP:
  `printf '%s' "<exact script text>" | openssl dgst -sha256 -binary | base64`
- **No external hosts:** no CDNs, Google Fonts, analytics, embeds or hotlinked images. Self-host files under this repo instead. If an outside service is genuinely required (Formspree is already allowed in `connect-src` and `form-action`), agree it with the owners first, then add only that exact origin to the CSP in **both** pages.
- **No `data:` URIs.** `img-src` is `'self'`, so save SVGs as files in `images/ui/`.
- **Never** use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` or `new Function` (Trusted Types blocks them). Build DOM with the `el(tag, attrs, text)` helper in `main.js`, or `createElement` plus `textContent`.
- **Contact form** (`#enquiry-form`):
  - Every text field has a character whitelist and a validator in `FIELD_RULES`. A new field must get a rule too.
  - Keep the honeypot (`_gotcha`), the 3-second timing check, the rate limit, the framed-page guard, `sanitize()`/`finalise()`, and the https-only endpoint check.
  - Output user input only via `textContent`, or `encodeURIComponent` for the `mailto:` link.
- External links with `target="_blank"` must have `rel="noopener"`. Only `https://` URLs.
- No secrets, keys or personal data in the repo. It is public.

## Design system

**Feel:** elegant, romantic, refined, timeless. Premium and editorial, never a generic service business or stock-photo look. Generous whitespace, text layered over photography, restrained motion.

- **Colours:** always use the tokens in `:root`, never new hex values: `--green` `#1F3D2E`, `--green-deep`, `--sage` `#8A9A86`, `--sand` `#D9C9B7`, `--brown` `#6B4F3B`, `--cream` `#F8F6F1`, `--linen` `#F1EBE2`, `--paper`, `--ink`, `--muted`, `--error`. Signature pairing: **sand text on dark green**. Light sections use cream or linen. Neighbouring light sections must differ in tone so they don't merge.
- **Type:** one typeface everywhere, by the owners' choice.
  - `--f-script` (Great Vibes): **only** the "Celebrations" wordmark (loader, header, hero, footer badge and mark, checklist header). Nothing else.
  - `--f-serif` (Cormorant Garamond): everything else, inherited from `body`: headings, body, small UPPERCASE letter-spaced labels (`.eyebrow`, weight 600) and buttons. Romantic accents that used to be script ("Chanelle", "Jed & I", "Your story. My honour.", signatures, "Love · Legacy · You") are Cormorant *italic*.
  - Numbers use lining figures (set on `body`) so "01" doesn't read as "o1".
  - Available files: Cormorant 300–600 upright and 300–400 italic, Great Vibes 400. A weight or style not already in `fonts.css` needs its own font file added.
- **Buttons:** every button is the same outlined pill as the header's "Book me": `.btn` (sand, for dark backgrounds) or `.btn btn--dark` (green, for light backgrounds). No icons inside buttons and no other button styles. Cards (`.tile`, `.downloads a`) and round icon buttons (menu, close, socials, calendar arrows) are not buttons in this sense.
- **Shapes follow the pill buttons:** clickable cards are pills too (`.tile`, `.downloads a`: `border-radius: 99px`, separate outlines with a gap rather than shared grid lines). Text cards where a full pill would clip the words (`.package-card`) use `border-radius: 2rem`. Avoid square-cornered boxes.
- **Reusable classes:** `.eyebrow` (`--dark` variant), `.display` (`--green`), `.script` (wordmark only), `.signature`, `.btn` (`--dark` variant), `.socials`, `.field`.
- **Icons:** inline SVG sprite at the top of `index.html`, used as `<svg class="icon"><use href="#i-name"/></svg>`. New icons follow the same style: 24×24 viewBox, outline strokes (inherited 1.3 stroke, round caps and joins), no fills except tiny dots. Social logos are the only filled icons.
- **Layout:** every top-level section is `.section` (minimum 100% of the viewport height and full width). On desktop (1440×900) each section should fit one screen. On mobile, content may grow taller but must not overflow sideways. Clear the fixed header with `var(--header-h)` padding.
- **Motion:** add `data-reveal` to elements that should fade up when scrolled into view (stagger is automatic). Photos fade in with their section. Respect `prefers-reduced-motion` (already handled globally). No bouncy or flashy effects.
- **Intro loader:** it holds for 1.7s after the page's load event (cap 3.6s on slow connections; skipped for reduced motion) so the full "Celebrations by Chanelle" lockup shows before it lifts. This is the owners' deliberate choice, even though it delays the first screen; don't shorten it for performance without asking. Timings are in `main.js` under "Intro loader".
- **Responsive:** breakpoints at 1200, 1024, 860 and 600px (the "RESPONSIVE" block at the end of `style.css`). Check every change at **390px** (phone), **820px** (tablet) and **1440px** (desktop).
- **Accessibility:**
  - Real labels on form fields and `aria-label` on icon-only buttons.
  - Visible `:focus-visible` states and keyboard support (the menu, drawers, calendar and dropdown already handle this, so keep it working).
  - Sufficient contrast, meaningful `aria-label` on photo slots (`role="img"`).
- **No emoji anywhere:** not in copy, code, comments or commit messages. The contact form also rejects emoji.

## Brand and content

- Spelling is **Chanelle** (not "Chanel"). Her partner is **Jed**. Based on the Gold Coast; travels to surrounding areas and beyond.
- Voice: warm, personal, first person ("I'll…"), relaxed but polished. **Australian English** (personalised, colour, organise).
- **No hyphens or dashes in visible text** (no -, – or —). Reword instead: use a comma, colon or full stop in place of a dash, "24 to 48 hours" for ranges, and rephrase or open up compounds ("practice run", not "run-through"). This covers page copy, `aria-label`s, meta descriptions and messages shown by `main.js`. Code (class names, attributes, URLs) is unaffected.
- The menu links have no numbers (01, 02…); keep it that way.
- Legal content in the "Getting Married" drawers is general guidance on Australian marriage law (NOIM at least 1 month and up to 18 months ahead, 2 witnesses aged 18+, registration with QLD BDM within 14 days, and so on). Keep it accurate, link to official sources (ag.gov.au, qld.gov.au), and don't present it as legal advice.
- **In the Media** (`#press`, between Love Story and Getting Married): features Chanelle and Jed's ABC News "Love Story" interview (11 October 2026), quoting the ABC headline and linking out to the article. A section has to be added in four places: the `<section>`, the menu list (plus an `nth-child` stagger rule in `style.css`), the side dots and the footer "Explore" links. For more press later, add items inside `.press__inner` rather than new sections. Don't copy text or photos from the ABC page: quote the headline only, link to the article, and use photos Chanelle supplies (the ABC's photos were "Supplied" by her, so ask her for the originals). No outlet logos without permission.
- **Placeholders still to confirm with Chanelle:** the email address, all social links (in `CONFIG` in `main.js`), ceremony packages and pricing (currently "coming soon"), and a phone number (none shown yet).

## Photos

Slot names are listed at the top of `style.css`. In use: `about-blue`, `chanelle-jed`, `menu`. Waiting for files: `about-brown`, `resources`, `process`, `contact`, `footer`.

The Home hero has no photo: the title block fills the whole first screen (100% of the viewport height and width), centred on dark green, with the values strip below it. It is dressed only with a soft glow (no frame, sprigs or scroll cue: the owners removed those).

To add a photo:
1. **Never commit camera originals.** `images/DSC*` is git-ignored on purpose (15+ MB each).
2. Make web copies from the original, stripped of EXIF/GPS metadata:
   - Portrait: max 1600×2400. Landscape banners: max 2400 wide.
   - `images/<slot>.jpg` at about quality 80, plus `images/<slot>.webp` at about quality 78.
   - **Portrait section photos also get a smaller copy for phones and standard-resolution screens:** `images/<slot>-1200.jpg` and `images/<slot>-1200.webp`, made the same way with `.thumbnail((1200, 1800))`. They are about 40% smaller and look identical at those sizes.
   - With Pillow: open, `ImageOps.exif_transpose`, `.convert('RGB')`, `.thumbnail(...)`, then save once as JPEG (`quality=80, optimize=True, progressive=True`) and once as WEBP (`quality=78, method=6`). Saving without passing `exif` drops the metadata.
3. In `style.css` under "Photo for each slot", move the slot's line out of the commented "waiting" list and add a matching `image-set(...)` line inside the `@supports` block, copying the existing `about-blue` lines. For the `-1200` copies, add the same pair of lines inside the `@media (max-width: 600px), (max-resolution: 1.5dppx)` block. Only the winning `--img` value downloads, so each visitor fetches one file per slot.
4. Some slots are `hidden` in `index.html` until they have a photo: the How I Work banner (`.process__banner`, which needs a **landscape** photo) and the small framed About photo (`.about__photo--small`). Remove `hidden` when you add their photo.
5. Set the focal point with `--img-pos` (for example `.img-chanelle-jed { --img-pos: center 28%; }`), then check the crop at 390px and 1440px. (The menu panel always shows the one `menu` photo; it doesn't change per link or on hover, by the owners' choice.)
6. Write a descriptive `aria-label` for the slot.

Photos lazy-load: a section's photo only downloads once the section is close to the screen (`.is-near`, which `main.js` only starts adding after the page's load event, so no photo can delay the first screen or the intro loader), and the menu photo only once the visitor reaches for the menu (`.is-primed`). Keep using these classes rather than adding `<img>` tags that load immediately.

## Performance

- Vanilla JS only: no jQuery, frameworks or libraries.
- In scroll and resize handlers, avoid reading layout and then writing it in a loop (`main.js` uses a `requestAnimationFrame`-throttled handler; follow that pattern).
- Animate only `transform` and `opacity`.
- Reuse cached `Intl.DateTimeFormat` instances and avoid rebuilding DOM unnecessarily.
- Keep images compressed (step 2 above) and don't reference files that don't exist (every missing file costs a failed request).

## Before you push

1. `node --check main.js` passes.
2. The page loads locally with **no console errors**. CSP violations show up in the console, so treat any as a bug.
3. Look at the changed area at 390px and 1440px.
4. If the form changed: test typing, pasting, validation messages and a submission.
5. No emoji, no hyphens or dashes in visible text, no inline styles or scripts, no external URLs added.
6. Then commit, push, and confirm the Pages build and the live page.
