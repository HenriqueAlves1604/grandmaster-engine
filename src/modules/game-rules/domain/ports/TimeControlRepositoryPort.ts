import type { TimeControl } from '../entities/TimeControl.js';

export interface TimeControlRepositoryPort {
  findAll(): Promise<TimeControl[]>;
  findById(id: number): Promise<TimeControl | null>;
}
