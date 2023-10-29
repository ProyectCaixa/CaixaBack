const { google } = require('googleapis');
const authManager = require('./authManager');
const axios = require('axios');

const emailData = [];

const gmailController = {

    readEmails: async (req, res) => {
        const auth = authManager.getGlobalAuth();
        try {
            const gmail = google.gmail({ version: 'v1', auth });

            emailData.length = 0;

            const response = await gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread',
            });

            const messages = response.data.messages;

            for (const message of messages) {
                const emailInfo = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                });

                const email = emailInfo.data;

                const headers = email.payload.headers;
                const subject = headers.find(header => header.name === 'Subject').value;
                const sender = headers.find(header => header.name === 'From').value;
                const body = email.snippet;
                const labels = email.labelIds;
                const dateReceived = new Date(headers.find(header => header.name === 'Date').value).toISOString();

                emailData.push({
                    subject,
                    sender,
                    body,
                    labels,
                    id: message.id,
                    date: dateReceived
                });
            }

            res.json(emailData);
        } catch (error) {
            console.error('Error al comprobar correos electrónicos:', error);
        }
    },
    searchEmailsAndcreateEvent: async (req, res) => {
        // Filtrar correos con "hipoteca" en el asunto
        const correosConHipoteca = emailData.filter(email => email.subject.toLowerCase().includes('hipoteca'));

        // Realizar llamada por Axios y crear tarea en calendario
        correosConHipoteca.forEach(async (correo) => {
            try {
                const { subject, body } = correo;

                const event = {
                    summary: subject,
                    description: body,
                    start: correo.date, // Suponiendo que correo.date contiene la fecha de recepción del correo
                };

                // Realizar la llamada a otro endpoint en tu servidor
                await axios.post('http://localhost:3004/calendar/create', event);

                console.log(`Tarea creada en el calendario para el correo con asunto: ${subject}`);
                res.status(200).json({ message: 'Email filtrado y tarea creada ' });
            } catch (error) {
                console.error('Error al crear la tarea en el calendario:', error);
            }
        });

        res.json(correosConHipoteca);
    }

}


module.exports = gmailController;



// // Establecer un intervalo para la comprobación cada 5 minutos (300,000 ms)
// const interval = 5 * 60 * 1000; // 5 minutos en milisegundos
// setInterval(checkUnreadEmails, interval);

// // Ejecutar la comprobación inmediatamente al iniciar la aplicación
// checkUnreadEmails();



//             const subject = messageData.data.payload.headers.find((header) => header.name === 'Subject');
//             const subjectText = subject ? subject.value : '';

//             // Asignar prioridad en función del asunto
//             let priority = 'normal';
//             if (subjectText.includes('Urgente')) {
//                 priority = 'alta';
//             } else if (subjectText.includes('Importante')) {
//                 priority = 'media';
//             }

//             console.log('Asunto:', subjectText);
//             console.log('Prioridad:', priority);

//             // Aquí puedes realizar acciones adicionales según la prioridad, como enviar notificaciones, archivar, etc.
//         }
//     } catch (error) {
//         console.error('Error al comprobar correos electrónicos:', error);
//     }
// }
