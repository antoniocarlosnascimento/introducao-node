import { DataSource } from "typeorm";
import { Situation } from "../entity/Situation";

export default class CreateSituationsSeed {
  public async run(dataSource: DataSource): Promise<void> {
    console.log("Iniciando o seed para a tabela 'situations'....");

    // Obter o repositório da entidade 'Situation's
    const situationRepository = dataSource.getRepository(Situation);

    // Verificar se já existe registros na tabela
    const existingCount = await situationRepository.count();

    if (existingCount > 0) {
      console.log("A tabela 'situations' já possui dados. Nenhuma alteração foi realizada!");
      return;
    }

    // Criar as situações que devem ser cadastradas
    const situations = [
      {
        id: 1,
        nameSituation: "Ativo",
      },
      {
        id: 2,
        nameSituation: "Inativo",
      },
      {
        id: 3,
        nameSituation: "Pendente",
      },
    ];

    // Salvar os registros no banco de dados
    await situationRepository.save(situations);

    console.log("Seed concluído com sucesso: situações cadastradas!");
  }
}
