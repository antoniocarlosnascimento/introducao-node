import express, { Request, Response } from "express";
import * as yup from "yup"; // Validados de formulários/campos

// Importar a conexão com o  banco de dados
import { AppDataSource } from "../data-source";

// Importar a entidade
import { Situation } from "../entity/Situation";
import { json } from "node:stream/consumers";
import { PaginationService } from "../services/PaginationService";
import { Not } from "typeorm";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/situations", verifyToken, async (req: Request, res: Response) => {
  // Parametros na URL page, limit
  try {
    const situaionRepository = AppDataSource.getRepository(Situation); // Obter repositório da Entidade Situation
    const page = Number(req.query.page) || 1; // Receber o número da página e definir página 1 como padrão // ?=page ===> var na URL
    const limit = Number(req.query.limit) || 10; // Definir o limite de registros por página

    // Usar o serviço de paginação
    // const result = await PaginationService.paginate(situaionRepository, page, limit);
    const result = await PaginationService.paginate(situaionRepository, page, limit, { id: "DESC" });

    // Retornar a resposta com os dados e informações da paginação
    res.status(200).json(result);

    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar situações",
    });

    return;
  }
});

router.get("/situations/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    try {
      // Desistruturação - recuperou apanas o :id
      const { id } = req.params;

      // Obter o repositório da entidade Situation
      const situationRepository = AppDataSource.getRepository(Situation);

      // Buscara sutuação no banco de dados pelo { id }
      const situation = await situationRepository.findOneBy({ id: parseInt(id as string) });

      // Verificar se a situação foi encontrada
      if (!situation) {
        res.status(404).json({
          message: "Situação não encontrada!",
        });

        return;
      }
      // Retornar a situação encontrada
      res.status(200).json(situation);

      return;
    } catch (error) {}
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao encontrar situação",
    });

    return;
  }
});

router.post("/situations", verifyToken, async (req: Request, res: Response) => {
  // res.send("Cadastrar situação");

  // console.log(req.body);

  try {
    // Receber os dados enviados no corpo da requisição
    var data = req.body;

    // Validar os dados utilizando o yup
    const schema = yup.object().shape({
      nameSituation: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
    });

    // Verifica se os dados passaram pela validação
    await schema.validate(data, { abortEarly: false }); // Se a validação não passar, ja vai para o catch (Preenchendo 'errors' com as mensagens de erros definidos na const 'schema')

    // Criar uma instancia do repositório de Situation
    const situationRepository = AppDataSource.getRepository(Situation);

    // Criar um novo registro no BD de situação (Dados simulados)
    // const newSituation = situationRepository.create({
    //   nameSituation: "Ativo",
    // });

    // Recuperar o registro do banco de dados com o valor da coluna nameSituation
    const existingSituation = await situationRepository.findOne({
      where: { nameSituation: data.nameSituation },
    });

    // Verifica se já existe uma situação com o mesmo nome
    if (existingSituation) {
      res.status(201).json({
        message: `Ja existe uma situação com o nome '${data.nameSituation}' cadastrada!`,
      });
      return;
    }

    const newSituation = situationRepository.create(data);

    // Salvar registro no BD
    await situationRepository.save(newSituation);

    // Retornar resposta de sucesso
    res.status(201).json({
      message: "Situação cadastrada com sucessso!",
      situation: newSituation,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      // Retorna os erros da validação
      res.status(400).json({
        message: error.errors,
      });

      return;
    }
    res.status(500).json({
      message: "Erro ao cadastrar a situação!",
    });
  }
});

router.put("/situations/:id", verifyToken, async (req: Request, res: Response) => {
  // res.send("Editar");

  try {
    // Obter o ID da situação a partir dos parametros da requisição
    const { id } = req.params;

    // Recebedos os dados enviados no corpo da requisição
    const data = req.body;

    // Validar os dados utilizando o yup
    const schema = yup.object().shape({
      nameSituation: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
    });

    // Verifica se os dados passaram pela validação
    await schema.validate(data, { abortEarly: false }); // Se a validação não passar, ja vai para o catch (Preenchendo 'errors' com as mensagens de erros definidos na const 'schema')

    // Obter o repositório da entidade Situation
    const situationRepository = AppDataSource.getRepository(Situation);

    // Buscar  a situação no banco de dados pelo ID
    const situation = await situationRepository.findOneBy({ id: parseInt(id as string) });

    // Verificar se a situação foi encontrada
    if (!situation) {
      res.status(404).json({
        message: "Situação não encontrada!",
      });
      return;
    }

    // Pesquisa por nameSituation com o mesmo ome passado no body
    const existingSituation = await situationRepository.findOne({
      where: {
        nameSituation: data.nameSituation,
        id: Not(parseInt(id as string)),
      },
    });

    // Verifica se já existe uma situação com o mesmo nome
    if (existingSituation) {
      res.status(400).json({
        message: `Ja existe uma situação com o nome '${data.nameSituation}' cadastrada!`,
      });
      return;
    }

    // Atualizar os dados da situação
    situationRepository.merge(situation, data);

    // Salvar as alterações no bando de dados
    const updateSituation = await situationRepository.save(situation);

    // Retornar resposta de sucesso
    res.status(200).json({
      message: "Situação alterada com sucesso",
      situation: updateSituation,
    });

    return;
  } catch (error) {
    res.status(500).json({
      error,
      message: "Erro ao editar situação!",
    });
  }
});

router.delete("/situations/:id", verifyToken, async (req: Request, res: Response) => {
  // res.send("Deleteeee");

  res.status(200).json({
    message: "Situação deletada com sucesso!",
  });

  try {
    // Obter o ID da situação a partir dos parametros da requisição
    const { id } = req.params;

    // Obter o repositório da entidade Situation
    const situationRespository = AppDataSource.getRepository(Situation);

    // Buscar a situação no bando de dados pelo ID
    const situation = await situationRespository.findOneBy({ id: parseInt(id as string) });

    // Verificar se a situação foi encontrada
    if (!situation) {
      res.status(404).json({
        message: "Situação nao encontrada!",
      });

      return;
    }

    await situationRespository.remove(situation);

    res.status(200).json({
      message: "Situação deletada com sucesso!",
      situation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao apagar a situação!",
    });
  }
});

// Exportat a instrução dentro da contante router
export default router;
