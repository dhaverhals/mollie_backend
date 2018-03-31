Mollie = require('mollie-api-node');
express = require('express');
cors = require('cors');

const express = require('express');
const mollie = require('mollie-api-node');

const app = express();

const cors = require('cors')

var corsOptions = {
  origin: 'http://example.org',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const mollie = Mollie({ apiKey: 'test_buC3bBQfSQhd4dDUeMctJjDCn3GhP4' });

app.get('/', (req, res) => {
  const orderId = new Date().getTime();

  mollie.payments.create({
    amount: 10.00,
    description: 'New payment',
    redirectUrl: `https://example.org/redirect?orderId=${orderId}`,
    webhookUrl: `http://example.org/webhook?orderId=${orderId}`,
    metadata: { orderId },
}, (payment) => {
      // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
      res.send(payment);
  }, (error) => {
      // Do some proper error handling.
      res.send(error);
    });
});
