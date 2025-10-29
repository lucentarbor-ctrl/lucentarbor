/**
 * API Response Utilities
 * 모든 API 엔드포인트에서 사용할 표준화된 응답 포맷
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  status: 'success';
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    skip?: number;
  };
}

export interface ApiErrorResponse {
  status: 'error';
  error: string;
  message: string;
  details?: any;
  statusCode: number;
}

/**
 * 성공 응답 생성
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    meta?: ApiSuccessResponse['meta'];
    status?: number;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    status: 'success',
    data,
  };

  if (options?.message) {
    response.message = options.message;
  }

  if (options?.meta) {
    response.meta = options.meta;
  }

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * 에러 응답 생성
 */
export function errorResponse(
  error: string,
  options?: {
    message?: string;
    details?: any;
    statusCode?: number;
  }
): NextResponse<ApiErrorResponse> {
  const statusCode = options?.statusCode || 500;

  const response: ApiErrorResponse = {
    status: 'error',
    error,
    message: options?.message || 'An error occurred',
    statusCode,
  };

  if (options?.details) {
    response.details = options.details;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * 데이터베이스 에러 처리
 */
export function handleDatabaseError(error: any): NextResponse<ApiErrorResponse> {
  console.error('Database Error:', error);

  // Prisma 에러 코드 처리
  if (error.code === 'P2002') {
    return errorResponse('DUPLICATE_ERROR', {
      message: 'A record with this value already exists',
      statusCode: 409,
      details: { field: error.meta?.target },
    });
  }

  if (error.code === 'P2025') {
    return errorResponse('NOT_FOUND', {
      message: 'Record not found',
      statusCode: 404,
    });
  }

  return errorResponse('DATABASE_ERROR', {
    message: 'Database operation failed',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

/**
 * 유효성 검증 에러 처리
 */
export function validationError(
  message: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return errorResponse('VALIDATION_ERROR', {
    message,
    statusCode: 400,
    details,
  });
}

/**
 * 권한 에러 처리
 */
export function unauthorizedError(
  message: string = 'Unauthorized'
): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', {
    message,
    statusCode: 401,
  });
}

/**
 * 금지된 작업 에러 처리
 */
export function forbiddenError(
  message: string = 'Forbidden'
): NextResponse<ApiErrorResponse> {
  return errorResponse('FORBIDDEN', {
    message,
    statusCode: 403,
  });
}

/**
 * 찾을 수 없음 에러 처리
 */
export function notFoundError(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', {
    message: `${resource} not found`,
    statusCode: 404,
  });
}

/**
 * 서버 에러 처리
 */
export function serverError(
  error: any,
  message?: string
): NextResponse<ApiErrorResponse> {
  console.error('Server Error:', error);

  return errorResponse('SERVER_ERROR', {
    message: message || 'Internal server error',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

/**
 * 외부 API 에러 처리
 */
export function externalApiError(
  service: string,
  error: any
): NextResponse<ApiErrorResponse> {
  console.error(`External API Error (${service}):`, error);

  return errorResponse('EXTERNAL_API_ERROR', {
    message: `Failed to connect to ${service}`,
    statusCode: 502,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}
