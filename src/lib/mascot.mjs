/**
 * The site's mark: a round cartoon portrait drawn from the real avatar —
 * thick black side-swept fringe, smiling eyes, white polo with a black collar.
 * Plain SVG markup so the same drawing feeds the <Mascot> component, the
 * favicon/app icons and the social card (scripts/gen-icons.mjs).
 */

export const MASCOT_COLORS = {
  ink: '#1a1613',
  disc: '#2f55d4',
  discInner: '#4569e0',
  dots: '#6d8cee',
  skin: '#f6d2b3',
  skinShade: '#e9b48e',
  shirt: '#fffbf4',
  blush: '#ef6a4f',
  mouth: '#b8331f',
  tongue: '#f08a72',
}

/**
 * @param {object} [opts]
 * @param {string} [opts.id]      unique suffix for clip-path ids
 * @param {boolean} [opts.square] fill the whole square (app icons)
 * @param {string} [opts.title]   accessible name; empty = decorative
 */
export function mascotSvg({ id = 'm', square = false, title = '' } = {}) {
  const c = MASCOT_COLORS
  const ink = (w = 13) => `stroke="${c.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
  const clip = `mascot-clip-${id}`
  const dots = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2
    const x = (400 + Math.cos(a) * 356).toFixed(1)
    const y = (400 + Math.sin(a) * 356).toFixed(1)
    return `<circle cx="${x}" cy="${y}" r="9" fill="${c.dots}"/>`
  }).join('')

  const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"'

  return `<svg class="mascot-svg" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" ${a11y}>
  <defs><clipPath id="${clip}"><circle cx="400" cy="400" r="${square ? 600 : 392}"/></clipPath></defs>
  ${square ? `<rect width="800" height="800" fill="${c.disc}"/>` : `<circle cx="400" cy="400" r="392" fill="${c.disc}"/>`}
  <circle cx="400" cy="400" r="326" fill="${c.discInner}"/>
  ${dots}
  <g clip-path="url(#${clip})">
    <g class="m-body">
      <path d="M 138 830 C 150 676 250 612 400 606 C 550 612 650 676 662 830 Z" fill="${c.shirt}" ${ink()}/>
      <path d="M 330 700 Q 322 760 300 812 M 470 700 Q 478 760 500 812" fill="none" stroke="${c.ink}" stroke-opacity=".16" stroke-width="10" stroke-linecap="round"/>
      <path d="M 352 520 L 352 612 Q 400 650 448 612 L 448 520 Z" fill="${c.skinShade}" ${ink()}/>
      <path d="M 400 650 L 318 596 L 288 646 L 352 706 Z" fill="${c.ink}" ${ink()}/>
      <path d="M 400 650 L 482 596 L 512 646 L 448 706 Z" fill="${c.ink}" ${ink()}/>
      <path d="M 400 652 L 400 790" stroke="${c.ink}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="400" cy="704" r="10" fill="${c.ink}"/>
      <circle cx="400" cy="752" r="10" fill="${c.ink}"/>
      <circle cx="540" cy="720" r="26" fill="none" stroke="${c.disc}" stroke-width="9"/>
      <path d="M 528 722 Q 540 706 552 722" fill="none" stroke="${c.blush}" stroke-width="8" stroke-linecap="round"/>
    </g>
    <g class="m-head">
      <circle cx="250" cy="418" r="34" fill="${c.skin}" ${ink()}/>
      <circle cx="550" cy="418" r="34" fill="${c.skin}" ${ink()}/>
      <path d="M 248 420 Q 256 412 262 420" fill="none" stroke="${c.ink}" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>
      <path d="M 552 420 Q 544 412 538 420" fill="none" stroke="${c.ink}" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>
      <path d="M 400 232 C 492 232 556 300 556 404 C 556 500 486 566 400 566 C 314 566 244 500 244 404 C 244 300 308 232 400 232 Z" fill="${c.skin}" ${ink()}/>
      <path class="m-hair" d="M 236 424
        C 204 292 248 164 382 144
        C 516 126 610 210 580 352
        C 576 384 570 404 562 424
        C 554 370 540 330 518 302
        C 496 328 466 340 436 342
        C 450 324 454 306 450 288
        C 418 322 370 336 320 336
        C 334 324 342 312 344 296
        C 298 322 260 362 236 424 Z" fill="${c.ink}" ${ink()}/>
      <path d="M 300 214 Q 360 170 438 172 M 474 186 Q 516 200 544 232" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="12" stroke-linecap="round"/>
      <path d="M 372 196 Q 344 246 338 296 M 446 194 Q 440 240 462 278 M 520 238 Q 530 270 528 300" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="9" stroke-linecap="round"/>
      <path d="M 312 398 Q 344 382 378 394" fill="none" ${ink(15)}/>
      <path d="M 422 394 Q 456 382 488 398" fill="none" ${ink(15)}/>
      <g class="m-eyes">
        <path d="M 318 446 Q 346 418 374 446" fill="none" ${ink(15)}/>
        <path d="M 426 446 Q 454 418 482 446" fill="none" ${ink(15)}/>
      </g>
      <ellipse cx="310" cy="478" rx="30" ry="17" fill="${c.blush}" fill-opacity=".38"/>
      <ellipse cx="490" cy="478" rx="30" ry="17" fill="${c.blush}" fill-opacity=".38"/>
      <path d="M 404 440 Q 392 466 408 470" fill="none" stroke="${c.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 344 496 Q 400 566 456 496 Z" fill="${c.mouth}" ${ink(11)}/>
      <path d="M 352 500 Q 400 512 448 500 L 444 514 Q 400 526 356 514 Z" fill="#ffffff"/>
      <path d="M 372 536 Q 400 520 428 536 Q 400 552 372 536 Z" fill="${c.tongue}"/>
    </g>
  </g>
  <circle cx="400" cy="400" r="392" fill="none" stroke="${c.ink}" stroke-width="${square ? 0 : 16}"/>
</svg>`
}
