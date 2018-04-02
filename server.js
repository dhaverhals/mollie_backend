const Mollie = require('mollie-api-node');
const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const _mollie = Mollie({ apiKey: 'test_m8qj9mcpP7B36NDKSaKdhzrFPvMvEq' });

app.get('/:trail/:user', (req, res) => {
  const orderId = new Date().getTime();
  const trail = req.params['trail'].replace('_', ' ');
  console.log('....................');
  console.log('Creating payment');
  console.log('user: ' + req.params['user']);
  console.log('trail: ' + trail);
  _mollie.payments.create({
    amount: 10.00,
    description: `Indie Trails | ${trail}: ${orderId}`,
    redirectUrl: `http://localhost:4200/redirect/${orderId}`,
    webhookUrl: `http://localhost:4200/webhook/${orderId}`,
    metadata: { orderId },
}, (payment) => {
      // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
      res.redirect(payment.getPaymentUrl());
  }, (error) => {
      // Do some proper error handling.
      res.send(error);
    });
});

app.listen(8080, () => {
    console.log("started listening on port: 8080" )
})
