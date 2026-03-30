export class Budget {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly month: string,      // YYYY-MM
    public readonly category: string,
    public readonly amount: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
