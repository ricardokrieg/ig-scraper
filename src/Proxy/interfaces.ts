export interface IProxyService {
  proxy: () => Promise<string>,
  reject: (proxy: string) => Promise<void>,
}
