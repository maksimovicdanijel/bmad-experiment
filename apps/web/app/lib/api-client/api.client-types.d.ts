export interface FullResponse<T, U extends number> {
  statusCode: U;
  headers: object;
  body: T;
}

type StatusCode4xx =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451;
type StatusCode5xx =
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;

export type GetTodosRequest = {};

/**
 * Default Response
 */
export type GetTodosResponseOK = {
  data: Array<{
    id: string;
    text: string;
    isCompleted: boolean;
    createdAt: string;
  }>;
};
/**
 * Default Response
 */
export type GetTodos4XXResponse = { error: { code: string; message: string } };
/**
 * Default Response
 */
export type GetTodos5XXResponse = { error: { code: string; message: string } };
export type GetTodosResponses =
  | FullResponse<GetTodosResponseOK, 200>
  | FullResponse<GetTodos4XXResponse, StatusCode4xx>
  | FullResponse<GetTodos5XXResponse, StatusCode5xx>;

export interface ApiClient {
  setBaseUrl(newUrl: string): void;
  setDefaultHeaders(headers: object): void;
  setDefaultFetchParams(fetchParams: RequestInit): void;
  /**
   * @param req - request parameters object
   * @returns the API response
   */
  getTodos(req: GetTodosRequest): Promise<GetTodosResponses>;
}
type PlatformaticFrontendClient = Omit<ApiClient, 'setBaseUrl'>;
type BuildOptions = {
  headers?: object;
};
export default function build(
  url: string,
  options?: BuildOptions,
): PlatformaticFrontendClient;
