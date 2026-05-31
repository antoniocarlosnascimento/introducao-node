import { AppDataSource } from "./data-source";
import CreateProductCategoriesSeed from "./seeds/CreateProductCategoriesSeed";
import CreateProductSituationsSeed from "./seeds/CreateProductSituationsSeed";
import CreateSituationsSeed from "./seeds/CreateSituationsSeed";
import CreateUsersSeed from "./seeds/CreateUsersSeed";
import CreateProductsSeed from "./seeds/CreateProductsSeed";

const runSeeds = async () => {
  console.log("Conectando ao bando de dados!");

  // Inicializa a conexão com o bando de dados
  await AppDataSource.initialize();
  console.log("Banco de dados conectado!");

  try {
    // Criar uma instancia das classes de seed
    const situationsSeed = new CreateSituationsSeed();
    const userCategoriesSeed = new CreateUsersSeed();
    const products = new CreateProductsSeed();
    const productSituationsSeed = new CreateProductSituationsSeed();
    const productCategoriesSeed = new CreateProductCategoriesSeed();

    // Executar as seeds
    await situationsSeed.run(AppDataSource);
    await userCategoriesSeed.run(AppDataSource);
    await productCategoriesSeed.run(AppDataSource);
    await productSituationsSeed.run(AppDataSource);
    await products.run(AppDataSource);
  } catch (error) {
    console.error("Erro ao executar o seed: ", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await AppDataSource.destroy();
    console.log("Conexão com o bando de dados encerrada");
  }
};

runSeeds();
