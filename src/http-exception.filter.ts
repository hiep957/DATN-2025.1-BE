import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    console.log("ĐI qua đây")
    // Lấy message chi tiết nếu là mảng (ValidationPipe trả ra mảng)
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || exception.message
        : exception.message;

    response
      .status(status)
      .json({
        message: message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
