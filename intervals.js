const { exec } = require('child_process');
const axios = require('axios');

const intervalReadEmails = 1 * 15 * 1000; // Intervalo de 15 seg
const comando = 'node newToken';

async function ejecutarIntervalos() {
    setInterval(async () => {
        try {

            await ejecutarComando(comando);

            await axios.get('http://localhost:3004/auth/login');
            console.log('Login con exito')

            await axios.get('http://localhost:3004/gmail/readEmails');
            console.log('Emails leidos con exito')

            await axios.get('http://localhost:3004/gmail/emailstotasks');
            console.log('Emails convertidos en tareas con exito')

        } catch (error) {
            console.error('Error al ejecutar los intervalos automáticos:', error);
        }
    }, intervalReadEmails);
}

function ejecutarComando(comando) {
    return new Promise((resolve, reject) => {
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar el comando: ${error.message}`);
                reject(error);
            }
            if (stderr) {
                console.error(`Comando generó errores: ${stderr}`);
                reject(new Error(`Comando generó errores: ${stderr}`));
            }
            console.log(`Comando ejecutado con éxito: ${stdout}`);
            resolve(stdout);
        });
    });
}

module.exports = ejecutarIntervalos;
