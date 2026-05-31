import { DataSource } from "typeorm";
import { ProductSituation } from "../entity/ProductSituation";

export default class CreateProductSituationsSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const productSituationsRepository = dataSource.getRepository(ProductSituation);
    const existingCount = await productSituationsRepository.count();

    if (existingCount > 0) return;

    const productSituations = [
      {
        name: "Disponível",
      },
      {
        name: "Alugado",
      },
      {
        name: "Reservado",
      },
    ];

    await productSituationsRepository.save(productSituations);
  }
}
