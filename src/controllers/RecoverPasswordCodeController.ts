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

router.post("/recover-password-code", async (req: Request, res: Response) => {
  try {
    // Receber os dados enviados no cropo da requisição
    var data = req.body;

    const schema = yup.object().shape({
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ email: data.email });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });

      return;
    }

    // Gerar uma chave de 6 caracteres alfanuméricos
    const recoverPasswordCode = crypto.randomBytes(3).toString("hex"); // 2 byts = 6 caractéres hexadecimais
    user.recoverPasswordCode = recoverPasswordCode;

    await userRepository.save(user);

    // Criar a variável com as credênciais do servidor para enviar e-mail
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

    // Criar a variavel com o conteúdo do email
    const message_content = {
      from: process.env.EMAIL_FROM, // sender address
      to: data.email, // list of recipients
      subject: "Recuperar senha", // subject line
      text: `Prezado(a) ${user.name} \n\nVocê solicitou alteração de senha.\n\nPara recuperar a sua senha, use o código de verificação: ${recoverPasswordCode}\n\nSe você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.\n\nEsta mensagem foi enviada a você pela empresa ${process.env.APP}.\n\nVocê está recebendo porque está cadastrado no banco de dados da empresa ${process.env.APP}.Nenhum e-mail enviado pela empresa ${process.env.APP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n`, // Conteúdo do e-mail somente texto

      html: `Prezado(a) ${user.name} <br><br>Você solicitou alteração de senha.<br><br>Para recuperar a sua senha, use o código de verificação: ${recoverPasswordCode}<br><br>Se você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.<br><br>Esta mensagem foi enviada a você pela empresa ${process.env.APP}.<br><br>Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.APP}.Nenhum e-mail enviado pela empresa ${process.env.APP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>`, // HTML body
    };

    // Enviar o email
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

router.post("/validate-recover-password-code", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const schema = yup.object().shape({
      recoverPasswordCode: yup.string().required("A chave 'recoverPasswordCode' é obrigatória!"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ email: data.email });

    if (!user) {
      res.status(404).json({
        message: "Chave recuperar senha inválida!",
      });

      return;
    }

    // Verificar se a chave informada corresponde à chave armazenada no banco
    const isPasswordValidCode = await user.compareRecoverPasswordCode(data.recoverPasswordCode);

    if (!isPasswordValidCode) {
      res.status(400).json({
        message: "Código recuperar senha inválido!",
      });

      return;
    }

    res.status(200).json({
      message: "Chave recuperar senha válido",
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

router.put("/update-password-with-code", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const schema = yup.object().shape({
      recoverPasswordCode: yup.string().required("A chave 'recoverPasswordCode' é obrigatória!"),
      email: yup.string().email("E-mail inválido").required("O campo E-mail é obrigatório"),
      password: yup.string().required("O campo senha é obrigatório").min(6, "O campo senha deve ter no minimo 6 caracteres"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ email: data.email });

    if (!user) {
      res.status(404).json({
        message: "Email não encontrado!",
      });

      return;
    }

    // Verificar se a chave informada corresponde à chave armazenada no banco
    const isPasswordValidCode = await user.compareRecoverPasswordCode(data.recoverPasswordCode);

    if (!isPasswordValidCode) {
      res.status(400).json({
        message: "Código recuperar senha inválido!",
      });

      return;
    }

    data.recoverPasswordCode = null;
    userRepository.merge(user, data);
    await userRepository.save(user);

    res.status(200).json({
      message: "Senha alterada com sucesso!",
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
      message: "Erro ao editar senha!",
    });
  }
});

export default router;
