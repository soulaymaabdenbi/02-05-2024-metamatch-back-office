export class Match {
  constructor(
    public _id?: string,
    public date?: Date,
    public time?: string,
    public location?: string,

    public teamA?: string,
    public teamB?: string
  ) {}
}
