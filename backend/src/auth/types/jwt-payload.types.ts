export interface JwtPayload extends Record<string, unknown> {
  sub: number;
  name: string;
}
