require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const process = require('process');
const app = express()
app.use(express.json())

const authGoogleRouter = require("./routes/authGoogleRouter")
const calendarRouter = require("./routes/calendarRouter")
const taskRouter = require("./routes/taskRouter")
const gmailRouter = require("./routes/gmailRouter")
const ejecutarIntervalos = require('./intervals');
ejecutarIntervalos()


app.use("/auth", authGoogleRouter);
app.use("/calendar", calendarRouter);
app.use("/task", taskRouter);
app.use("/gmail", gmailRouter);

async function main() {
    return await mongoose.connect(process.env.CONNECTIONDB)
}

main()
    .then(() => console.log('Estamos conectados a la DB'))
    .catch(err => console.log(err))

const PORT = process.env.PORT
app.listen(PORT || `0.0.0.0:$PORT`, () => {
    console.log(`Backend de Reto CaixaBank Tech funcionando en el puerto`, PORT)
});

