import { promises as fs } from 'fs';
import * as path from 'path';
import { getDMMF } from '@prisma/internals';

const SCHEMA_PATH = path.join(__dirname, 'prisma', 'schema.prisma');
const OUTPUT_DIR = path.join(__dirname, 'src', 'generated');

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const generateService = (model) => `
import { Injectable } from '@nestjs/common';
import { Create${model}Dto } from './dto/create-${model.toLowerCase()}.dto';
import { Update${model}Dto } from './dto/update-${model.toLowerCase()}.dto';
import { validateSchema } from '@/utils/validateSchema';

@Injectable()
export class ${model}Service {
  async create(${model.toLowerCase()}: Create${model}Dto, user_id: string) {
    try {
      validateSchema(Create${model}Dto, user);
      // Add your create logic here
      return \`This action adds a new ${model.toLowerCase()}\`;
    } catch (error) {
      throw new Error(\`Failed to create ${model.toLowerCase()}: \${error.message}\`);
    }
  }

  async update(id: string, ${model.toLowerCase()}: Update${model}Dto, user_id: string) {
    try {
      validateSchema(Update${model}Dto, user);
      // Add your update logic here
      return \`This action updates a #\${id} ${model.toLowerCase()}\`;
    } catch (error) {
      throw new Error(\`Failed to update ${model.toLowerCase()}: \${error.message}\`);
    }
  }

  async findAll(user_id: string) {
    try {
      // Add your findAll logic here
      return \`This action returns all ${model.toLowerCase()}\`;
    } catch (error) {
      throw new Error(\`Failed to fetch ${model.toLowerCase()} records: \${error.message}\`);
    }
  }

  async findOne(id: string, user_id: string) {
    try {
      // Add your findOne logic here
      return \`This action returns a #\${id} ${model.toLowerCase()}\`;
    } catch (error) {
      throw new Error(\`Failed to fetch ${model.toLowerCase()} record: \${error.message}\`);
    }
  }

  async remove(id: string, user_id: string) {
    try {
      // Add your remove logic here
      return \`This action removes a #\${id} ${model.toLowerCase()}\`;
    } catch (error) {
      throw new Error(\`Failed to remove ${model.toLowerCase()}: \${error.message}\`);
    }
  }
}
`;

const generateModule = (model) => `
import { Module } from '@nestjs/common';
import { ${model}Service } from './${model.toLowerCase()}.service';

@Module({
  providers: [${model}Service],
  exports: [${model}Service],
})
export class ${model}Module {}
`;

const generateFiles = async () => {
  const dmmf = await getDMMF({ datamodel: await fs.readFile(SCHEMA_PATH, 'utf-8') });
  const models = dmmf.datamodel.models;

  for (const model of models) {
    const modelName = capitalizeFirstLetter(model.name);
    const modelDir = path.join(OUTPUT_DIR, modelName.toLowerCase());

    await fs.mkdir(modelDir, { recursive: true });

    // Generate Service file
    const serviceContent = generateService(modelName);
    await fs.writeFile(path.join(modelDir, `${modelName.toLowerCase()}.service.ts`), serviceContent);

    // Generate Module file
    const moduleContent = generateModule(modelName);
    await fs.writeFile(path.join(modelDir, `${modelName.toLowerCase()}.module.ts`), moduleContent);
  }
};

generateFiles()
  .then(() => console.log('Files generated successfully'))
  .catch((error) => console.error('Error generating files:', error));
