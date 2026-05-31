import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source"; // Importar a conexão com o  banco de dados
import { ProductCategory } from "../entity/ProductCategory";
import { PaginationService } from "../services/PaginationService";
import * as yup from "yup"; // Validados de formulários/campos
import { Not } from "typeorm";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/product-categories", verifyToken, async (req: Request, res: Response) => {
  try {
    const productsCategoryRepository = AppDataSource.getRepository(ProductCategory);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(productsCategoryRepository, page, limit);

    res.status(200).json(result);

    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar categorias de produto",
    });

    return;
  }
});

router.get("/product-categories/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    const productCategory = await productCategoryRepository.findOneBy({ id: parseInt(id as string) });

    if (!productCategory) {
      res.status(404).json({
        message: "Categoria de produto não encontrada!",
      });

      return;
    }

    res.status(200).json(productCategory);

    return;
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erro ao procurar por Categoria de produto!",
    });
  }
});

router.post("/product-categories", verifyToken, async (req: Request, res: Response) => {
  try {
    // data Request
    const data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome dever no te mínimo 3 caractes"),
    });

    await schema.validate(data, { abortEarly: false });

    // Repository
    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);

    // Recuperar registro com where
    const existRegister = await productCategoryRepository.findOne({
      where: { name: data.name },
    });

    // Valida o registro enviado já existe/cadastrado
    if (existRegister) {
      res.status(201).json({
        message: `Ja existe uma categoria de produto com o nome '${data.name}' cadastrada!`,
      });

      return;
    }

    // Create
    const newProductCategory = productCategoryRepository.create(data);

    // Save
    await productCategoryRepository.save(newProductCategory);

    res.status(201).json({
      message: "Categoria de produto cadastrada com sucesso",
      category: newProductCategory,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });

      return;
    }
    res.status(500).json({
      message: "Erro ao cadastrar categoria para produtos",
    });
  }
});

router.put("/product-categories/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);
    const productCategory = await productCategoryRepository.findOneBy({ id: parseInt(id as string) });

    if (!productCategory) {
      res.status(404).json({
        message: "Categoria de produto não encontrado!",
      });

      return;
    }

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
    });

    await schema.validate(data, { abortEarly: false });

    const existingSituation = await productCategoryRepository.findOne({
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

    productCategoryRepository.merge(productCategory, data);
    const updateProductCategory = await productCategoryRepository.save(productCategory);

    res.status(200).json({
      message: "Categoria de produto alterada com sucesso!",
      updateProductCategory,
    });

    return;
  } catch (error) {
    res.status(500).json({
      error,
      message: "Erro ao editar categoria de produto!",
    });
  }
});

router.delete("/product-categories/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productCategoryRepository = AppDataSource.getRepository(ProductCategory);
    const productCategory = await productCategoryRepository.findOneBy({ id: parseInt(id as string) });

    if (!productCategory) {
      res.status(404).json({
        message: "Categoria de produto não encontrada!",
      });

      return;
    }

    const deleteCategoryProduct = await productCategoryRepository.remove(productCategory);

    res.status(200).json({
      message: "Categoria de produto delatada com sucessso!",
      deleteCategoryProduct,
    });

    return;
  } catch (error) {
    res.status(500).json({
      message: "Não foi possível deletar a categoria de produto!",
    });
  }
});

export default router;
