export function splitParam(param) {
    const i = param.indexOf('=')
    return i === -1 ? [param, ''] : [param.slice(0, i), param.slice(i + 1)]
}

// Returns the decoded text when a key=value pair's value is base64-encoded
// readable text (Paygate uses base64 for JSON blobs like card), otherwise
// null. The printable check keeps hex IDs and short plain values from
// being false-flagged.
export function base64ParamValue(param) {
    const value = splitParam(param)[1]
    if (value.length < 12 || value.length % 4 !== 0) return null
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null
    try {
        const decoded = atob(value)
        if (decoded.length === 0) return null
        const printable = [...decoded].every(c => {
            const n = c.charCodeAt(0)
            return (n >= 32 && n <= 126) || n === 9 || n === 10 || n === 13
        })
        return printable ? decoded : null
    } catch (e) {
        return null
    }
}
