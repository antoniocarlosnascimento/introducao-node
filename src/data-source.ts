import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Situation } from "./entity/Situation";
import { User } from "./entity/User";
import { ProductSituation } from "./entity/ProductSituation";
import { ProductCategory } from "./entity/ProductCategory";
import { Product } from "./entity/Product";

// Carrega as variaveis de ambiente
dotenv.config();

const dialect = process.env.DB_DIALECT ?? "mysql";

export const AppDataSource = new DataSource({
  type: dialect as "mysql" | "mariadb",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [Situation, User, ProductSituation, ProductCategory, Product],
  subscribers: [],
  migrations: [__dirname + "/migration/*.js"],
});

// INICIALIZAR A CONEXÃO COM O BANCO DE DADOS
AppDataSource.initialize()
  .then(() => {
    console.log("acessou");
  })
  .catch((error) => {
    console.log(error);
  });
