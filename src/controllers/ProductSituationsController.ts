import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ProductSituation } from "../entity/ProductSituation";
import * as yup from "yup"; // Validados de formulários/campos
import { Not } from "typeorm";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/product-situations", verifyToken, async (req: Request, res: Response) => {
  try {
    const productSituationsRepository = AppDataSource.getRepository(ProductSituation);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;
    const totalRegisters = await productSituationsRepository.count();
    const lastPage = Math.ceil(totalRegisters / limit);
    const offset = (page - 1) * limit;

    if (totalRegisters === 0) {
      res.status(200).json({
        message: "Nenhum registro foi encontrado!",
      });

      return;
    }

    const productSituations = await productSituationsRepository.find({
      take: limit,
      skip: offset,
      order: { id: "DESC" },
    });

    res.status(200).json({
      currentPage: page,
      lastPage,
      totalRegisters,
      productSituations,
    });

    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar Situações de Produto",
    });

    return;
  }
});

router.get("/product-situations/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const productSituation = await productSituationRepository.findOneBy({ id: parseInt(id as string) });

    if (!productSituation) {
      res.status(404).json({
        message: "Situação de produto não encontrada!",
      });
      return;
    }

    res.status(200).json(productSituation);

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      maessage: "Erro ao consultar situação de produto!",
    });
  }
});

router.post("/product-situations", verifyToken, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const productSituationRepository = AppDataSource.getRepository(ProductSituation);

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome dever no te mínimo 3 caractes"),
    });

    await schema.validate(data, { abortEarly: false });

    const existRegister = await productSituationRepository.findOne({
      where: { name: data.name },
    });

    if (existRegister) {
      res.status(201).json({
        message: `Ja existe uma categoria de produto com o nome '${data.name}' cadastrada!`,
      });

      return;
    }

    const newProductSituation = productSituationRepository.create(data);

    await productSituationRepository.save(newProductSituation);

    // Retornar resposta de sucesso
    res.status(201).json({
      message: "Situação cadastrada com sucessso!",
      situation: newProductSituation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao cadastrar Situação de Produto",
    });
  }
});

router.put("/product-situations/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const productSituationsRepository = AppDataSource.getRepository(ProductSituation);
    const productSituation = await productSituationsRepository.findOneBy({ id: parseInt(id as string) });

    if (!productSituation) {
      res.status(404).json({
        message: "Situação de produto não encontradao!",
      });

      return;
    }

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
    });

    await schema.validate(data, { abortEarly: false });

    productSituationsRepository.merge(productSituation, data);

    const existingSituation = await productSituationsRepository.findOne({
      where: {
        name: data.name,
        id: Not(parseInt(id as string)),
      },
    });

    if (existingSituation) {
      res.status(400).json({
        message: `Ja existe uma categoria de produto com o nome '${data.name}' cadastrada!`,
      });
      return;
    }

    const updateProductSituation = await productSituationsRepository.save(productSituation);

    res.status(200).json({
      message: "Situação de produto editada com sucesso",
      updateProductSituation,
    });

    return;
  } catch (error) {
    res.status(500).json({
      error,
      message: "Erro ao editar situação de produto!",
    });
  }
});

router.delete("/product-situations/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productSituationRepository = AppDataSource.getRepository(ProductSituation);
    const productSituation = await productSituationRepository.findOneBy({ id: parseInt(id as string) });

    if (!productSituation) {
      res.status(404).json({
        message: "Situação de produto não encontrada!",
      });

      return;
    }

    const deleteProductSituation = await productSituationRepository.remove(productSituation);

    res.status(200).json({
      message: "Situação de produto deletada com sucesso!",
      deleteProductSituation,
    });

    return;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });

      return;
    }

    res.status(500).json({
      message: "Erro ao deletar Situação de Produto!",
    });
  }
});

// Exportar a instrução que está dentro da constante router
export default router;
