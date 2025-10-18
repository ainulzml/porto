```markdown
Tailwind + CountAPI quick integration for static site

How to run:
1. Put the provided files into a folder (root of site).
2. Start a static server:
   - python -m http.server 8000
   - or npx http-server -c-1 8000
3. Forward/preview port 8000 in Codespaces and open in browser.

Notes:
- Tailwind via CDN is for prototyping. For production, integrate Tailwind in build pipeline.
- CountAPI namespace default: 'zmlab_blog'. Change in countapi.js if you want a different namespace.
- CountAPI counts are public and increment on API hit. We locally debounce hits to once per 24h per browser.
```