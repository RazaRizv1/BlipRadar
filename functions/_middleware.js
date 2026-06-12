/**
 * Markdown content negotiation for AI agents.
 * When a client asks for markdown (Accept: text/markdown, ?format=md, or a .md path),
 * serve a markdown representation instead of HTML:
 *   - homepage            -> /llms.txt (the site overview)
 *   - any other page X.html -> X.md if it exists, else fall back to /llms.txt
 * Every other request passes through unchanged. Any error -> serve normally.
 */
export async function onRequest(context) {
  const { request, next } = context;
  try {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';
    const wantsMd =
      accept.toLowerCase().includes('text/markdown') ||
      url.searchParams.get('format') === 'md' ||
      url.pathname.endsWith('.md');

    const lastSeg = url.pathname.split('/').pop() || '';
    const isPage =
      url.pathname === '/' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.md') ||
      !lastSeg.includes('.'); // extensionless path = a page, not an asset

    if ((request.method === 'GET' || request.method === 'HEAD') && wantsMd && isPage) {
      const base = url.pathname.replace(/\.md$/, '');
      let mdPath;
      if (base === '/' || base === '/index.html' || base === '/index') {
        mdPath = '/llms.txt';
      } else {
        mdPath = base.replace(/\.html$/, '') + '.md';
      }

      // Try the page-specific markdown asset.
      let res = await next(new Request(new URL(mdPath, url.origin), { method: 'GET' }));
      let source = 'page';

      // Fall back to the site overview so any markdown request still gets useful markdown.
      if (!res || res.status !== 200) {
        res = await next(new Request(new URL('/llms.txt', url.origin), { method: 'GET' }));
        source = 'site-overview';
      }

      if (res && res.status === 200) {
        const body = await res.text();
        return new Response(request.method === 'HEAD' ? null : body, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept',
            'Cache-Control': 'public, max-age=300',
            'X-Markdown-Source': source
          }
        });
      }
    }
  } catch (e) {
    // fall through to normal serving on any error
  }
  return next();
}
