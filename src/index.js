const express = require('express');
const {v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];
/**
 * document = string,
 * name = string
 * id = uid,
 * statement = []
 */
app.post("/account", (request, response) => {
   const {name, document} = request.body;
   const id = uuidv4();

   const customerAlreadyExists = customers.some((customer) => {
      return customer.document === document;
   });

   if(customerAlreadyExists){
      return response.status(400).json({
         success: false,
         title: "Oops!",
         messsage: "Customer already exits!"
      });
   } else {
      customers.push({
         id: id,
         name: name,
         document: document,
         statement: []
      });

      return response.status(201).json(customers);
   }
});

app.listen(3333);