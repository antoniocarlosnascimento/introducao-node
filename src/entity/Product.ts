import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductCategory } from "./ProductCategory";
import { ProductSituation } from "./ProductSituation";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ unique: true })
  slug!: string;

  @ManyToOne(() => ProductSituation, (productSituation) => productSituation.products)
  @JoinColumn({
    name: "productSituationId", // Nome da chave estrangeira
  })
  situation!: ProductSituation; // situation = recebe o que vem da entidade ProductSituation

  @ManyToOne(() => ProductCategory, (productCategory) => productCategory.products)
  @JoinColumn({
    name: "productCategoryId", // Nome da chave estrangeira
  })
  category!: ProductCategory; // category = o que vem da entidade ProductCategory

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
}
