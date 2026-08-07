KNEE4 — OLD COPY / NO QUIZ TEST VARIANT

Target URL: https://bohdan.pro/knee4/

Kept from kneeOld:
- old landing design, copy, section order and pricing presentation
- countdown timers
- remaining-spots counter
- purchase/join toast popups
- old reviews and sales structure

Removed:
- on-page knee assessment/quiz
- all CTA links to that quiz
- quiz calculation/render JS
- FAQ instructions to take the on-page quiz

Updated from kneeNew:
- GTM: GTM-5SKWHT5D
- pixel_key: pixel_knee2
- Meta Pixel ID: 1610503490748384
- _fbp/_fbc + first/last-touch attribution
- checkout_event_id / purchase_event_id
- Cloud Run warmup /health and diagnostics /track
- server-side InitiateCheckout via /checkout
- current product IDs: knee2_390 / knee2_890
- current thank-you pages and Purchase dataLayer event
- current Telegram bot link for 390
- current Jotform flow for 890
- current privacy disclosure

Small intentional content change:
- 890 UAH pricing card clarifies that consultation happens via Telegram text/voice messages, without a video call.

Deployment note:
- Place the knee4 folder at the domain root so ../shared paths resolve to https://bohdan.pro/shared/.
- This package intentionally does not overwrite the existing /shared folder.
- Clarity is not hardcoded here; if enabled once in the shared GTM container on All Pages, it will also cover /knee4/.
