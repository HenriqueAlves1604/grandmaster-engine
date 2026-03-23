import { ConflictError } from '@shared/errors/ConflictError.js';
import { randomUUID } from 'node:crypto';

export interface PlayerProps {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Player {
  private id: string;
  private username: string;
  private email: string;
  private passwordHash: string;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private constructor(props: PlayerProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  /**
   * Factory method to create a new Player in the system.
   * Generates a new UUID v4 and sets initial timestamps.
   */
  public static create(username: string, email: string, passwordHash: string): Player {
    const now = new Date();

    return new Player({
      id: randomUUID(),
      username,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /**
   * Factory method to reconstitute a Player from the database.
   */
  public static restore(props: PlayerProps): Player {
    return new Player(props);
  }

  /**
   * Performs a soft delete on the player entity.
   */
  public markAsDeleted(): void {
    if (this.deletedAt !== null) {
      throw new ConflictError('Player is already deleted.');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Exports the current state of the entity.
   * STRICTLY for persistence purposes (Repository) or serialization.
   * Does NOT break encapsulation because it returns a plain data copy, not a reference.
   */
  public getSnapshot(): PlayerProps {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
