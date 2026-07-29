// Target for URLNotify. Paygate delivers the notification as a server-to-server
// POST, and the SPA route /notify is only a static index.html - Vercel answers
// any POST to it with 405, so the callback never lands. This function gives
// Paygate a POST-capable endpoint.
//
// Nothing is stored: a 200 is all Paygate needs to consider the notification
// delivered and stop retrying.
export default function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.setHeader('Allow', 'GET, POST')
        res.status(405).end()
        return
    }

    res.status(200).send('OK')
}
