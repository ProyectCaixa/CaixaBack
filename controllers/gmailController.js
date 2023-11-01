const { google } = require('googleapis');
const authManager = require('./authManager');
const axios = require('axios');

let filteredEmails = [];

const gmailController = {

    readEmails: async (req, res) => {
        const auth = authManager.getGlobalAuth();

        if (!auth) {
            return res.status(401).json('No se encontró una autorización válida.');
        }

        const gmail = google.gmail({ version: 'v1', auth });

        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
        });

        if (response.data.resultSizeEstimate === 0) {
            console.log('No hay emails sin leer')
            return res.json('No tienes ningún email sin leer.');
        }

        if (response.data.resultSizeEstimate !== 0) {

            const palabrasClave = [
                "Banca", "Cliente", "Cuenta", "Transacción", "Préstamo", "Inversión", "Interés",
                "Depósito", "Divisa", "Saldo", "Transferencia", "Tarjeta", "Seguridad", "Cheque",
                "Cajero Automático", "Hipoteca", "Fondos", "Crédito", "Economía", "Finanzas",
                "Reunión con Cliente", "Evaluación de Riesgo", "Aprobación de Crédito",
                "Análisis de Inversiones", "Planificación Financiera", "Asesoramiento Fiscal",
                "Seguro de Vida", "Gestión Patrimonial", "Pago de Impuestos",
                "Transferencia Internacional", "Tasas de Interés", "Seguridad de la Cuenta",
                "Préstamo Comercial", "Reclamación de Fraude", "Cumplimiento Regulatorio",
                "Atención al Cliente", "Cambio de Contraseña", "Cierre de Cuenta",
                "Fondos Mutuos", "Financiamiento de Vivienda", "urgente", "importante", "Solicitud de Préstamo", "Reclamo sobre Cargo", "Solicitud de Tarjeta de Crédito", "Reclamo sobre Transacción", "Solicitud de Préstamo Hipotecario", "Solicitud de Préstamo para Estudios", "Problema con Transferencia Bancaria",
                "seguridad de la cuenta", "cambio de contraseña", "fondos mutuos", "Pregunta sobre Cuenta de Ahorro", "Consultas de Cuenta de Cheques", "Actualización de Contacto",
                "Efectivo",
                "reunión",
                "aprobación de crédito",
                "análisis de inversiones",
                "Consulta de Inversiones",
                "Pregunta sobre Cuenta de Ahorro",
                "Actualización de Contacto",
                "Consulta sobre Transferencias",
                "Consulta General",
                "Consulta sobre Tarjeta de Débito",
                "Consulta de Préstamo Personal",
                "Consulta de Cuenta de Cheques",
                "Consulta sobre Hipoteca",
                "Consulta de Préstamo Hipotecario",
                "Solicitud de Información de Inversión",
                "Consulta de Cuenta de Ahorro",
                "Confirmación de Transacción",
                "Solicitud de Tarjeta de Crédito Empresarial",
                "Informe de Estado de Cuenta",
                "Consulta de Inversiones"
            ];

            try {
                const messages = response.data.messages;

                filteredEmails = [];

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
                    const dateReceived = new Date(headers.find(header => header.name === 'Date').value).toLocaleString();
                    const contienePalabraClave = palabrasClave.some(palabra => subject.toLowerCase().includes(palabra) || body.toLowerCase().includes(palabra));

                    if (contienePalabraClave) {

                        await gmail.users.messages.modify({
                            userId: 'me',
                            id: message.id,
                            resource: {
                                removeLabelIds: ['UNREAD'],
                            },
                        });


                        filteredEmails.push({
                            id: message.id,
                            subject,
                            sender,
                            body,
                            labels,
                            date: dateReceived
                        });
                    }
                }

                res.json(filteredEmails);
            } catch (error) {
                console.error('Error al comprobar correos electrónicos:', error);
                res.status(500).json('Error al comprobar correos electrónicos');
            }

        }
    },
    //ANALIZAR EMAILS Y CREAR TASK
    EmailsToTasks: async (req, res) => {
        const auth = authManager.getGlobalAuth();

        if (!auth) {
            return res.status(401).json('No se encontró una autorización válida.');
        }

        try {
            if (filteredEmails.length === 0) {
                return res.json('No hay correos electrónicos filtrados.');
            }

            const prioridades = {
                alta: [
                    "urgente",
                    "importante",
                    "Solicitud de Préstamo",
                    "Reclamo sobre Cargo",
                    "Solicitud de Tarjeta de Crédito",
                    "Reclamo sobre Transacción",
                    "Solicitud de Préstamo Hipotecario",
                    "Solicitud de Préstamo para Estudios",
                    "Problema con Transferencia Bancaria"
                ],

                media: [
                    "reunión",
                    "aprobación de crédito",
                    "análisis de inversiones",
                    "Consulta de Inversiones",
                    "Pregunta sobre Cuenta de Ahorro",
                    "Actualización de Contacto",
                    "Consulta sobre Transferencias",
                    "Consulta General",
                    "Consulta sobre Tarjeta de Débito",
                    "Consulta de Préstamo Personal",
                    "Consulta de Cuenta de Cheques",
                    "Consulta sobre Hipoteca",
                    "Consulta de Préstamo Hipotecario",
                    "Solicitud de Información de Inversión",
                    "Consulta de Cuenta de Ahorro",
                    "Confirmación de Transacción",
                    "Solicitud de Tarjeta de Crédito Empresarial",
                    "Informe de Estado de Cuenta",
                    "Consulta de Inversiones"
                ],
                baja: [
                    "seguridad de la cuenta",
                    "cambio de contraseña",
                    "fondos mutuos",
                    "Pregunta sobre Cuenta de Ahorro",
                    "Consultas de Cuenta de Cheques",
                    "Actualización de Contacto",
                    "Efectivo"
                ]
            };

            for (const email of filteredEmails) {
                const { subject, body, sender } = email;

                let priority = 'baja';

                for (const key in prioridades) {
                    if (prioridades[key].some(keyword => subject.toLowerCase().includes(keyword) || body.toLowerCase().includes(keyword))) {
                        priority = key;
                        break;
                    }
                }

                const taskData = {
                    title: `${subject} => ${sender}`,
                    description: body,
                    priority: priority,
                };

                try {
                    const response = await axios.post('http://localhost:3004/task/create', taskData);
                    console.log(`Tarea creada con prioridad ${priority}: ${response.data.title}`);
                } catch (error) {
                    console.error('Error al crear la tarea:', error);
                }
            }

            res.json('Tareas creadas con prioridades.');
        } catch (error) {
            console.error('Error al procesar los correos electrónicos:', error);
            res.status(500).json('Error al procesar los correos electrónicos.');
        }
    }
}

module.exports = gmailController;