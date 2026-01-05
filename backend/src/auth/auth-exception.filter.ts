import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: status === 401 ? 'Token invalide ou expiré' : 'Accès refusé',
    };

    response.status(status).json(errorResponse);
  }
}
