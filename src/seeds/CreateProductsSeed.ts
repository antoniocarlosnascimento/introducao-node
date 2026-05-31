import { DataSource } from "typeorm";
import { Product } from "../entity/Product";
import { ProductCategory } from "../entity/ProductCategory";
import { ProductSituation } from "../entity/ProductSituation";
import slugify from "slugify";
import { subMonths } from "date-fns";

export default class CreateProductsSeed {
  public async run(dataSource: DataSource): Promise<void> {
    console.log("Inciando o seed para a tabela produtos...");

    const productRepository = dataSource.getRepository(Product);
    const productCategoryRepository = dataSource.getRepository(ProductCategory);
    const productSituationRepository = dataSource.getRepository(ProductSituation);

    const existingRegisterProducts = await productRepository.count();
    const productCategory = await productCategoryRepository.findOne({ where: { id: 1 } });
    const productSituation = await productSituationRepository.findOne({ where: { id: 1 } });

    const nameToSlug = (name: string): string => {
      return slugify(name, {
        lower: true,
        strict: true,
        locale: "pt",
        trim: true,
      });
    };

    if (existingRegisterProducts) {
      console.log("A tabele 'produtos' já possui dados cadastrados. Nenhuma alteração foi realizada!");
      return;
    }

    if (!productCategory) {
      console.error("Erro: nenhuma categoria de produto foi encontrada com ID 1. Verifique se a tabela 'product_categories' esta populada.");
      return;
    }

    if (!productSituation) {
      console.error("Erro: nenhuma situação de produto foi encontrada com ID 1. Verifique se a tabela 'product_situations' esta populada.");
      return;
    }

    const products = [
      {
        id: 1,
        name: "Casa com piscina",
        slug: nameToSlug("Casa com piscina"),
        description: "Casa com piscina 3 quartos e 2 suites",
        price: 50000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 11),
        updatedAt: subMonths(new Date(), 11),
      },
      {
        id: 2,
        name: "Apartamento centro",
        slug: nameToSlug("Apartamento centro"),
        description: "Apartamento no centro da cidade, 3 quartos, 2 cozinhas, 2 suites, churrasqueira",
        price: 750000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 11),
        updatedAt: subMonths(new Date(), 11),
      },
      {
        id: 3,
        name: "Clubinho com piscina e area gourmet",
        slug: nameToSlug("Clubinho com piscina e area gourmet"),
        description: "Area goutmet com 2 piscinas, 2 areas gourmet, 4 banheiros, 2 suites",
        price: 350000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 9),
        updatedAt: subMonths(new Date(), 9),
      },
      {
        id: 4,
        name: "Terreno em condomínio fechado",
        slug: nameToSlug("Terreno em condomínio fechado"),
        description: "Lote plano com 360m², excelente localização interna e segurança 24h",
        price: 180000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 9), // Repetido do id 3
        updatedAt: subMonths(new Date(), 9),
      },
      {
        id: 5,
        name: "Cobertura duplex com vista mar",
        slug: nameToSlug("Cobertura duplex com vista mar"),
        description: "Cobertura alto padrão com 4 suítes, piscina privativa e 3 vagas de garagem",
        price: 2450000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 6),
        updatedAt: subMonths(new Date(), 6),
      },
      {
        id: 6,
        name: "Chácara semi urbana",
        slug: nameToSlug("Chácara semi urbana"),
        description: "Chácara de 2000m² com pomar formado, casa sede com varanda e poço artesiano",
        price: 420000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 6), // Repetido do id 5
        updatedAt: subMonths(new Date(), 6),
      },
      {
        id: 7,
        name: "Sobrado residencial moderno",
        slug: nameToSlug("Sobrado residencial moderno"),
        description: "Sobrado com acabamento em porcelanato, 3 dormitórios (1 suíte) e conceito aberto",
        price: 580000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 4),
        updatedAt: subMonths(new Date(), 4),
      },
      {
        id: 8,
        name: "Sala comercial na avenida",
        slug: nameToSlug("Sala comercial na avenida"),
        description: "Sala com 45m², divisórias prontas, ar condicionado e 1 vaga rotativa",
        price: 210000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 3),
        updatedAt: subMonths(new Date(), 3),
      },
      {
        id: 9,
        name: "Studio mobiliado próximo à faculdade",
        slug: nameToSlug("Studio mobiliado próximo à faculdade"),
        description: "Studio compacto ideal para investidores, totalmente decorado e equipado",
        price: 290000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 3), // Repetido do id 8
        updatedAt: subMonths(new Date(), 3),
      },
      {
        id: 10,
        name: "Casa térrea condomínio",
        slug: nameToSlug("Casa térrea condomínio"),
        description: "Casa nova com pé direito duplo, 3 suítes, área gourmet integrada e quintal",
        price: 920000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 1),
        updatedAt: subMonths(new Date(), 1),
      },
      {
        id: 11,
        name: "Galpão industrial para logística",
        slug: nameToSlug("Galpão industrial para logística"),
        description: "Galpão com 1200m² de área construída, pé direito de 8m e plataforma de carga",
        price: 3800000,
        situation: productSituation,
        category: productCategory,
        createdAt: subMonths(new Date(), 1), // Repetido do id 10
        updatedAt: subMonths(new Date(), 1),
      },
      {
        id: 12,
        name: "Penthouse com varanda gourmet",
        slug: nameToSlug("Penthouse com varanda gourmet"),
        description: "Apartamento exclusivo ocupando andar inteiro, vista 360 graus da cidade",
        price: 1650000,
        situation: productSituation,
        category: productCategory,
        createdAt: new Date(), // Mês atual
        updatedAt: new Date(),
      },
    ];

    await productRepository.save(products);

    console.log("Seed concluído com sucesso: Produtos cadastrados!");
  }
}
