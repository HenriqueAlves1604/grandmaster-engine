import type { TimeControlRepositoryPort } from '../../domain/ports/TimeControlRepositoryPort.js';

export interface TimeControlResponseDTO {
  id: number;
  name: string;
  baseTimeSeconds: number;
  incrementSeconds: number;
}

export class ListTimeControlsUseCase {
  private timeControlRepository: TimeControlRepositoryPort;

  constructor(timeControlRepository: TimeControlRepositoryPort) {
    this.timeControlRepository = timeControlRepository;
  }

  /**
   * Retrieves all available time controls to be displayed in the lobby or tournament creation.
   */
  public async execute(): Promise<TimeControlResponseDTO[]> {
    const timeControls = await this.timeControlRepository.findAll();

    return timeControls.map((timeControl) => timeControl.getSnapshot());
  }
}
