import express from "express";
import dotenv from "dotenv";
// Incluir as CONTROLLERS
import TestConnectionController from "./controllers/TestConnectionController";
import SituationController from "./controllers/SituationController";
import UsersController from "./controllers/UsersController";
import AuthController from "./controllers/AuthController";
import ProductSituationsController from "./controllers/ProductSituationsController";
import ProductCategoriesController from "./controllers/ProductCategoriesController";
import ProductsController from "./controllers/ProductsController";
import ReportsController from "./controllers/ReportsController";
import RecoverPasswordCodeController from "./controllers/RecoverPasswordCodeController";

import cors from "cors"; // Importar a biblioteca para permitir conexão/requisições externas

// Carrega as variaveis de ambiente
dotenv.config();
const app = express();
const port = process.env.PORT;

// Criar o middleware para receber os dados da API no corpo da requisição
app.use(express.json());

// Criar o middleware para permitir requisição externa
app.use(cors());

// Criar as rotas
app.use("/", TestConnectionController);
app.use("/", UsersController);
app.use("/", SituationController);
app.use("/", AuthController);
app.use("/", ProductSituationsController);
app.use("/", ProductCategoriesController);
app.use("/", ProductsController);
app.use("/", ReportsController);
app.use("/", RecoverPasswordCodeController);

app.listen(port, () => {
  console.log(`Servidor iniciado na porta: ${port} http://localhost:${port}`);
});
