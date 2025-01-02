import { handleApiError, AppError } from '../errors';

describe('Error Handling', () => {
  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 'TEST_ERROR', { foo: 'bar' });
    const result = handleApiError(error);
    
    expect(result).toEqual({
      code: 'TEST_ERROR',
      message: 'Test error',
      details: { foo: 'bar' },
    });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');
    const result = handleApiError(error);
    
    expect(result).toEqual({
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error',
    });
  });

  it('should handle non-error objects', () => {
    const result = handleApiError('string error');
    
    expect(result).toEqual({
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    });
  });
});
