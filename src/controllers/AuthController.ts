import express, { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import dotenv from "dotenv";
import * as yup from "yup";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import crypto from "crypto"; // Não precisa instalar nenhuma lib externa - é do próprio node
import nodemailer from "nodemailer"; // Lib de envio de email
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();
dotenv.config();

// Criar a rota para realizar o login
// Endereço para acessar a API através de aplicação externa com o verbo POST
// A aplicação externa deve indicar que esta enviando os dados em formado de objeto: Content-Type: application/json
// Dados em formato:
/*
{
  "email" : "email@email.com",
  "password" : ""
}
*/
router.post("/", async (req: Request, res: Response) => {
  try {
    // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    // await delay(3000);

    const { email, password } = req.body;

    // Validação se email, password vieram no corpo da requisição
    if (!email || !password) {
      res.status(400).json({
        message: "E-mail e senha são obrigatórios",
      });

      return;
    }

    // Criar uma instancia do serviço de autenticação
    const authService = new AuthService();

    const userData = await authService.login(email, password);

    // Retornar a resposta de sucesso com os dados do usuário autenticado!
    res.status(200).json({
      message: "Login bem sucedido!",
      user: userData,
    });

    return;
  } catch (error: any) {
    res.status(401).json({
      message: error.message,
    });

    return;
  }
});

// Criar a rota para validar o token
// Endereço para acessar a API através de aplicação externa com o verbo GET
// Envar o Bearer Token do usuário logado, exemplo: Bearer
// <colocar-o-token-gerado-com-jwt>
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Token válido",
    userId: (req as any).user.id, // ID do usuário Autenticado
  });
});

// Criar rota publica para cadastrar usuário
// Endereço para acessar a API através de aplicação externa com o verbo POST
// A aplicação externa deve indicar que esta enviando os dados em formado de objeto: Content-Type: application/json
// Dados em formato:
/*
{
  "name" : "",
  "email" : "",
  "password" : "",
  "situatin" : 1
}
*/

router.post("/new-user", async (req: Request, res: Response) => {
  try {
    var data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório").min(3, "O campo nome deve ter no minimo 3 caracteres"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
      password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no minimo 6 caracteres"),
      situation: yup.number().required("O campo situação é obrigatório"),
    });

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

// Criar a rota para recuperar senha
// Endereço para acessar a API através de aplicação externa com o verbo POST
// A aplicação externa deve indicar que esta enviando os dados em formado de objeto: Content-Type: application/json
// Dados em formato:
/*
{
  "urlRecoverPassword" : "htttp://localhost",
  "email" : "email@email.com"
}
*/
router.post("/recover-password", async (req: Request, res: Response) => {
  // res.send("Recuperar a senha");

  try {
    var data = req.body;

    const schema = yup.object().shape({
      urlRecoverPassword: yup.string().required("A URL é obrigatória"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ email: data.email });

    if (!user) {
      res.status(400).json({
        message: "Usuário não encontrado!",
      });

      return;
    }

    // Gerar um token seguro de 64 carcteres
    user.recoverPassword = crypto.randomBytes(32).toString("hex");

    await userRepository.save(user);

    // ======CONFIG E ENVIO DE EMAIL======
    // Para produção, envio de email para o destinatório corretamente, precisa de um servidor de email e passar as credencias do mesmo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message_content = {
      from: process.env.EMAIL_FROM, // sender address
      to: data.email, // list of recipients
      subject: "Recuperar senha", // subject line
      text: `Prezado(a) ${user.name}\n\n Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.\n\n
        Clique ou copie o link para criar uma nova senha em nosso sistema: \n\n
        ${data.urlRecoverPassword}?email=${data.email}&key=${user.recoverPassword}\n\n
        Esta mensagem foi enviada a você pela empresa ${process.env.APP}. \n\n
        Nenhum e-mail enviado pela empresa ${process.env.APP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n`, // plain text body
      html: `
        <b>Hello world?</b> <br/> 
        <a href="${data.urlRecoverPassword}?email=${data.email}&key=${user.recoverPassword}" target="_blank">
          ${data.urlRecoverPassword}?email=${data.email}&key=${user.recoverPassword}
        </a>
      `, // HTML body
    };

    transporter.sendMail(message_content, function (err) {
      if (err) {
        console.log(`Erro ao enviar email: ${err}`);
        res.status(200).json({
          message: `Email não enviado, tente novamente ou entre em contato: ${process.env.EMAIL_ADM}`,
        });

        return;
      } else {
        res.status(200).json({
          message: "E-mail enviado! Verifique sua caixa de entrada.",
          urlRecoverPassword: `${data.urlRecoverPassword}?email=${data.email}&key=${user.recoverPassword}`,
          key: user.recoverPassword,
        });

        return;
      }
    });
    // ============

    return;
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

// Criar a rota para validar a chave recuperar senha
// Endereço para acessar a API através de aplicação externa com o verbo POST
// A aplicação externa deve indicar que esta enviando os dados em formado de objeto: Content-Type: application/json
/*
{
  "recoverPassword" : "chave-recuperar-senha(key)",
  "email" : "email@email.com"
}
*/
router.post("/validate-recover-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const schema = yup.object().shape({
      recoverPassword: yup.string().required("A chave 'recoverPassword' é obrigatória!"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      email: data.email,
      recoverPassword: data.recoverPassword,
    });

    if (!user) {
      res.status(404).json({
        message: "Chave recuperar senha ou email inválido(s)",
      });

      return;
    }

    res.status(200).json({
      message: "Chave recuperar senha válida!",
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
      message: "Chave recuperar senha inválida ou expirada!",
    });
  }
});

// Criar a rota para atualizar a senha
// Endereço para acessar a API através de aplicação externa com o verbo PUT
// A aplicação externa deve indicar que esta enviando os dados em formado de objeto: Content-Type: application/json
/*
{
  "recoverPassword" : "chave-recuperar-senha(key)",
  "email" : "email@email.com",
  "password" : "123456"
}
*/
router.put("/update-password", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const schema = yup.object().shape({
      recoverPassword: yup.string().required("A chave 'recoverPassword' é obrigatória!"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
      password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no minimo 6 caracteres"),
    });

    // data.password = await bcrypt.hash(data.password, 10);

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      email: data.email,
      recoverPassword: data.recoverPassword,
    });

    if (!user) {
      res.status(404).json({
        message: "Chave recuperar senha ou email inválido(s)",
      });

      return;
    }

    // data.password = await bcrypt.hash(data.password, 10);
    data.recoverPassword = null;

    userRepository.merge(user, data);
    await userRepository.save(user);

    res.status(200).json({
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });

      return;
    }

    res.status(500).json({
      message: "Erro ao editar senha!",
    });
  }
});

export default router;
