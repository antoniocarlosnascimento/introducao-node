import express, { Request, Response } from "express";
import * as yup from "yup";
import { AppDataSource } from "../data-source";

import { User } from "../entity/User";
import { json } from "node:stream/consumers";
import { PaginationService } from "../services/PaginationService";
import { Not } from "typeorm";
import bcrypt from "bcryptjs";

import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Req: o que eu estou recebendo na requisição
// Res: Resposta que eu vou retornar
router.get("/users", verifyToken, async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(userRepository, page, limit, { id: "DESC" }, ["situation"]);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Erro ao listar situações",
      error,
    });

    return;
  }
});

router.get("/users/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    // const user = await userRepository.findOneBy({ id: parseInt(id as string) });
    const user = await userRepository.findOne({
      relations: ["situation"],
      where: { id: parseInt(id as string) },
    });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });

      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erro ao encontrar registro de usuário",
      error,
    });

    return;
  }
});

router.post("/users", verifyToken, async (req: Request, res: Response) => {
  try {
    var data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
      password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no minimo 6 caracteres"),
      situation: yup.number().required("O campo situação é obrigatório"),
    });

    // data.password = await bcrypt.hash(data.password, 10);

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const existUser = await userRepository.findOne({
      where: { email: data.email },
    });

    if (existUser) {
      res.status(400).json({
        message: "Já existe um usuário cadastrado com esse email!",
      });

      return;
    }

    const newUser = userRepository.create(data);

    await userRepository.save(newUser);

    res.status(200).json({
      message: "Usuário cadastrado com sucesso!",
      user: newUser,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });

      return;
    }

    res.status(500).json({
      message: "Erro ao cadastrar usuário",
    });
  }
});

router.put("/users/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
      situation: yup.number().required("O campo situação é orbigatório"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: parseInt(id as string) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado",
      });

      return;
    }

    const existUser = await userRepository.findOne({
      where: {
        email: data.email,
        id: Not(parseInt(id as string)),
      },
    });

    if (existUser) {
      res.status(400).json({
        message: "Já existe um usuário cadastrado com esse email",
      });

      return;
    }

    userRepository.merge(user, data);
    const updateUser = await userRepository.save(user);

    res.status(200).json({
      message: "Usuário alterado com sucesso!",
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: "Erro ao editar usuário!",
    });
  }
});

router.delete("/users/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: parseInt(id as string) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });

      return;
    }

    await userRepository.remove(user);

    res.status(200).json({
      message: "Usuário deletado com sucesso!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao apagar a Usuário!",
    });
  }
});

router.put("/users-password/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const schema = yup.object().shape({
      password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no minimo 6 caracteres"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: parseInt(id as string) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });

      return;
    }

    // data.password = await bcrypt.hash(data.password, 10);

    userRepository.merge(user, data);
    const updateUser = await userRepository.save(user);

    res.status(200).json({
      message: "Senha do usuário alterada com sucesso!",
      user: updateUser,
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });

      return;
    }

    res.status(500).json({
      message: "Erro ao cadastrar usuário",
    });
  }
});

export default router;
