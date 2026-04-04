import crypto from 'node:crypto';

export interface RefreshTokenProps {
  id: string;
  token: string;
  playerId: string;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken {
  private props: RefreshTokenProps;

  private constructor(props: RefreshTokenProps) {
    this.props = props;
  }

  public static create(playerId: string, expiresInDays: number = 7): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return new RefreshToken({
      id: crypto.randomUUID(),
      token: crypto.randomBytes(40).toString('hex'),
      playerId,
      expiresAt,
      createdAt: new Date(),
    });
  }

  public static restore(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public getSnapshot(): RefreshTokenProps {
    return { ...this.props };
  }
}
