const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    lastname: String,
    age: String,
    high_interest_client: Boolean,
    address: {
      street: String,
      city: String,
      postal_code: String,
      country: String
    },
    phones: [
      {
        type: String,
        number: String
      },
    ],
    bank_accounts: [
      {
        bank: String,
        type: String,
        balance: String,
        manager: String
      },
    
    ],
    appointment: [
        {
        reason: String,
        description : String}
      ]

 }
);

module.exports = mongoose.model("User", UserSchema);
