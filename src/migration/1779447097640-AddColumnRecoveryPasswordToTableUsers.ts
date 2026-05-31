import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { string } from "yup";

export class AddColumnRecoveryPasswordToTableUsers1779447097640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "recoverPassword",
        type: "varchar",
        isUnique: true,
        isNullable: true,
      }),
    );

    await queryRunner.query(`ALTER TABLE users MODIFY COLUMN recoverPassword varchar(255) AFTER password`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "recoverPassword");
  }
}
