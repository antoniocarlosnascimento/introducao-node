## Criar projeto

1º Criar o arquivo package.json
```
-> npm init
```

2º Instalar express para gerênciar as requisições, rotas e URLs, entre outras funcionalidades
```
-> https://expressjs.com/
-> npm install express --save
```

3º Instalar pacotes para suporte ao TypeScript
```
-> npm i --save-dev @types/express
-> npm i --save-dev @types/node
```

4º Instalar o compilador projeto com TypeScript e reiniciar o projeto quando o arquivo é modificado
```
-> npm i --save-dev ts-node
```

5º Gerar o arquivo de configuração para o TypeScript
```
-> npx tsc --init
```

6º Compilar o arquivo TypeScript
```
-> npx tsc
-> npx tsc -watch
```

7º Executar o arquivo gerado com Node.js
```
-> node dist/index.js
```

8º Instalar a dependência de forma global "-g" significa globalmente. Executar o comando através do prompt de comando,
executar somente se nunca instalou a dependêmcia na maquina, após instalar, reiniciar o PC. 
Configurar os arquivos: nodemon.json, tsconfig.json, package.json.
```
-> npm install -g nodemon
```

9º Compilar o arquivo TypeScript com Nodeman (Aqui já não precisa mais 6 e 7) - Agora fica tudo com o nodemon
```
-> npm run dev
```

9º Instalar a dependência para rodar processo simulataneamente (Instalar se for usar o compilador Watch)
```
-> npm install concurrently --save-dev
```

9º Compilar o arquivo TypeScript com Watch (Nativo) (Aqui já não precisa mais 6 e 7) - Agora fica tudo com o Watch
```
Aqui já inicia o watch e liga o servidor
-> npm run start:watch
```

10º Acessar o mySQL
```
-> mysql -h localhost -u root -p 

Comando powerShell p/ abrir MySQL
-> net start mysql80
```

## =======================
# Conectar API ao BD

11º Instalar a dependência para conectar o Node.js com (TypeScript) com banco de dados: 'https://typeorm.io/docs/getting-started'
```
-> npm install typeorm --save
```

12º Bliblioteca utilizada no TypeScript para adicionar metadados(informações adicionais) a classes.
```
-> npm install reflect-metadata --save
```

13º Instalar o driver do banco de dados MySQL: 'https://typeorm.io/docs/drivers/mysql#installation'
```
-> npm install mysql2 --save
```

14º Criar base de dados "introducao_node" 
```
CREATE DATABASE introducao_node CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
```

15º Criar o arquivo "data-source.ts" dentro de src (Ele vai receber o cód para receber a todas as configurações para fazer a conexão com BD)
```
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    synchronize: true,
    logging: true,
    entities: [Post, Category],
    subscribers: [],
    migrations: [],
});

* Add dir 'entity' dentro do dir 'src' (Represeta a models)
* Add dir 'entity' dentro do dir 'migration' 
* no tsconfig add: 'https://typeorm.io/docs/getting-started#typescript-configuration'
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",

*  Criar os models dentro de 'entity'
-> npx typeorm migration:create src/migration/<nome-da-migration>
-> npx typeorm migration:create src/migration/CriateSituationTable
** Definir as models (tabelas)**

* Executar as migrations para criar as tabelas no bando de dados
-> npx typeorm migration:run -d dist/data-source.js
```

16º Manipular variáveis de ambiente e o TypeScript = Instalar dotenv: 'https://www.npmjs.com/package/dotenv'
```
-> npm install dotenv --save
-> npm install --save-dev @types/dotenv 
```

17º Criar tabelas com migrations
```
```

17º Executar as seeds
```
node dist/run-seeds.js
```

18º Validação de dados/formulário (Lib: Yup) - https://www.npmjs.com/package/yup
```
-> npm i yup
```

19º Permitir requisições externas (Lib: cors) - https://www.npmjs.com/package/cors (add a link no index.ts)
```
-> npm i cors
-> npm install --save-dev @types/cors
```

20º Lib slug
-> npm install slugify

21º Criptografia de senha (https://www.npmjs.com/package/bcryptjs?activeTab=code)
-> npm i bcryptjs 
-> npm i --save-dev @types/bcryptjs

22º JWT - 'JSON Web Token' implementation (https://www.npmjs.com/package/jsonwebtoken)
22º Dependencia JWT para manipular token de autenticação.
-> npm i jsonwebtoken
-> npm i --save-dev @types/jsonwebtoken

23º Módulo para enviar emails (nodemailer) - (https://nodemailer.com/)
-> npm install nodemailer
-> npm i --save-dev @types/nodemailer

24º Manipular datas
-> npm install date-fns