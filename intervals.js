const gmailController = require('./controllers/gmailController');
const authController = require('./controllers/authGoogleController');
const axios = require('axios');

const intervalReadEmails = 1 * 10 * 1000;

function ejecutarIntervalos() {
    setInterval(async () => {
        try {
            await axios.get('http://localhost:3004/auth/login');
            console.log(`Login realizado`);

            const fechaActual = new Date().toLocaleString();

            await gmailController.readEmails({}, { json: (data) => ({ json: data }) });
            console.log(`Ejecutando readEmails a las ${fechaActual}`);


            await gmailController.searchEmailsAndcreateEvent({}, { json: (data) => ({ json: data }) });
            console.log(`Ejecutando searchEmailsAndcreateEvent a las ${fechaActual}`);
        } catch (error) {
            console.error('Error al ejecutar los intervalos automáticos:', error);
        }
    }, intervalReadEmails);
}

module.exports = ejecutarIntervalos;