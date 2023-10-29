require('dotenv').config();
const express = require('express');
const process = require('process');
const app = express()
app.use(express.json())

const authGoogleRouter = require("./routes/authGoogleRouter")
const calendarRouter = require("./routes/calendarRouter")
// const clientRouter = require("./routes/clientRouter")
// const gestorRouter = require("./routes/gestorRouter")
const gmailRouter = require("./routes/gmailRouter")
const ejecutarIntervalos = require('./intervals');
ejecutarIntervalos()

app.use("/auth", authGoogleRouter);
app.use("/calendar", calendarRouter);
// app.use("/client", clientRouter);
// app.use("/gestor", gestorRouter);
app.use("/gmail", gmailRouter);

const PORT = process.env.PORT
app.listen(PORT || `0.0.0.0:$PORT`, () => {
    console.log(`Backend de Reto CaixaBank Tech funcionando en el puerto`, PORT)
});