import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductTable1778246719439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
          },
          {
            name: "price",
            type: "decimal",
          },
          {
            name: "productSituationId",
            type: "int",
          },
          {
            name: "productCategoryId",
            type: "int",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    // Criar chave estrangeira refenciando a tabela product_situations
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["productSituationId"],
        referencedTableName: "product_situations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    // Criar chave estrangeira refenciando a tabela product_categories
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["productCategoryId"],
        referencedTableName: "product_categories",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1º obter a tabela products
    const table = await queryRunner.getTable("products");

    // Remover as chaves primárias, se existir
    if (table) {
      const foreignKeySituation = table?.foreignKeys.find((fk) => fk.columnNames.includes("productSituationId"));
      const foreignKeyCategory = table?.foreignKeys.find((fk) => fk.columnNames.includes("productCategoryId"));

      if (foreignKeySituation) await queryRunner.dropForeignKey(table, foreignKeySituation);
      if (foreignKeyCategory) await queryRunner.dropForeignKey(table, foreignKeyCategory);
    }

    // 3º Remover a tabela
    if (table) await queryRunner.dropTable(table);
  }
}
