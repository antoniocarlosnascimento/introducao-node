import { Repository, ObjectLiteral, FindOptionsOrder } from "typeorm";

// Definir uma interface para o resultado da paginação, que será genérica e adaptável a qualquer tipo de entidade
interface PaginationResult<T> {
  //<T> Qualquer tipo a definir depois, Ex: type Situation, type: Product, type: ProductCategory, etc...
  // Resumo <T> ===> Tipo genérico
  error: boolean;
  data: T[]; // O 'data' será um array de qualquer tipo que você definir
  currentPage: number;
  lastPage: number;
  totalRecords: number;
  relations?: string[]; // Permite pessar relações como um array de strings
}

export class PaginationService {
  // Método estático que realiza a paginação em qualquer Repositório(Entidade) genérico
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    page: number = 1,
    limit: number = 10,
    order: FindOptionsOrder<T> = {},
    relations?: string[], // Receber os relacinamentos como um array de strings
  ): Promise<PaginationResult<T>> {
    // Conta o total de registros no repositório para determinar a quantidade total de páginas
    const totalRecords = await repository.count();

    // Calcular o número da última página baseado no total de registros e no limite de registros por pagina
    const lastPage = Math.ceil(totalRecords / limit);

    // Verificar se a página solicitada é valida; se não for, lança um erro
    if (page > lastPage && lastPage > 0) {
      throw new Error(`Pagina inválida. Total de paginas: ${lastPage}`);
    }

    // Calcula o "offset" que é o indice do primeiro registro que deve ser retornado na pagina atual
    const offset = (page - 1) * limit;

    // Buscar os registros do repositório com base no limit, offset e ordem de classificação
    const data = await repository.find({
      take: limit,
      skip: offset,
      order,
      relations, // Usar os relacionamento passados dinamicamente
    });

    // Retorna o reultado da paginação em um formato estruturado (interface: PaginationResult)
    return {
      error: false,
      data,
      currentPage: page,
      lastPage,
      totalRecords,
    };
  }
}

// Método static = não precisa ser instanciado (new) === Sem "new"! Você chama direto pelo nome da Classe.
