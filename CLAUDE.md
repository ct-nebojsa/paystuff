This is Computop public docu: https://developer.computop.com/

ApplePay docu:  https://developer.computop.com/display/EN/Apple+Pay

GooglePay docu: https://developer.computop.com/display/EN/Google+Pay

CB2A Installment docu: to be added

--

# CORE

Computop Paygate is a KVP API gateway written in C#.

Pay types consist of actions. This means one credit card payment can have multiple actions depending on scenario, possible actions are:
AUTHENTICATE (for 3DS)
AUTHORIZE
CAPTURE_REQUEST
CREDIT_REQUEST
SALE (AUTHORIZE + CAPTURE)
REVERSE

## Integration

Direct integration usually means dedicated aspx page
For example ApplePay has applepay.aspx

