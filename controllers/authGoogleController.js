const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const authManager = require('./authManager')

const authGoogleController = {
    login: async (req, res) => {
        const SCOPES = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/gmail.modify'
        ];
        const TOKEN_PATH = path.join(process.cwd(), 'token.json');
        const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

        async function loadSavedCredentialsIfExist() {
            try {
                const content = await fs.readFile(TOKEN_PATH);
                const credentials = JSON.parse(content);
                return google.auth.fromJSON(credentials);
            } catch (err) {
                console.error('Error en loadSavedCredentialsIfExist', err);
                throw err;
            }
        }

        async function saveCredentials(client) {
            try {
                const content = await fs.readFile(CREDENTIALS_PATH);
                const keys = JSON.parse(content);
                const key = keys.installed || keys.web;
                const payload = JSON.stringify({
                    type: 'authorized_user',
                    client_id: key.client_id,
                    client_secret: key.client_secret,
                    refresh_token: client.credentials.refresh_token,
                });
                await fs.writeFile(TOKEN_PATH, payload);
            } catch (err) {
                console.error('Error en saveCredentials', err);
                throw err;
            }
        }

        async function authorize() {
            try {
                let client = await loadSavedCredentialsIfExist();
                if (client) {
                    authManager.setGlobalAuth(client);
                    return client;
                }
                client = await authenticate({
                    scopes: SCOPES,
                    keyfilePath: CREDENTIALS_PATH,
                });
                if (client.credentials) {
                    await saveCredentials(client);
                    authManager.setGlobalAuth(client);
                }
                return client;
            } catch (error) {
                console.error('Error en la autorización y listado de datos:', error);
                throw error;
            }
        }

        try {
            await authorize();
            res.json('Login con éxito');
        } catch (error) {
            console.error('Error en la autorización y listado de datos:', error);
        }
    },

    newToken: async (req, res) => {
        const TOKEN_PATH = '../../token.json';

        const tokenData = fs.readFile(TOKEN_PATH);
        const tokenObject = JSON.parse(tokenData);

        const refreshToken = tokenObject.refresh_token;
        const clientId = tokenObject.client_id;
        const clientSecret = tokenObject.client_secret;

        const requestBody = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        };

        await axios.post('https://accounts.google.com/o/oauth2/token', requestBody)
            .then(response => {
                const newAccessToken = response.data.access_token;
                console.log('Nuevo token de acceso:', newAccessToken);
            })
            .catch(error => {
                console.error('Error al refrescar el token de acceso:', error);
            });
    }
}

module.exports = authGoogleController

