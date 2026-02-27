import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const targetUrl = request.nextUrl.searchParams.get('url')

    if (!targetUrl) {
        return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
        parsedUrl = new URL(targetUrl)
    } catch {
        return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            redirect: 'follow',
        })

        // Build clean response headers (strip anti-framing headers)
        const responseHeaders = new Headers()
        const headersToStrip = new Set([
            'x-frame-options',
            'content-security-policy',
            'x-content-type-options',
            'content-encoding', // We'll handle encoding ourselves
        ])

        response.headers.forEach((value, key) => {
            if (!headersToStrip.has(key.toLowerCase())) {
                responseHeaders.set(key, value)
            }
        })

        // Add permissive framing headers
        responseHeaders.set('X-Frame-Options', 'ALLOWALL')
        responseHeaders.set('Access-Control-Allow-Origin', '*')

        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('text/html')) {
            let html = await response.text()

            const baseOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`
            const basePath = parsedUrl.pathname.endsWith('/')
                ? parsedUrl.pathname
                : parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)
            const baseHref = `${baseOrigin}${basePath}`

            // Inject base tag and a script to handle relative navigation inside iframe
            const injection = `
<base href="${baseHref}">
<script>
// Allow navigation within the iframe
window.addEventListener('click', function(e) {
    var el = e.target.closest('a');
    if (el && el.href && !el.href.startsWith('javascript:')) {
        var href = el.href;
        if (!href.startsWith('${baseOrigin}') && !href.startsWith('/')) return;
        e.preventDefault();
        var proxyUrl = '/_proxy?url=' + encodeURIComponent(href);
        window.location.href = proxyUrl;
    }
}, true);
</script>`.trim()

            // Insert before </head> or at start of <head>
            if (html.includes('</head>')) {
                html = html.replace('</head>', `${injection}</head>`)
            } else if (html.includes('<head>')) {
                html = html.replace('<head>', `<head>${injection}`)
            } else {
                html = injection + html
            }

            responseHeaders.set('Content-Type', 'text/html; charset=utf-8')

            return new NextResponse(html, {
                status: response.status,
                headers: responseHeaders,
            })
        }

        // For non-HTML content (CSS, JS, images, etc.), pass through as-is
        const body = await response.arrayBuffer()
        return new NextResponse(body, {
            status: response.status,
            headers: responseHeaders,
        })

    } catch (error: any) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: `Não foi possível acessar: ${error.message}` },
            { status: 502 }
        )
    }
}

export async function POST(request: NextRequest) {
    return GET(request)
}
