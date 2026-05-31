import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  user?: { id: number };
}

/**
 * Middleware interface Request para receber o id do usuário
 * @param req - Objeto da requisição
 * @param res - Objeto da resposta
 * @param next - Função para passar o controle para o próximo middleware
 */

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  // Obter o token do cabeçalho da requisição
  const authHeader = req.headers.authorization;

  // Verificar se o cabeçalho contém um token
  if (!authHeader) {
    res.status(401).json({
      message: "Necessário realizar o login para acessar esta página!",
    });

    return;
  }

  // Separar o token do prefixo "Bearer"
  const [bearer, token] = authHeader.split(" ");

  // Verificar se o token foi fornecido corretamente
  if (!token || bearer.toLocaleLowerCase() !== "bearer") {
    res.status(401).json({
      message: "Token inválido!",
    });

    return;
  }

  try {
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

    // Atribuir o ID do usuário autenticado à requisição para uso posterior
    req.user = { id: decoded.id };

    // Passar o controle para a próxima função na rota
    next();
  } catch (error) {
    res.status(401).json({
      message: "Token inválido ou expirado!",
    });

    return;
  }
}
