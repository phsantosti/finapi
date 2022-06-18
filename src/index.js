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
function getBalance(statement) {
   return statement.reduce((acumulator, operation) => {
      if (operation.type === 'credit') {
         return acumulator + operation.amount;
      } else {
         return acumulator - operation.amount;
      }
   }, 0);
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
app.put("/account", checkIfAccountExists, function (request, response){
   const { name } = request.body;
   const { customer } = request;
   customer.name = name;
   return response.status(201).send();
});
app.get("/account", checkIfAccountExists, function (request, response){
   const { customer } = request;
   return response.status(200).json(customer);
});
app.delete("/account", checkIfAccountExists, function (request, response){
   const { customer } = request;
   customers.splice(customer, 1);
   return response.status(200).json(customers);
});
app.get("/statement", checkIfAccountExists, function (request, response){
   const { customer } = request;
   return response.json(customer.statement);
});
app.get("/statement/date", checkIfAccountExists, function (request, response){
   const { customer } = request;
   const { date } = request.query;

   const formatedDate = new Date(date + " 00:00:00");
   const statement = customer.statement.filter((statement) => {
      return statement.created_at.toDateString() === new Date(formatedDate).toDateString();
   });

   return response.json(statement);
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
app.post("/withdraw", checkIfAccountExists, function (request, response){
   const { amount } = request.body;
   const { customer } = request;

   const balance = getBalance(customer.statement);
   if(balance < amount){
      return response.status(400).json({
         error: "Insuficient funds!"
      });
   } else {
      const statementOperation = {
         amount: amount,
         description: "Withdraw",
         created_at: new Date(),
         type: "debit"
      };

      customer.statement.push(statementOperation);
      return response.status(201).send();
   }
});
app.get("/balance", checkIfAccountExists, function (request, response){
   const { customer } = request;
   const balance = getBalance(customer.statement);
   return response.status(200).json({
      balance: balance
   });
});

app.listen(3333);