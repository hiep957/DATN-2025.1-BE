// typeorm-exception.filter.ts
import {
  ArgumentsHost, Catch, ExceptionFilter, HttpStatus
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

function dbCode(e: any) {
  return e?.driverError?.code ?? e?.code;
}
function isUnique(e: any) {
  const c = dbCode(e);
  return c === '23505' || c === 'ER_DUP_ENTRY' || c === 1062 || c === 'SQLITE_CONSTRAINT_UNIQUE';
}
function constraintName(e: any) {
  return e?.driverError?.constraint ?? '';
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { driverError?: any }, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();

    // Unique violation -> 409
    if (isUnique(exception)) {
      const name = constraintName(exception);
      const detail = exception?.driverError?.detail || '';
      const msg =
        name === 'UQ_product_color_size' || detail.includes('UQ_product_color_size')
          ? 'Đã tồn tại biến thể với cùng (product, color, size).'
          : 'Giá trị đã tồn tại (unique constraint).';

      return res.status(HttpStatus.CONFLICT).json({
        message: msg,
        statusCode: HttpStatus.CONFLICT,
        timestamp: new Date().toISOString(),
        path: req.url,
        // detail: detail, // để debug; cân nhắc bỏ ở production
      });
    }

    // Fallback: 500
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Database error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
