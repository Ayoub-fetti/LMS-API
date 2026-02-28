import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { seedAdmin } from './seeders/admin.seeder';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { DatabaseSeeder } from './seeders/database.seeder';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Create uploads directories if they don't exist
  const uploadsDir = join(__dirname, '..', 'uploads');
  const pdfsDir = join(uploadsDir, 'pdfs');
  const videosDir = join(uploadsDir, 'videos');

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  if (!existsSync(pdfsDir)) {
    mkdirSync(pdfsDir, { recursive: true });
  }
  if (!existsSync(videosDir)) {
    mkdirSync(videosDir, { recursive: true });
  }

  // Enable CORS
  app.enableCors({
    origin: true, // allow all origins for Azure (safer for deployment)
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 🔥 VERY IMPORTANT FOR AZURE
  const PORT = process.env.PORT || 3001;

  // 🚀 Start server FIRST
  await app.listen(PORT, '0.0.0.0');
  console.log(`🚀 API running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);

  // 🛢 Run seeding AFTER server is running
  try {
    const usersService = app.get(UsersService);
    const databaseSeeder = app.get(DatabaseSeeder);

    await seedAdmin(usersService);

    if (process.env.NODE_ENV === 'production') {
      await databaseSeeder.seed();
      console.log('✅ Database seeding completed');
    }
  } catch (error) {
    console.error('⚠️ Seeding skipped or failed:', error);
  }
}

bootstrap();