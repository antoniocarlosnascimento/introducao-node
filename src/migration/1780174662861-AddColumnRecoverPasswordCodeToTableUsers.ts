import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnRecoverPasswordCodeToTableUsers1780174662861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "recoverPasswordCode",
        type: "varchar",
        isNullable: true,
      }),
    );

    await queryRunner.query("ALTER TABLE users MODIFY COLUMN recoverPasswordCode varchar(255) AFTER recoverPassword");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "recoverPasswordCode");
  }
}
