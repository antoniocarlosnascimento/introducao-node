import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CriateUsersTable1778005324478 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
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
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "situationId",
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

    // Criar a chave estrangeira
    await queryRunner.createForeignKey(
      "users",
      new TableForeignKey({
        columnNames: ["situationId"],
        referencedTableName: "situations",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1º obter a tabela products
    const table = await queryRunner.getTable("users");

    // 1º Remover a chave estrangeira
    if (table) {
      const foreignKeySituation = table?.foreignKeys.find((fk) => fk.columnNames.includes("situationId"));
      if (foreignKeySituation) await queryRunner.dropForeignKey(table, foreignKeySituation);
    }

    // 2º Remover a tabela
    await queryRunner.dropTable("users");
  }
}
