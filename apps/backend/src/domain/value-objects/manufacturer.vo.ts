export class Manufacturer {
  constructor(
    public readonly name: string,
    public readonly country?: string,
    public readonly website?: string,
  ) {}

  toString(): string {
    return this.name;
  }
}
