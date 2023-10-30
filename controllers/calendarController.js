const { google } = require('googleapis');
const authManager = require('./authManager');
const { DateTime } = require('luxon');


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
                    maxResults: 12,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                const events = response.data.items;

                if (!events || events.length === 0) {
                    console.log('No upcoming events found.');
                    return res.status(404).json('No upcoming events found.');
                }

                const upcomingEvents = events.map((event) => ({
                    start: DateTime.fromISO(event.start.dateTime || event.start.date)
                        .toLocal()
                        .toFormat('yyyy-MM-dd HH:mm:ss'),
                    summary: event.summary,
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

        // const checkSlot = async (datestart) => {
        //     let currentStart = new Date(datestart);

        //     const events = await calendar.events.list({
        //         calendarId: 'primary',
        //         timeMin: currentStart.toLocaleString(),
        //         timeMax: new Date(currentStart.getTime() + 3600000).toLocaleString(),
        //         maxResults: 1,
        //     });

        //     if (events.data.items.length > 0) {

        //         currentStart.setHours(currentStart.getHours() + 1);
        //         return await checkSlot(currentStart);
        //     } else {

        //         if (
        //             currentStart.getHours() < 8 ||
        //             currentStart.getHours() >= 18 ||
        //             currentStart.getDay() === 0 ||
        //             currentStart.getDay() === 6
        //         ) {

        //             currentStart.setHours(8);
        //             if (currentStart.getDay() === 0) {
        //                 currentStart.setDate(currentStart.getDate() + 1);
        //             } else if (currentStart.getDay() === 6) {
        //                 currentStart.setDate(currentStart.getDate() + 2);
        //             }
        //         }
        //     }

        //     return currentStart;
        // };

        try {
            //     let availableSlot = await checkSlot(start);
            //     console.log('soy la fehca', availableSlot)

            //     const result = await calendar.events.list({
            //         calendarId: 'primary',
            //         timeMin: availableSlot,
            //         maxResults: 1,
            //     });
            //     if (result.data.items.length > 0) {
            //         availableSlot = await checkSlot(availableSlot);
            //         console.log('Nuevo hueco encontrado', availableSlot);
            //     }

            //     event.start.dateTime = availableSlot.toLocaleString();
            //     const endDate = new Date(availableSlot);
            //     endDate.setHours(endDate.getHours() + 1);
            //     event.end.dateTime = endDate.toLocaleString();

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
            const startTime = new Date(now);
            startTime.setHours(8, 0, 0, 0);

            const endTime = new Date(now);
            endTime.setHours(18, 0, 0, 0);

            // Consulta para obtener eventos entre las 08:00 y las 18:00
            const events = await calendar.events.list({
                auth,
                calendarId: 'primary',
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
            });
            console.log('eventos del dia', events)

            if (events.data.items.length > 0) {
                // Encuentra un hueco entre los eventos
                let siestaStartTime = new Date(startTime); // Inicializa con la hora de inicio de la franja horaria
                let siestaEndTime;

                for (let i = 0; i < events.data.items.length; i++) {
                    const eventStartTime = new Date(events.data.items[i].start.dateTime);
                    const eventEndTime = new Date(events.data.items[i].end.dateTime);

                    // Calcula la duración del espacio libre entre eventos
                    const spaceDuration = eventStartTime - siestaStartTime;

                    if (spaceDuration >= 30 * 60 * 1000) {
                        // Si el espacio entre eventos es de al menos 30 minutos, programa "siesta" aquí
                        siestaEndTime = new Date(siestaStartTime.getTime() + spaceDuration);

                        const event = {
                            summary: 'siesta',
                            description: 'Tiempo para una siesta',
                            start: {
                                dateTime: siestaStartTime.toISOString(),
                            },
                            end: {
                                dateTime: siestaEndTime.toISOString(),
                            },
                        };

                        await calendar.events.insert({
                            auth,
                            calendarId: 'primary',
                            resource: event,
                        });

                        return res.status(200).json('Se ha programado una siesta entre los eventos existentes.');
                    }

                    // Establece el tiempo de inicio de "siesta" para el próximo posible espacio libre
                    siestaStartTime = new Date(eventEndTime);
                }
            }

            // Si no se encontró un hueco entre eventos, programar "siesta" al final de la franja horaria.
            const event = {
                summary: 'siesta',
                description: 'Tiempo para una siesta',
                start: {
                    dateTime: endTime.toISOString(),
                },
                end: {
                    dateTime: new Date(endTime.getTime() + 30 * 60 * 1000).toISOString(),
                },
            };

            await calendar.events.insert({
                auth,
                calendarId: 'primary',
                resource: event,
            });

            return res.status(200).json('Se ha programado una siesta al final de la franja horaria.');
        } catch (error) {
            console.error('Error al verificar y agregar una siesta:', error);
            res.status(500).json('Error al verificar y agregar una siesta.', error);
        }
    }



}


module.exports = calendarController;