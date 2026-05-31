import { DataSource } from "typeorm";
import { ProductCategory } from "../entity/ProductCategory";

export default class CreateProductCategoriesSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const productCategoryRepository = dataSource.getRepository(ProductCategory);
    const existingCount = await productCategoryRepository.count();

    if (existingCount > 0) return;

    const productsCategories = [
      {
        name: "Apartamento",
      },
      {
        name: "Casa",
      },
      {
        name: "Loja",
      },
    ];

    await productCategoryRepository.save(productsCategories);
  }
}
