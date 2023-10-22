const { type } = require("os");
const Cliente = require("../ClienteModels/ClienteModels")
const fs = require("fs");

const ClienteCaixa ={


    getCliente: async (req, res) => {
        const Clientes = await Cliente.find();
        res.json(Clientes);
    },
    addCliente: async function (req, res) {
        
        const { name, lastname, age, street, city, postal_code, country, type1, type2, number, bank, balance, high_interest_client,manager } =
          req.body;
    
        const newCliente = new Cliente();
        newCliente.name = name,
        newCliente.lastname =  lastname,
        newCliente.age = age,
        newCliente.street = street,
        newCliente.city = city,
        newCliente.postal_code = postal_code,
        newCliente.country = country
        newCliente.type1 = type1,
        newCliente.number = number,
        newCliente.bank = bank,
        newCliente.type2 = type2,
        newCliente.balance = balance    
        newCliente.high_interest_client= high_interest_client,
        newCliente.manager = manager;

          
        console.log("New product:", newCliente);
        try {
          const saveCliente = await newCliente.save();
          res.json(saveCliente);
        } catch (error) {
          console.log("Error");
        }
        res.json();
      },

};
module.exports = ClienteCaixa;