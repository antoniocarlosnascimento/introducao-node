import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Product } from "../entity/Product";
import { verifyToken } from "../middlewares/authMiddleware";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const router = express.Router();

// Req: o que eu estou recebendo na requisição
// Res: Resposta que eu vou retornar
router.get("/users-report", verifyToken, async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Criar um array com os ultimos 12 meses no formato 'YYYY-MM'
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return {
        key: format(date, "yyyy-MM"), // Chave no formato YYY-MM
        label: format(date, "MMM", { locale: ptBR }).replace(".", ""), //  Nome do mês abreviado
      };
    });

    // Buscae a quantidade de usuários cadastrados agrupados por mês e ano
    const result = await userRepository
      .createQueryBuilder("user")
      .select([`DATE_FORMAT(user.createdAt, '%Y-%m') AS month`, `COUNT(user.id) AS users`])
      // Filtra os registros para considerar usuários criador a partir da data inícial
      .where("user.createdAt > :startDate", { startDate: months[0].key + "-01" }) // Primeiro dia do mês
      .groupBy("month") // Agrupa os registros pelo mês formatado (YYYY-MM)
      .orderBy("month", "ASC") // Ordena os resultados de forma crescente (ASC) pelo mês
      .getRawMany(); // Executa a consulta e retorna os resultados como um array de objetos

    const resultMap = new Map(result.map((resul) => [resul.month, parseInt(resul.users, 10)]));
    const finalResult = months.map(({ key, label }) => ({
      month: label, // Nome do mês abreviado
      users: resultMap.get(key) || 0,
    }));

    res.status(200).json(finalResult);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar situações",
      error,
    });

    return;
  }
});

router.get("/products-report", verifyToken, async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);

    // Criar um array com os ultimos 12 meses no formato 'YYYY-MM'
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return {
        key: format(date, "yyyy-MM"), // Chave no formato YYY-MM
        label: format(date, "MMM", { locale: ptBR }).replace(".", ""), //  Nome do mês abreviado
      };
    });

    // Buscae a quantidade de usuários cadastrados agrupados por mês e ano
    const result = await productRepository
      .createQueryBuilder("product")
      .select([`DATE_FORMAT(product.createdAt, '%Y-%m') AS month`, `COUNT(product.id) AS products`])
      // Filtra os registros para considerar usuários criador a partir da data inícial
      .where("product.createdAt > :startDate", { startDate: months[0].key + "-01" }) // Primeiro dia do mês
      .groupBy("month") // Agrupa os registros pelo mês formatado (YYYY-MM)
      .orderBy("month", "ASC") // Ordena os resultados de forma crescente (ASC) pelo mês
      .getRawMany(); // Executa a consulta e retorna os resultados como um array de objetos

    const resultMap = new Map(result.map((resul) => [resul.month, parseInt(resul.products, 10)]));
    const finalResult = months.map(({ key, label }) => ({
      month: label, // Nome do mês abreviado
      products: resultMap.get(key) || 0,
    }));

    res.status(200).json(finalResult);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar situações",
      error,
    });

    return;
  }
});

export default router;
