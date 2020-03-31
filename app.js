const express = require('express');
const dotenv = require('dotenv');
const polizaRouter = require('./api/poliza/poliza.route');

dotenv.config();
const app = express();
app.use(express.json());
app.use(
    express.urlencoded({
    extended: false
    })
);

app.use('/api/poliza', polizaRouter);

app.listen(3000, () => console.log('Listening on port 3000'));