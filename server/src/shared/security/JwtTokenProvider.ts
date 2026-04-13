import jwt from "jsonwebtoken";
import { UserRole } from "../../types/domain";

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export interface TokenProvider {
  generate(subject: string, role: UserRole): string;
  verify(token: string): TokenPayload;
}

export class JwtTokenProvider implements TokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  public generate(subject: string, role: UserRole): string {
    return jwt.sign({ sub: subject, role }, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  public verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
