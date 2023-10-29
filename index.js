require('dotenv').config();
const express = require('express');
// const fs = require('fs').promises;
// const path = require('path');
const process = require('process');
// const { authenticate } = require('@google-cloud/local-auth');
// const { google } = require('googleapis');
const app = express()
app.use(express.json())

const authGoogleRouter = require("./routes/authGoogleRouter")
const calendarRouter = require("./routes/calendarRouter")
// const clientRouter = require("./routes/clientRouter")
// const gestorRouter = require("./routes/gestorRouter")
const gmailRouter = require("./routes/gmailRouter")

app.use("/auth", authGoogleRouter);
app.use("/calendar", calendarRouter);
// app.use("/client", clientRouter);
// app.use("/gestor", gestorRouter);
app.use("/gmail", gmailRouter);

// const SCOPES = [
//     'https://www.googleapis.com/auth/calendar',
//     'https://www.googleapis.com/auth/gmail.modify'
// ];

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// async function loadSavedCredentialsIfExist() {
//     try {
//         const content = await fs.readFile(TOKEN_PATH);
//         const credentials = JSON.parse(content);
//         return google.auth.fromJSON(credentials);
//     } catch (err) {
//         return null;
//     }
// }

// async function saveCredentials(client) {
//     const content = await fs.readFile(CREDENTIALS_PATH);
//     const keys = JSON.parse(content);
//     const key = keys.installed || keys.web;
//     const payload = JSON.stringify({
//         type: 'authorized_user',
//         client_id: key.client_id,
//         client_secret: key.client_secret,
//         refresh_token: client.credentials.refresh_token,
//     });
//     await fs.writeFile(TOKEN_PATH, payload);
// }


// async function authorize() {
//     let client = await loadSavedCredentialsIfExist();
//     if (client) {
//         return client;
//     }
//     client = await authenticate({
//         scopes: SCOPES,
//         keyfilePath: CREDENTIALS_PATH,
//     });
//     if (client.credentials) {
//         await saveCredentials(client);
//     }
//     return client;
// }

// async function listEvents(auth) {
//     const calendar = google.calendar({ version: 'v3', auth });
//     const res = await calendar.events.list({
//         calendarId: 'primary',
//         timeMin: new Date().toISOString(),
//         maxResults: 10,
//         singleEvents: true,
//         orderBy: 'startTime',
//     });
//     const events = res.data.items;
//     if (!events || events.length === 0) {
//         console.log('No upcoming events found.');
//         return;
//     }
//     console.log('Upcoming 10 events:');
//     events.map((event, i) => {
//         const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);
//     });
// }


// async function listLabels(auth) {
//     const gmail = google.gmail({ version: 'v1', auth });
//     const res = await gmail.users.labels.list({
//         userId: 'me',
//     });
//     const labels = res.data.labels;
//     if (!labels || labels.length === 0) {
//         console.log('No labels found.');
//         return;
//     }
//     console.log('Labels:');
//     labels.forEach((label) => {
//         console.log(`- ${label.name}`);
//     });
// }

// async function authorizeAndListData() {
//     try {
//         const auth = await authorize();
//         await listEvents(auth);
//         await listLabels(auth);
//     } catch (error) {
//         console.error('Error en la autorización y listado de datos:', error);
//     }
// }

// authorizeAndListData();



const PORT = process.env.PORT
app.listen(PORT || `0.0.0.0:$PORT`, () => {
    console.log(`Backend de Reto CaixaBank Tech funcionando en el puerto`, PORT)
});