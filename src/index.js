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

   customers.push({
      id: id,
      name: name,
      document: document,
      statement: []
   });

   return response.status(201).send();
});

app.listen(3333);