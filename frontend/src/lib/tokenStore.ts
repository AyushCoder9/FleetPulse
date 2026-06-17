let _getToken: (() => Promise<string | null>) | null = null

export const tokenStore = {
  set(fn: () => Promise<string | null>) {
    _getToken = fn
  },
  async get(): Promise<string | null> {
    return _getToken ? _getToken() : null
  },
}
