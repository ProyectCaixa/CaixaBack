const { google } = require('googleapis');
const authManager = require('./authManager');

const calendarController = {
    todayEvents: async (req, res) => {

        try {
            const auth = authManager.getGlobalAuth();

            if (!auth) {
                return res.status(401).json('No se encontró una autorización válida.');
            }

            const calendar = google.calendar({
                version: 'v3',
                auth,
            });

            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(8, 0, 0, 0);

            const todayEnd = new Date(now);
            todayEnd.setHours(18, 0, 0, 0);

            try {
                const response = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin: todayStart.toISOString(),
                    timeMax: todayEnd.toISOString(),
                    maxResults: 10,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                const events = response.data.items;

                if (!events || events.length === 0) {
                    console.log('No upcoming events found.');
                    return res.status(404).json('No upcoming events found.');
                }

                const upcomingEvents = events.map((event) => ({
                    start: event.start.dateTime || event.start.date,
                    summary: event.summary,
                }));

                console.log('Upcoming 10 events:', upcomingEvents);
                res.json(upcomingEvents);
            } catch (error) {
                console.error('Error al listar eventos:', error);
                res.status(500).json('Error al listar eventos', error);
            }

        } catch (error) {
            console.error('Error al listar eventos:', error);
            res.status(500).json('Error al autorizar y listar eventos', error);
        }
    },

    createEvent: async (req, res) => {
        const { summary, description, start } = req.body;

        const event = {
            'summary': summary,
            'description': description || '',
            'start': {
                'dateTime': start,
                'timeZone': 'Europe/Madrid',
            },
            'end': {
                'dateTime': '',
                'timeZone': 'Europe/Madrid',
            }
        }

        const auth = authManager.getGlobalAuth();

        if (!auth) {
            return res.status(401).json('No se encontró una autorización válida.');
        }

        const calendar = google.calendar({
            version: 'v3',
            auth,
        });

        const checkSlot = async (datestart) => {
            let currentStart = new Date(datestart);

            const events = await calendar.events.list({
                calendarId: 'primary',
                timeMin: currentStart.toISOString(),
                timeMax: new Date(currentStart.getTime() + 3600000).toISOString(),
                maxResults: 1,
            });

            if (events.data.items.length > 0) {

                currentStart.setHours(currentStart.getHours() + 1);
                return await checkSlot(currentStart);
            } else {

                if (
                    currentStart.getHours() < 8 ||
                    currentStart.getHours() >= 18 ||
                    currentStart.getDay() === 0 ||
                    currentStart.getDay() === 6
                ) {

                    currentStart.setHours(8);
                    if (currentStart.getDay() === 0) {
                        currentStart.setDate(currentStart.getDate() + 1);
                    } else if (currentStart.getDay() === 6) {
                        currentStart.setDate(currentStart.getDate() + 2);
                    }
                }
            }

            return currentStart;
        };

        try {
            let availableSlot = await checkSlot(start);
            console.log('soy la fehca', availableSlot)

            const result = await calendar.events.list({
                calendarId: 'primary',
                timeMin: availableSlot,
                maxResults: 1,
            });
            if (result.data.items.length > 0) {
                availableSlot = await checkSlot(availableSlot);
                console.log('Nuevo hueco encontrado', availableSlot);
            }

            event.start.dateTime = availableSlot.toISOString();
            const endDate = new Date(availableSlot);
            endDate.setHours(endDate.getHours() + 1);
            event.end.dateTime = endDate.toISOString();

            calendar.events.insert({
                auth: auth,
                calendarId: 'primary',
                resource: event,
            }, (err, insertedEvent) => {
                if (err) {
                    console.error('Hubo un error al contactar el servicio de Calendario:', err);
                    res.status(500).json({ message: 'Error al crear el evento', error: err });
                    return;
                }
                res.status(200).json({ message: 'Evento creado con éxito', event: insertedEvent.config.data });
            });

        } catch (error) {
            console.error('Error al buscar un hueco en el calendario:', error);
            res.status(500).json({ message: 'Error al buscar un hueco en el calendario', error: error });
        };
    }

}


module.exports = calendarController;