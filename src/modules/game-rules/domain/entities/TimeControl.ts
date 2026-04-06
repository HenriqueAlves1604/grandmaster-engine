export interface TimeControlProps {
  id: number;
  name: string;
  baseTimeSeconds: number;
  incrementSeconds: number;
}

export class TimeControl {
  private readonly props: TimeControlProps;

  private constructor(props: TimeControlProps) {
    this.props = props;
  }

  /**
   * Reconstitutes a TimeControl entity from persistence or external boundaries.
   * Note: We do not have a generic 'create' method because time controls
   * are static domain concepts seeded by the system admin.
   */
  public static reconstitute(props: TimeControlProps): TimeControl {
    return new TimeControl(props);
  }

  public getSnapshot(): TimeControlProps {
    return {
      id: this.props.id,
      name: this.props.name,
      baseTimeSeconds: this.props.baseTimeSeconds,
      incrementSeconds: this.props.incrementSeconds,
    };
  }
}
