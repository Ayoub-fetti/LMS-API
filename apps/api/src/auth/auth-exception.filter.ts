import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch(
  UnauthorizedException,
  ForbiddenException,
  TokenExpiredError,
  JsonWebTokenError,
)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 401;
    let message = "Erreur d'authentification";

    if (exception instanceof TokenExpiredError) {
      message = 'Token expiré';
    } else if (exception instanceof JsonWebTokenError) {
      message = 'Token invalide';
    } else if (exception instanceof ForbiddenException) {
      status = 403;
      message = 'Accès refusé';
    } else if (exception.message?.includes('expiré')) {
      message = 'Token expiré';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
