import { string } from "yup";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Método para auentericar um usuário com e-amil e senha
   * @param email - E-mail do usuário
   * @param password - Senha do usuário
   * @returns Ddos do usuário autenticado
   * @throws Erro caso as credenciais sejam inválidas
   */

  async login(email: string, password: string): Promise<{ id: number; name: string; email: string; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new Error("Email não encontrado!");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Usuário ou senha inválidos!");
    }

    // Gerar um token JWT para o usuário autenticado
    // O token inclui o ID do usuário e expira em 7 dias
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    // Retornar os dados do usuário junto com o token gerado
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }
}
