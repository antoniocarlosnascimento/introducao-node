import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { Situation } from "./Situation";
import bcrypt from "bcryptjs";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  recoverPassword!: string;

  @Column({ unique: true })
  recoverPasswordCode!: string;

  // Relacionamento ManyToOne de com a tabala situations
  // Muitos User podem ter apenas 1 categoria (ManyToOne)
  @ManyToOne(() => Situation, (situation) => situation.users)
  @JoinColumn({
    name: "situationId", // Nome da chave estrangeira
  })
  situation!: Situation; // situation recebe o que vem da entidade 'Situation'

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  // Método para comparar a senha informada pelo usuário com a senha armazenada no banco de dados
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método
  @BeforeInsert() // Executa o método antes de inserir um novo usuário
  @BeforeUpdate() // Executa o método antes de atualizar um usuário existente
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Método
  @BeforeInsert() // Executa o método antes de inserir um novo usuário
  @BeforeUpdate() // Executa o método antes de atualizar um usuário existente
  async hashRecoverPasswordCode(): Promise<void> {
    // Verificar se a chave está definida e a criptografa antes de salvar no banco.
    if (this.recoverPasswordCode) {
      this.recoverPasswordCode = await bcrypt.hash(this.recoverPasswordCode, 10);
    }
  }

  // Método para comparar a chave informada pelo usuário com a chave armazenada no banco de dados.
  async compareRecoverPasswordCode(recoverPasswordCode: string): Promise<boolean> {
    // Compara a chave enviada pela requisição com a chave criptografada no banco de dados
    return bcrypt.compare(recoverPasswordCode, this.recoverPasswordCode);
  }
}
