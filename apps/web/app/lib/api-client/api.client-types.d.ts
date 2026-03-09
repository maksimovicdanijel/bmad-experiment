export interface FullResponse<T, U extends number> {
  statusCode: U;
  headers: object;
  body: T;
}

export interface ApiClient {
  setBaseUrl(newUrl: string): void;
  setDefaultHeaders(headers: object): void;
  setDefaultFetchParams(fetchParams: RequestInit): void;
}
type PlatformaticFrontendClient = Omit<ApiClient, 'setBaseUrl'>;
type BuildOptions = {
  headers?: object;
};
export default function build(
  url: string,
  options?: BuildOptions,
): PlatformaticFrontendClient;
