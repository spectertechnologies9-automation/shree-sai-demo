# Shree Sai Gold Palace — build and quality-control report

Run it: `npm install`, then `npm run dev` and open http://localhost:3210. Production: `npm run build`, then `npm start`.

## What was tested, and the result

All tests were scripted in headless Microsoft Edge (Playwright) against the running site, at 1440×900 desktop and an emulated Pixel 7 phone. The stress and load tests ran against the production build.

| Check | Result |
| --- | --- |
| Production build and type check | Passes. First-load JS 172 kB; the 3D scene is a separate lazy chunk. |
| Console errors, page errors, failed or 4xx requests | None, on desktop, phone and reduced-motion runs. |
| Every scene at five scroll positions, desktop and phone (39 + 34 screenshots reviewed) | All render; fixes made along the way are listed below. |
| Slow wheel scrolling (30 notches), then very fast to the bottom | Reaches the bottom; no scene skipped or stuck. |
| Three fast up/down passes, then fast back to top | Hero returns to its exact starting state (arch mask, title, gallery position). |
| Nav links, progress rail, "Back to the entrance", phone menu | Each lands with its section at 0 px from the top of the viewport. |
| Collections category buttons | Scroll the gallery to the chosen category (tested with Diamonds). |
| Hotspots | Open on click or tap, close on Escape, outside press, and when their shot ends. |
| Dead or empty links | None. Every link is an in-page anchor, `tel:`, `mailto:`, Google Maps or saigoldpalace.com. |
| Horizontal overflow | 0 px on desktop and phone. |
| Closing video | Loads only when the last scene approaches, plays while visible, pauses off-screen. If autoplay is refused the poster frame stays. |
| Reduced motion | No intro animation, no smooth-scroll hijack, no custom cursor, no WebGL; the detail scene shows as stacked photographs. |
| No WebGL / phones | Same stacked fallback as reduced motion (phones never load three.js). |
| Throttled phone (4× CPU slowdown, ~1.6 Mbps) | First contentful paint 1.7 s, largest contentful paint 3.0 s, layout shift 0.002. Other scenes' frames, the video and three.js are not requested on first view. |

### Not tested

- No physical device was used. "Mid-range Android" is an emulated Pixel 7 with CPU and network throttling, which approximates but does not replace a real handset.
- Safari and Firefox were not run; only Chromium (Edge).
- The `tel:`, `mailto:` and Google Maps links were checked for correct targets, not followed to confirm the Maps pin lands on the shop door.
- Lighthouse was not run; the timings above come from the browser's own performance entries.

## Business facts and where each came from

| Fact on the site | Source |
| --- | --- |
| This showroom is the Malleshwaram branch | The film's exterior shows it between Titan World (#339) and The Arvind Store (#341/3) on Sampige Road, with a Malleshwaram police barricade in frame; the official site lists the branch at #340. |
| #340, 11th Cross, Sampige Road, Malleshwaram, Bengaluru 560003 | saigoldpalace.com, contact page |
| +91 63649 22918 (showroom), 1800 203 4323 (toll-free), ssgpalace@gmail.com | saigoldpalace.com |
| 10:30 am – 8:30 pm, open Sundays | saigoldpalace.com contact page. The same site's footer shows different hours beside placeholder New York text, so the contact-page hours were used. |
| Since 1992; seven showrooms and their names | saigoldpalace.com, about and contact pages |
| Collections shown (chains, necklaces, rings, earrings, bangles, silver, diamonds, bridal) | Each is visibly on display in the film; "Diamonds" and "Bridal Section" are signed on the walls. |

All of it lives in one file, `lib/site.ts`.

### Needs your confirmation

1. **WhatsApp.** The official site gives no WhatsApp number, so the button is hidden rather than pointed at a guess. Put the number in `lib/site.ts` (`whatsapp`) and it appears in the Visit scene.
2. **Floor labels.** "Ground / First / Second floor" is inferred from the order the camera climbs the stairs (gold, then silver, then diamonds and bridal). Correct them if the building is numbered differently.
3. **Footage rights.** The film carries SR Creations' watermark. Every frame is cropped below it, and the footer credits SR Creations for architecture, interiors and film. Please confirm with them that the footage may be used on the site.
4. **People on camera.** Staff and customers are recognisable in several shots, and brand-ambassador posters appear in the background. Confirm you are comfortable publishing them.

## How the film was used

The supplied 4K walkthrough (2 min 50 s, about 60 shots) is the only source of imagery. Nothing was generated, and no stock images are used.

- Three scroll-scrubbed sequences cut from it: arriving (142 frames), the gold hall (122), climbing the building (112). Cuts between shots are cross-dissolved so scrubbing never pops. Each has a 1600 px desktop set and an 800 px phone set, loaded coarse-to-fine and only when the scene is within two viewports.
- 36 stills in two sizes for the gallery, lobby and detail scenes.
- One slowed, looping clip of the stairwell (0.9 MB) behind the closing scene.
- Higgsfield was checked first: the account has 0 credits and no free generations available, so nothing was generated and nothing was spent.

Asset weight: 41.6 MB in `public/` in total. A desktop visitor who scrolls the whole page downloads up to 27 MB of frames (17 MB was measured in the fast-scroll test, which skips some); a phone downloads about 3 MB for the opening scene and roughly 10 MB end to end. `scripts/build_assets.py` regenerates everything from the source video.

## Fixes made during testing

- Gold half of the hero title was invisible (gradient text does not paint through individually animated letters); gold is now applied per letter.
- Captions were visible before their shots; initial states are now set explicitly.
- The gold hall overlapped the last screen of the entrance and hid the chandelier shot; overlap removed.
- 3D detail scene showed only its gold rings because shader uniforms were not reaching the material; now driven through the material itself.
- Scroll positions could be measured before all scenes had registered; triggers are re-sorted and re-measured after mount and after fonts load.
- Floor indicator collided with the progress rail; hero arch was too narrow on phones; contact buttons were cramped. All adjusted.

## Known limitations

- Largest contentful paint on the throttled phone is 3.0 s, above the 2.5 s "good" threshold. The opening sequence is the cause; halving its phone frame count would bring it down at some cost in smoothness.
- No contact form: there is no verified backend to send it to, so the site offers call, email and directions instead.
- No official logo file was supplied; the archway-and-flame emblem was drawn for this site.
