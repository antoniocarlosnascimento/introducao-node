import express, { Request, Response } from "express";

const router = express.Router();

router.get("/test-connection", (req: Request, res: Response) => {
  // send = Retornar mensagem
  res.status(200).json({
    message: "Conexão com a API realizada com sucesso!",
  });
});

// Exportat a instrução dentro da contante router
export default router;
