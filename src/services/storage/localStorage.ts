export class StorageService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  public static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  public static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  public static clearAll() {
    localStorage.clear();
  }
}