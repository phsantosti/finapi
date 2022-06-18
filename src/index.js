const express = require('express');
const {v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

/**
 * Middleware
 */
function checkIfAccountExists(request, response, next){
   const { document } = request.headers;
   const customer = customers.find((customer) => {
      return customer.document === document;
   });
   if(!customer){
      return response.status(400).json({
         error: "Customer not found"
      });
   } else {
      request.customer = customer;
      return next();
   }
}


app.post("/account", function (request, response){
   const {name, document} = request.body;
   const id = uuidv4();

   const customerAlreadyExists = customers.some((customer) => {
      return customer.document === document;
   });

   if(customerAlreadyExists){
      return response.status(400).json({
         error: "Customer already exits!"
      });
   } else {
      customers.push({
         id: id,
         name: name,
         document: document,
         statement: []
      });

      return response.status(201).send();
   }
});

app.get("/statement", checkIfAccountExists, function (request, response){
   const { customer } = request;
   return response.json(customer.statement);
});
app.post("/deposit", checkIfAccountExists, function (request, response){
   const { amount, description } = request.body;
   const { customer } = request;

   const statementOperation = {
      amount: amount,
      description: description,
      created_at: new Date(),
      type: "credit"
   };

   customer.statement.push(statementOperation);
   return response.status(201).send();
});

app.listen(3333);