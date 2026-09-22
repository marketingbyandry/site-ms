---
name: photo
description: Source a themed photo from Savee, optimize it, and integrate it into a page section
---
1. Search Savee (MCP) for images matching the requested theme/mood.
2. Download the best candidate(s).
3. Convert to WebP (or optimized JPEG if WebP unsupported); target <300KB.
4. Save under `assets/` with a descriptive filename.
5. Reference the image in the target HTML with explicit width/height and appropriate `background-position`/object-fit.
6. Update or add the test asserting the image is present, then run `npm test`.
