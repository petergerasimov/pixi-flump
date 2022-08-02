import {QueueItem} from "./QueueItem";
import {Queue} from "./Queue";

export class AnimationQueue extends Queue {
  protected frame:number = 0;

  /**
	 * Will stop
	 * @property _freeze
	 * @type {boolean}
	 */
  private _freeze:boolean = false;
  private _hasStopped:boolean = false;

  protected _time:number = 0;
  protected _fpms:number = 0;

  constructor(fps:number, unit:number = 1000) {
    super();
    this._fpms = unit / fps;
  }

  public onTick(delta:number):void {
    const time = this._time += delta;

    if ((this.current != null || this.next() != null) ) {
      const current = this.current;
      const from = current.from;
      const duration = current.duration;
      const times = current.times;
      const frame = (duration * time / (duration * this._fpms));

      if (times > -1 && times - (frame / duration) < 0) {
        this.next();
      } else {
        this.frame = from + (frame % duration);
      }
    }
  }

  public hasStopped():boolean {
    return !this.current && !this.hasNext();
  }

  public next():QueueItem {
    const next = super.next();
    if (next) {
      this.reset();
    }
    return next;
  }

  public getFrame():number {
    return this.frame;
  }

  protected reset():void {
    this._freeze = false;
    this._time = this._time % this._fpms;
  }
}


