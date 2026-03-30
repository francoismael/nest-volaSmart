export enum AccountType {
  CAISSE = 'caisse',
  BANQUE = 'banque',
  NOURRITURE = 'nourriture',
  SALAIRE = 'salaire',
  TRANSPORT = 'transport',
  INVESTISSEMENT = 'investissement',
  AUTRE = 'autre',
}

export class Account {
  constructor(
    public readonly id: string,
    public name: string,
    public type: AccountType,
    public userId: string,
    public description?: string,
  ) {}
}
