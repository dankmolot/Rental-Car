const express = require('express');
const bodyParser = require('body-parser');
const rental = require('./rentalPrice');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/pictures', express.static('images'));

const formHtml = fs.readFileSync('form.html', 'utf8');
const resultHtml = fs.readFileSync('result.html', 'utf8');

app.post('/', (req, res) => {
  const post = req.body;
  const pickupDate = new Date(post.pickupDate);
  const dropoffDate = new Date(post.dropoffDate);
  // const carType = String(post.carType);
  const driverAge = Number(post.driverAge);

  let result = formHtml + resultHtml;

  for (const carType of rental.VALID_CAR_CLASSES) {
    const price = rental.calculatePrice(pickupDate, dropoffDate, carType, driverAge);
    result = result.replaceAll('$price' + carType, price);
  }

  res.send(result);
});

app.get('/', (req, res) => {
  res.send(formHtml);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
