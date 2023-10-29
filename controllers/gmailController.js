// const { google } = require('googleapis');
// const credentials = require('./path-to-your-credentials.json');

// const client = new google.auth.JWT({
//   email: credentials.client_email,
//   key: credentials.private_key,
//   scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
// });

// // Función para comprobar correos electrónicos no leídos
// async function checkUnreadEmails() {
//   try {
//     await client.authorize();

//     const gmail = google.gmail({ version: 'v1', auth: client });
//     const response = await gmail.users.messages.list({
//       userId: 'me',
//       q: 'is:unread', // Filtra por mensajes no leídos
//     });

//     const messages = response.data.messages;
//     console.log('Mensajes no leídos:', messages);
//   } catch (error) {
//     console.error('Error al comprobar correos electrónicos:', error);
//   }
// }

// // Establecer un intervalo para la comprobación cada 5 minutos (300,000 ms)
// const interval = 5 * 60 * 1000; // 5 minutos en milisegundos
// setInterval(checkUnreadEmails, interval);

// // Ejecutar la comprobación inmediatamente al iniciar la aplicación
// checkUnreadEmails();

// const { google } = require('googleapis');
// const credentials = require('./path-to-your-credentials.json');

// const client = new google.auth.JWT({
//     email: credentials.client_email,
//     key: credentials.private_key,
//     scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
// });

// // Función para comprobar correos electrónicos no leídos
// async function checkUnreadEmails() {
//     try {
//         await client.authorize();

//         const gmail = google.gmail({ version: 'v1', auth: client });
//         const response = await gmail.users.messages.list({
//             userId: 'me',
//             q: 'is:unread', // Filtra por mensajes no leídos
//         });

//         const messages = response.data.messages;

//         for (const message of messages) {
//             const messageData = await gmail.users.messages.get({
//                 userId: 'me',
//                 id: message.id,
//             });

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

// // Establecer un intervalo para la comprobación cada 5 minutos (300,000 ms)
// const interval = 5 * 60 * 1000; // 5 minutos en milisegundos
// setInterval(checkUnreadEmails, interval);

// // Ejecutar la comprobación inmediatamente al iniciar la aplicación
// checkUnreadEmails();
