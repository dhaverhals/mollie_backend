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
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

const _mollie = Mollie({
    apiKey: 'test_m8qj9mcpP7B36NDKSaKdhzrFPvMvEq'
});

app.get('/:trail/:explorer', (req, res) => {

    const selectedIssuer = req.query.issuer;
    // Show a payment screen where the consumer can choose its issuing bank.
    if (!selectedIssuer) {
        _mollie.issuers.all()
            .then((issuers) => {
                console.log()
                res.send({
                    issuers: issuers
                });
            })
            .catch((error) => {
                // Do some proper error handling.
                res.send(error);
            });

        return;
    }

    const order = new Date().getTime();
    const trail = req.params['trail'].replace(/_/g, ' ');
    const explorer = req.params['explorer'];
    const trailId = req.query.trail.replace(/_/g, ' ');

    const amount = parseInt(req.query.amount);
    const hire = parseInt(req.query.hire);
    const update = req.query.update == "true";

    console.log('...................');
    console.log('Creating payment');
    console.log('explorer: ' + explorer);
    console.log('trail: ' + trail);

    console.log('...................');
    console.log("hire: " + hire);
    console.log("update: " + update);
    console.log("amount: " + amount);
    console.log('...................');

    const total = update ? hire : (amount + hire);
    const descr = update ? `Indie Trails | Laptop voor de ${trail}: ${order}` : (hire != 0 ? `Indie Trails | ${trail} met laptop: ${order}` : `Indie Trails | ${trail} zonder laptop: ${order}`)
    console.log("total: " + total);

    _mollie.payments.create({
        amount: total,
        description: descr,
        redirectUrl: `http://localhost:4200/redirect/${order}`,
        webhookUrl: `https://dennishaverhals.nl/mollie/webhook/${order}/${trailId}/${explorer}/`,
        metadata: {
            order,
            explorer,
            trailId,
            amount,
            hire,
            update
        },
        method: 'ideal',
        issuer: selectedIssuer,
    }).then((payment) => {
        console.log("payment created");
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        res.send({
            payment: payment.id,
            trail: trailId,
            explorer,
            order,
            total,
            amount,
            hire,
            update,
            url: payment.getPaymentUrl()
        });
    }).catch((error) => {
        console.log("payment error");
        console.log(error);
        // Do some proper error handling.
        res.send(error);
    });
});

app.get('/:order', (req, res) => {
    const order = req.params['order'];
    _mollie.payments.get(order).then((payment) => {

        if (payment.isPaid()) {
            res.send({
                order,
                state: 'paid'
            })

        } else if (!payment.isOpen()) {
            res.send({
                order,
                state: 'closed'
            })
        }
    }).catch((error) => {
        console.log("payment error");
        console.log(error);
        // Do some proper error handling.
        res.send(error);
    });
});


app.listen(8080, () => {
    console.log("started listening on port: 8080")
    console.log('...................');
    console.log('...................');
    console.log('...................');
    console.log('...................');
})
