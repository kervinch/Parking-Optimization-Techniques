export class SlotModel {

  constructor(public id: number,
    public polNum: string,
    public pos: string,
    public block: string,
    public time: number,
    public isAvailable: boolean,
  public key?: string) {
  }

}
