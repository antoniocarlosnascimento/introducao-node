import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Situation } from "../entity/Situation";
import bcrypt from "bcryptjs";
import { subMonths } from "date-fns";

export default class CreateUsersSeed {
  public async run(dataSource: DataSource): Promise<void> {
    console.log("Iniciando o seed para a tabela 'users'....");

    // Obter o repositório da entidade 'User'
    const userRepository = dataSource.getRepository(User);
    const situationRepository = dataSource.getRepository(Situation);

    // Verificar se já existe registros na tabela
    const existingCount = await userRepository.count();

    const situation = await situationRepository.findOne({
      where: {
        id: 1,
      },
    });

    if (existingCount > 0) {
      console.log("A tabela 'user' já possui dados. Nenhuma alteração foi realizada!");
      return;
    }

    if (!situation) {
      console.error("Erro: nenhuma situação encontrada com ID 1. Verifique se a tabela 'situations' esta populada.");
      return;
    }

    const hashPassword = (pass: string): Promise<string> => bcrypt.hash(pass, 10);

    // Criar os usuer que devem ser cadastrados
    const users = [
      {
        id: 1,
        name: "Antonio Nascimento",
        email: "antonio.carlosnascimento@outlook.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 13),
        updatedAt: subMonths(new Date(), 13),
      },
      {
        id: 2,
        name: "Maria",
        email: "maria@maria.com.br",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 13),
        updatedAt: subMonths(new Date(), 13),
      },
      {
        id: 3,
        name: "Pedro",
        email: "pedro@pedro.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 12),
        updatedAt: subMonths(new Date(), 12),
      },
      {
        id: 4,
        name: "João Silva",
        email: "joao@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 11),
        updatedAt: subMonths(new Date(), 11),
      },
      {
        id: 5,
        name: "Ana Paula",
        email: "ana@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 10),
        updatedAt: subMonths(new Date(), 10),
      },
      {
        id: 6,
        name: "Carlos Eduardo",
        email: "carlos@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 10),
        updatedAt: subMonths(new Date(), 10),
      },
      {
        id: 7,
        name: "Fernanda Lima",
        email: "fernanda@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 10),
        updatedAt: subMonths(new Date(), 10),
      },
      {
        id: 8,
        name: "Lucas Oliveira",
        email: "lucas@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 10),
        updatedAt: subMonths(new Date(), 10),
      },
      {
        id: 9,
        name: "Juliana Costa",
        email: "juliana@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 6),
        updatedAt: subMonths(new Date(), 6),
      },
      {
        id: 10,
        name: "Ricardo Souza",
        email: "ricardo@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 5),
        updatedAt: subMonths(new Date(), 5),
      },
      {
        id: 11,
        name: "Camila Santos",
        email: "camila@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 4),
        updatedAt: subMonths(new Date(), 4),
      },
      {
        id: 12,
        name: "Gabriel Alves",
        email: "gabriel@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 3),
        updatedAt: subMonths(new Date(), 3),
      },
      {
        id: 13,
        name: "Beatriz Rocha",
        email: "beatriz@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 2),
        updatedAt: subMonths(new Date(), 2),
      },
      {
        id: 14,
        name: "Rafael Mendes",
        email: "rafael@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 2),
        updatedAt: subMonths(new Date(), 2),
      },
      {
        id: 15,
        name: "Patricia Gomes",
        email: "patricia@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 2),
        updatedAt: subMonths(new Date(), 2),
      },
      {
        id: 16,
        name: "Thiago Martins",
        email: "thiago@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: subMonths(new Date(), 1),
        updatedAt: subMonths(new Date(), 1),
      },
      {
        id: 17,
        name: "Larissa Ribeiro",
        email: "larissa@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 18,
        name: "Eduardo Carvalho",
        email: "eduardo@email.com",
        password: await hashPassword("123456"),
        situation: situation,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Salvar os registros no banco de dados
    await userRepository.save(users);

    console.log("Seed concluído com sucesso: Usuários cadastrados!");
  }
}
