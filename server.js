const Mollie = require('mollie-api-node');
const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

const _mollie = Mollie({
    apiKey: 'test_m8qj9mcpP7B36NDKSaKdhzrFPvMvEq'
});

app.get('/:trail/:user', (req, res) => {
    const orderId = new Date().getTime();
    const trail = req.params['trail'].replace(/_/g, ' ');
    const user = req.params['user'];
    const selectedIssuer = req.query.issuer;

    // Show a payment screen where the consumer can choose its issuing bank.
    if (!selectedIssuer) {
        _mollie.issuers.all()
            .then((issuers) => {
                console.log()
                res.send({issuers: issuers});
            })
            .catch((error) => {
                // Do some proper error handling.
                res.send(error);
            });

        return;
    }

    console.log('........................');
    console.log('Creating payment');
    console.log('user: ' + user);
    console.log('trail: ' + trail);

    _mollie.payments.create({
        amount: 10.00,
        description: `Indie Trails | ${trail}: ${orderId}`,
        redirectUrl: `http://localhost:4200/redirect/${orderId}`,
        webhookUrl: `https://indietrails.nl/webhook/${orderId}`,
        metadata: {
            orderId, user
        },
        method: 'ideal',
        issuer: selectedIssuer,
    }).then((payment) => {
        console.log("payment created");
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        res.send({order: orderid, url: payment.getPaymentUrl() });
    }).catch((error) => {
        console.log("payment error");
        // Do some proper error handling.
        res.send(error);
    });
});

app.listen(8080, () => {
    console.log("started listening on port: 8080")
})
