const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.MATLAS_USER}:${process.env.MATLAS_PASS}@cluster0.2hcski1.mongodb.net/`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.log(process.env.MATLAS_PASS)
    console.error('Error connecting to mongo el error es:', err)
  });

 
  module.exports = mongoose;
