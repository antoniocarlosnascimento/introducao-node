import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("situations")
export class Situation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nameSituation!: string;

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

  // Situation = 1 para N (OneToMany) = 1 Situação pode ter vários Users
  // 1:N
  @OneToMany(() => User, (user) => user.situation)
  users!: User[];
}
