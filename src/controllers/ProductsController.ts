import express, { Request, Response } from "express";
import * as yup from "yup";
import { AppDataSource } from "../data-source";
import slugify from "slugify";

import { PaginationService } from "../services/PaginationService";
import { Not } from "typeorm";
import { Product } from "../entity/Product";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/products", verifyToken, async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;

    const result = await PaginationService.paginate(productRepository, page, limit, { id: "DESC" }, ["situation", "category"]);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar produtos",
      error,
    });
  }
});

router.get("/products/latest", verifyToken, async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);

    const lastestProducts = await productRepository.find({
      take: 4,
      order: { id: "DESC" },
      relations: ["situation", "category"],
    });

    res.status(200).json(lastestProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar produtos",
      error,
    });
  }
});

router.get("/products/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      relations: ["situation", "category"],
      where: { id: parseInt(id as string) },
    });

    if (!product) {
      res.status(404).json({
        message: "Produto não encontrado!",
      });

      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erro ao procurar pelo produto",
      error,
    });

    return;
  }
});

router.post("/products", verifyToken, async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres").max(255, "O campo nome deve ter no máximo 255 caracteres!"),

      slug: yup.string().required("O campo slug é obrigatório!").min(3, "O campo slug deve ter no mínimo 3 caracteres!").max(255, "O campo slug deve ter no máximo 255 caracteres!"),

      description: yup.string().required("O campo descrição é obrigatório!").min(10, "A descrição deve ter pelo menos 10 caracteres!"),

      price: yup
        .number()
        .typeError("O preço deve ser um número!")
        .required("O campo preço é obrigatório!")
        .positive("O preço deve ser um valor positivo!")
        .test("is-decimal", "O preço deve ter no máximo duas casas decimais!", (value) => /^\d+(\.\d{1,2})?$/.test(value?.toString() || "")),

      situation: yup.number().typeError("A situação deve ser um número!").required("O campo situação é obrigatório!").integer("O campo situação deve ser um número inteiro!").positive("O campo situação deve ser um valor positivo!"),

      category: yup.number().typeError("A categoria deve ser um número!").required("O campo categoria é obrigatório!").integer("O campo categoria deve ser um número inteiro!").positive("O campo categoria deve ser um valor positivo!"),
    });

    data.slug = slugify(data.name, {
      lower: true,
      strict: true,
      locale: "pt",
      trim: true,
    });

    await schema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Product);

    const existProduct = await productRepository.findOne({
      where: { name: data.name },
    });

    if (existProduct) {
      res.status(400).json({
        message: "Já existe um produto cadastrado com este nome",
      });

      return;
    }

    const newProduct = productRepository.create(data);

    await productRepository.save(newProduct);

    res.status(200).json({
      message: "Produto cadastrado com sucesso!",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erro ao cadstrar produto!",
      error,
    });
  }
});

router.put("/products/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres").max(255, "O campo nome deve ter no máximo 255 caracteres!"),

      slug: yup.string().required("O campo slug é obrigatório!").min(3, "O campo slug deve ter no mínimo 3 caracteres!").max(255, "O campo slug deve ter no máximo 255 caracteres!"),

      description: yup.string().required("O campo descrição é obrigatório!").min(10, "A descrição deve ter pelo menos 10 caracteres!"),

      price: yup
        .number()
        .typeError("O preço deve ser um número!")
        .required("O campo preço é obrigatório!")
        .positive("O preço deve ser um valor positivo!")
        .test("is-decimal", "O preço deve ter no máximo duas casas decimais!", (value) => /^\d+(\.\d{1,2})?$/.test(value?.toString() || "")),

      situation: yup.number().typeError("A situação deve ser um número!").required("O campo situação é obrigatório!").integer("O campo situação deve ser um número inteiro!").positive("O campo situação deve ser um valor positivo!"),

      category: yup.number().typeError("A categoria deve ser um número!").required("O campo categoria é obrigatório!").integer("O campo categoria deve ser um número inteiro!").positive("O campo categoria deve ser um valor positivo!"),
    });

    data.slug = slugify(data.name, {
      lower: true,
      strict: true,
      locale: "pt",
      trim: true,
    });

    await schema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOneBy({ id: parseInt(id as string) });

    if (!product) {
      res.status(404).json({ message: "Produto não encontrado!" });

      return;
    }

    const existProduct = await productRepository.findOne({
      where: {
        name: data.name,
        id: Not(parseInt(id as string)),
      },
    });

    if (existProduct) {
      res.status(400).json({ message: "Já existe um produto cadastrado com este nome" });

      return;
    }

    productRepository.merge(product, data);
    const updateProduct = await productRepository.save(product);

    res.status(200).json({
      message: "Produto alterado com sucesso!",
      product: updateProduct,
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Erro ao editar usuário!",
    });
  }
});

router.delete("/products/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productRepository = AppDataSource.getRepository(Product);

    const product = await productRepository.findOneBy({ id: parseInt(id as string) });

    if (!product) {
      res.status(404).json({
        message: "Produto não encontrado1",
      });

      return;
    }

    await productRepository.remove(product);

    res.status(200).json({
      message: "Produto deletado com sucesso!",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao apagar a Usuário!",
    });
  }
});

export default router;
