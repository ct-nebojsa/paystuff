export const PARTNERS = [
    { value: 'computop', label: 'Computop' },
    { value: 'bnp', label: 'BNP' },
    { value: 'nexi', label: 'NEXI' },
    { value: 'ing', label: 'ING' },
]

export function getBaseUrl(partner, environment) {
    if (partner === 'bnp') {
        return 'paymentpage.axepta.bnpparibas'
    } else if (partner === 'nexi') {
        return 'nexi-domain-placeholder.com'
    } else if (partner === 'ing') {
        return 'ing-domain-placeholder.com'
    } else if (environment === 'dev') {
        return 'dev.computop.de/paygate'
    } else if (environment === 'test') {
        return 'test.computop-paygate.com'
    } else {
        return 'computop-paygate.com'
    }
}
