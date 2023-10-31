const { google } = require('googleapis');
const authManager = require('./authManager');
const { DateTime } = require('luxon');


const calendarController = {
    todayEvents: async (req, res) => {
        // coger todos los eventos del dia, exceptuando los de color morado que son los que hemos puesto para formaciones y demas actividades internas.
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
                    maxResults: 12,
                    singleEvents: true,
                    orderBy: 'startTime',
                });

                const events = response.data.items.filter(event => event.colorId !== '1');

                if (!events || events.length === 0) {
                    console.log('No upcoming events found.');
                    return res.status(404).json('No upcoming events found.');
                }

                const upcomingEvents = events.map((event) => ({
                    start: DateTime.fromISO(event.start.dateTime || event.start.date)
                        .toLocal()
                        .toFormat('yyyy-MM-dd HH:mm:ss'),
                    end: DateTime.fromISO(event.end.dateTime || event.end.date)
                        .toLocal()
                        .toFormat('yyyy-MM-dd HH:mm:ss'),
                    summary: event.summary,
                    description: event.description,
                }));


                console.log('Upcoming 10 events:', upcomingEvents);
                res.json(upcomingEvents);
            } catch (error) {
                console.error('Error al listar eventos:', error);
                res.status(500).json('Error al listar eventos');
            }

        } catch (error) {
            console.error('Error al listar eventos:', error);
            res.status(500).json('Error al autorizar y listar eventos');
        }
    },

    createEvent: async (req, res) => {
        const { summary, description, start, end } = req.body;

        const event = {
            'summary': summary,
            'description': description || '',
            'start': {
                'dateTime': start,
                'timeZone': 'Europe/Madrid',
            },
            'end': {
                'dateTime': end,
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

        try {
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
    },

    checkAndAddStudy: async (req, res) => {
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
            const startTime = DateTime.fromJSDate(now).set({ hour: 8, minute: 0, second: 0, millisecond: 0 });
            const startTimeBucle = startTime.toFormat('yyyy-MM-dd HH:mm:ss');


            const endTime = DateTime.fromJSDate(now).set({ hour: 18, minute: 0, second: 0, millisecond: 0 });
            const endTimeFormatted = endTime.toFormat('yyyy-MM-dd HH:mm:ss');

            const events = await calendar.events.list({
                auth,
                calendarId: 'primary',
                timeMin: startTimeBucle,
                timeMax: endTimeFormatted,
                maxResults: 12,
                singleEvents: true,
                orderBy: 'startTime',
            });


            for (let i = 0; i < events.data.items.length; i++) {

                let firstEventStartTimeBucle = DateTime.fromISO(events.data.items[0].start.dateTime).toLocal()
                    .toFormat('yyyy-MM-dd HH:mm:ss')
                let eventStartTimeBucle = DateTime.fromISO(events.data.items[i].start.dateTime).toLocal()
                    .toFormat('yyyy-MM-dd HH:mm:ss')
                console.log('soy start', startTimeBucle)
                console.log('soy first', firstEventStartTimeBucle)

                if (i === 0 && firstEventStartTimeBucle > startTimeBucle) {

                    const event = {
                        summary: 'Revisión',
                        description: 'Revisa las tareas que tienes pendientes y las citas de hoy',
                        start: {
                            dateTime: startTimeBucle

                        },

                        end: {
                            dateTime: firstEventStartTimeBucle
                        },
                        colorId: '1'
                    }
                    await calendar.events.insert({
                        auth,
                        calendarId: 'primary',
                        resource: event,
                    });
                    console.log('tarea creada al principio')
                }

                if (i > 0) {
                    const eventPrevItemEndTimeBucle = new Date(events.data.items[i - 1].end.dateTime);

                    if (eventStartTimeBucle > eventPrevItemEndTimeBucle) {

                        const freeEvent = {
                            summary: 'Formación',
                            description: 'Aprovecha el tiempo para mejorar tu formación y leer la documentación de nuestros nuevos productos',
                            start: {
                                dateTime: DateTime.fromJSDate(eventPrevItemEndTimeBucle).toISO(),
                            },
                            end: {
                                dateTime: DateTime.fromJSDate(eventStartTimeBucle).toISO(),
                            },
                            colorId: '1'
                        }
                        await calendar.events.insert({
                            auth,
                            calendarId: 'primary',
                            resource: freeEvent,
                        });
                        console.log('evento creado entre eventos')
                    }

                }
            }

            return res.status(200).json('Eventos de formación insertados');
        } catch (error) {
            console.error('Error al verificar y agregar una siesta:', error);
            res.status(500).json('Error al verificar y agregar una siesta.', error);
        }
    }
}


module.exports = calendarController;