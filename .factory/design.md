# Tax Evidence Pack — visual thesis

## Direction: dithered audit print

Tax evidence is ordinarily a pile of thin paper, faded ink and uncertain provenance.
The interface borrows from a well-kept print binder: warm paper, ink-black rules,
accounting-green verification marks and a coarse halftone image that makes a digital
folder feel like a physical record. This is deliberately quiet and documentary, not
the glossy dashboard language of bookkeeping subscriptions.

### Palette

| Token | Value | Use |
| --- | --- | --- |
| paper | `#f5f0e5` | page background |
| paper-deep | `#e8dfca` | surfaces and print texture |
| ink | `#1b211d` | primary text and rules |
| muted | `#5c625b` | supporting text |
| spruce | `#165c43` | primary actions and verified state |
| spruce-light | `#dcebdd` | positive backgrounds |
| ochre | `#9b5a00` | missing-evidence warning |
| brick | `#a12a25` | destructive state |
| night | `#151a17` | dark theme base |

All body text is ink on paper or paper on night (contrast exceeds 4.5:1). Dark
mode is an inverted archive room, not a second brand.

### Type and rhythm

`Georgia` gives document titles a trustworthy editorial voice; a self-hosted-free
system UI stack gives the dense working surface unambiguous forms and tabular
numbers. The scale is 12/14/16/20/25/32px, on a 4px rhythm. Corners are small
(6px), rules are crisp, and surfaces are used only to separate independent work.

### Interaction and motion

The primary gesture is *place into the binder*: dropping a document produces a
brief stamped confirmation, then the file appears in the register. Filters and
export states move only by opacity/transform for 180ms. With reduced motion,
everything changes instantly. The app never uses looping animation.

### Asset plan and provenance

The landing page uses one original, dithered editorial still: a top-down desk
with an open evidence binder, receipt strips, a stamped check mark and a paperclip.
It has no readable text, logos, real people or brands. It is generated with the
factory image model on 2026-08-28, retained as a PNG source and optimized to WebP
for delivery. Generated imagery is disclosed in the footer. UI icons are authored
inline SVG and do not depend on an icon library.

Prompt sheet:

> Use case: productivity-visual. Asset type: desktop app landing-page illustration.
> Primary request: a top-down archival evidence binder open on a warm ivory desk,
> with neutral receipt strips, one small invoice-like document, a paperclip and a
> green verification stamp. Style/medium: original risograph and halftone print
> illustration, coarse dot texture, limited forest green, ink black, ochre and
> ivory ink palette. Lighting/mood: calm northern-window daylight, practical,
> tactile and trustworthy. Composition: landscape, binder on the right with open
> negative space at left. Constraints: no readable text, no logos, no watermark,
> no brands, no people, no financial charts, no misleading claims.

