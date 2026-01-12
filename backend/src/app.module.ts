import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './module/module.module';
import { QuizModule } from './quiz/quiz.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-db';
        Logger.log(`Connecting to MongoDB: ${uri}`, 'Database');
        
        return {
          uri,
          onConnectionCreate: (connection) => {
            Logger.log('MongoDB connected successfully', 'Database');
            return connection;
          },
        };
      },
    }),
    UserModule,
    AuthModule,
    CourseModule,
    ModuleModule,
    QuizModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}