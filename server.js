const Mollie = require('mollie-api-node');
const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
const _mollie = Mollie({
    apiKey: 'test_m8qj9mcpP7B36NDKSaKdhzrFPvMvEq'
});



app.get('/:trail/:user', (req, res) => {
    const orderId = new Date().getTime();
    const trail = req.params['trail'].replace(/_/g, ' ');

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

    console.log('.....................');
    console.log('Creating payment');
    console.log('user: ' + req.params['user']);
    console.log('trail: ' + trail);

    _mollie.payments.create({
        amount: 10.00,
        description: `Indie Trails | ${trail}: ${orderId}`,
        redirectUrl: `http://localhost:4200/redirect/${orderId}`,
        webhookUrl: `https://indietrails.nl/redirect/${orderId}`,
        metadata: {
            orderId
        },
        method: 'ideal',
        issuer: selectedIssuer,
    }).then((payment) => {
        console.log("payment created");
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        res.redirect(payment.getPaymentUrl());
    }).catch((error) => {
        // Do some proper error handling.
        res.send(error);
    });
});

app.listen(8080, () => {
    console.log("started listening on port: 8080")
})
