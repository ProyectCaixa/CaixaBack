const express = require('express');
const ClienteController = require('../ClienteControlles/ClienteControllers');
const router = express.Router();


//router.get('/:id', userController.getUsers);
router.get("/", ClienteController.getCliente );
router.post("/cliente", ClienteController.addCliente );



module.exports = router;
