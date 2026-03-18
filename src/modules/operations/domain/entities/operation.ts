export class Operation {
  constructor(
    public readonly id: string,
    public date: Date,
    public label: string,
    public debit: number,
    public credit: number,
    public accountId: string = '',
    public userId: string,
    public notes?: string,
    public createdBy?: string,
    public updatedBy?: string,
  ) {}
}
