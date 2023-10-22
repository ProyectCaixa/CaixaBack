const { type } = require("os");
const Cliente = require("../ClienteModels/ClienteModels")
const fs = require("fs");

const CitaCaixa ={

    addCitas: async function (req, res) {
        
        const { reason, description } =
          req.body;
    
        const newCita = new Cliente();
        newCita.reason = reason,
        newCita.description = description,

        console.log("New product:", newCita);
        try {
          const saveCita = await newCita.save();
          res.json(saveCita);
        } catch (error) {
          console.log("Error");
        }
        res.json();
      },

};
module.exports = CitaCaixa;