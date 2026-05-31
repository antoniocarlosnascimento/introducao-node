import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnSlugToTableProducts1779368976118 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "slug",
        type: "varchar",
        isNullable: false,
        isUnique: true,
      }),
    );

    await queryRunner.query(`ALTER TABLE products MODIFY COLUMN slug varchar(255) AFTER name`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "slug");
  }
}
