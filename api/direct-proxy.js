import { getBaseUrl } from '../src/utils/partners.js'

// Server-side proxy for direct.aspx: browsers can't read a cross-origin
// iframe's body, and Computop sends no CORS headers, so the response can't
// be fetched from client-side JS either. This runs the call from Vercel
// instead, where there's no CORS restriction.
//
// The target host is always derived from getBaseUrl() (Computop domains
// only) - a client-supplied target URL is never used - so this cannot be
// abused as an open proxy to arbitrary hosts.
export default async function handler(req, res) {
    const { partner, environment, merchantid, len, data } = req.query

    if (!merchantid || !len || !data) {
        res.status(400).json({ error: 'merchantid, len and data are required' })
        return
    }
    if (!/^\d+$/.test(len)) {
        res.status(400).json({ error: 'len must be numeric' })
        return
    }
    if (!/^[0-9A-Fa-f]+$/.test(data)) {
        res.status(400).json({ error: 'data must be hex' })
        return
    }

    const baseurl = getBaseUrl(partner, environment)
    const targetUrl = `https://${baseurl}/direct.aspx?MerchantID=${encodeURIComponent(merchantid)}&Len=${len}&Data=${data}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
        const upstream = await fetch(targetUrl, { method: 'GET', signal: controller.signal })
        const body = await upstream.text()
        res.status(200).json({ status: upstream.status, body })
    } catch (e) {
        res.status(502).json({ error: 'Could not reach Paygate', detail: String(e) })
    } finally {
        clearTimeout(timeout)
    }
}
