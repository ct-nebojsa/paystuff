// One entry per pay type. Adding a new pay type = adding one entry here.
//
// value       internal key + dropdown value
// label       dropdown label
// aspx        target aspx page (defaults to value)
// msgVer2     state of the MsgVer=2.0 checkbox when this pay type is selected
// divider     renders a disabled separator row in the dropdown
// onSelect    extra form changes applied when the pay type is selected
// buildParams adjusts the encrypted request parameters (add/remove keys)
export const PAYTYPES = [
    {
        value: 'mandateform', label: 'EasyCollect (mandateform.aspx)', msgVer2: false,
    },
    {
        value: 'floapay', label: 'Floapay (floapay.aspx)', msgVer2: false,
        buildParams(vm, params) {
            Object.assign(params, {
                Homepage: 'https://localhost:3005/homepage',
                CustomerID: vm.customerid,
                LastName: 'User',
                FirstName: 'Test',
                AddrCountryCode: '276',
                Date: '2025/01/01',
                NumberArticles: '2',
            })
        },
    },
    {
        value: 'paymentpage', label: 'HPP (paymentpage.aspx)', msgVer2: true,
    },
    {
        value: 'installment', label: 'CB2A Installments (installment.aspx)', msgVer2: false,
    },
    {
        value: 'instanea', label: 'Instanea (instanea.aspx)', msgVer2: false,
    },
    {
        value: 'klarnapayments', label: 'KlarnaPM (klarnapayments.aspx)', msgVer2: false,
        buildParams(vm, params) {
            Object.assign(params, {
                ArticleList: btoa(vm.articlelist),
                TaxAmount: '100',
                URLConfirm: 'https://localhost:3005/confirm',
                bdCountryCode: 'DE',
                Account: '1',
            })
        },
    },
    {
        value: 'payssl', label: 'payssl (payssl.aspx)', msgVer2: true,
    },
    {
        value: 'paybylink', label: 'paybylink (paybylink.aspx)', msgVer2: true,
        buildParams(vm, params) {
            if (vm.includeExpirationDate) {
                params.ExpirationDate = vm.paybylinkexpiration
            }
        },
    },
    {
        value: 'paytweak', label: 'paytweak (paybylinkexternal.aspx)', aspx: 'paybylinkexternal', msgVer2: true,
        onSelect(vm) {
            vm.isOtherParameters = true
            vm.otherparams = 'Language=en&externalLanguage=US&bdEmail=nebojsa.pesic@computop.com'
        },
        buildParams(vm, params) {
            if (vm.includePaytweakService) {
                params.Service = vm.paytweak_service
            }
            if (vm.includePaytweakReminderEmail) {
                params.reminderEmail = btoa(vm.paytweak_reminder_email)
            }
            delete params.URLSuccess
            delete params.URLFailure
            delete params.URLBack
            delete params.URLNotify
        },
    },
    {
        value: 'direct', label: 'S2S (direct.aspx)', msgVer2: true,
        onSelect(vm) {
            vm.isOtherParameters = true
            vm.otherparams = 'PayType=CB2A'
            vm.isBrowserInfo = true
            vm.isThreeDsData = true
            vm.isCard = true
        },
        buildParams(vm, params) {
            delete params.URLSuccess
            delete params.URLFailure
            delete params.URLBack
        },
    },
    {
        value: 'applepay', label: 'Apple Pay S2S (applepay.aspx)', msgVer2: false,
        onSelect(vm) {
            vm.isOtherParameters = true
        },
        buildParams(vm, params) {
            delete params.URLSuccess
            delete params.URLFailure
            delete params.URLBack
        },
    },
    {
        value: 'simplepay', label: 'SimplePay (simplepay.aspx)', msgVer2: false,
        onSelect(vm) {
            vm.currency = 'HUF'
        },
    },
    {
        value: 'twintpp', label: 'TWINT via PPRO (twintpp.aspx)', msgVer2: false,
        buildParams(vm, params) {
            Object.assign(params, {
                AccOwner: 'Nebojsa Pesic'
            })
        },
    },
    {
        value: '---', divider: true,
    },
    {
        value: 'credit', label: 'Refund (credit.aspx)', msgVer2: false,
        onSelect(vm) {
            vm.urlsuccess = ''
            vm.urlfailure = ''
            vm.urlback = ''
            vm.urlnotify = ''
            vm.isOtherParameters = true
        },
    },
    {
        value: 'increment', label: 'Increment (increment.aspx)', msgVer2: false,
        onSelect(vm) {
            vm.urlsuccess = ''
            vm.urlfailure = ''
            vm.urlback = ''
            vm.urlnotify = ''
            vm.isOtherParameters = true
            vm.otherparams = 'PayID='
        },
    },
]

export function getPaytypeConfig(value) {
    return PAYTYPES.find(p => p.value === value && !p.divider)
}
