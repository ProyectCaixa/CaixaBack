const { google } = require('googleapis');
const authManager = require('./authManager');
const axios = require('axios');

const emailData = [];

const gmailController = {

    readEmails: async (req, res) => {
        const auth = authManager.getGlobalAuth();

        const gmail = google.gmail({ version: 'v1', auth });

        emailData.length = 0;

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
        });

        if (response.data.resultSizeEstimate === 0) {
            console.log('No hay emails sin leer')
            return res.json('No tienes ningún email sin leer.');
        }

        if (response.data.resultSizeEstimate !== 0) {
            try {
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

                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: message.id,
                        resource: {
                            removeLabelIds: ['UNREAD'],
                        },
                    });
                }

                res.json(emailData);
            } catch {
                console.error('Error al comprobar correos electrónicos');
            }
        }

    },

    searchEmailsAndcreateEvent: async (req, res) => {
        if (emailData.length === 0) {
            const palabrasClave = ['hipoteca', 'prestamo', 'gestor', 'fondo', 'pension'];
            const correosFiltrados = emailData.filter(email => {
                const subject = email.subject.toLowerCase();
                return palabrasClave.some(palabra => subject.includes(palabra));
            });

            correosFiltrados.forEach(async (correo) => {
                try {
                    const { subject, body } = correo;

                    const event = {
                        summary: subject,
                        description: body,
                        start: correo.date,
                    };

                    await axios.post('http://localhost:3004/calendar/create', event);

                    console.log(`Tarea creada en el calendario para el correo con asunto: ${subject}`);
                } catch (error) {
                    console.error('Error al crear la tarea en el calendario:', error);
                }
            });
            console.log('Tareas creadas en el calendario')
            res.json('Tareas creadas en el calendario');
        }

    }
}

module.exports = gmailController;