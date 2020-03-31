const express = require('express');
const polizaController = require('./poliza.controller');

const router = express.Router();

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

router.post(
    '/crear',
    polizaController.crearPoliza
);

router.post(
    '/pago',
    polizaController.pagoPoliza
);

router.post(
    '/endoso',
    polizaController.endosoPoliza
);

router.post(
    '/cancelacion',
    polizaController.cancelarPoliza
);



module.exports = router;