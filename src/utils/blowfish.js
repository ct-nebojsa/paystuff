import CryptoJS from 'crypto-js'

export function encryptBlowfish(text, password) {
    return CryptoJS.Blowfish.encrypt(text, CryptoJS.enc.Utf8.parse(password), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).ciphertext.toString(CryptoJS.enc.Hex)
}

// Paygate pads Blowfish data with zero bytes, not PKCS7. Unpadding with
// PKCS7 reads the last plaintext byte as a pad length and strips up to 255
// real characters, so decrypt without padding and cut to Len (when known)
// or trim trailing null bytes.
export function decryptBlowfish(hexData, password, len = 0) {
    const decrypted = CryptoJS.Blowfish.decrypt(
        { ciphertext: CryptoJS.enc.Hex.parse(hexData.replace(/\s+/g, '')) },
        CryptoJS.enc.Utf8.parse(password),
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
        }
    )
    let text = decrypted.toString(CryptoJS.enc.Utf8)
    if (len > 0) {
        return text.slice(0, len)
    }
    // data encrypted by this tool carries valid PKCS7 padding - strip it
    // only when the whole tail is consistent so real text is never cut
    const n = text.charCodeAt(text.length - 1)
    if (n >= 1 && n <= 8 && text.length >= n && [...text.slice(-n)].every(c => c.charCodeAt(0) === n)) {
        text = text.slice(0, -n)
    }
    return text.replace(/\0+$/, '')
}
