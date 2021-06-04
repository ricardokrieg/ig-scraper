export interface IProxyService {
  proxy: () => Promise<string>,
  reject: (proxy: string) => Promise<void>,
}

export interface IProxyResponse {
  address: string,
  check_at: number,
}
