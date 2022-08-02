import {IKeyframe} from "../interface/ILibrary";

export class KeyframeData {
  index:number;
  duration:number;
  label:string;
  ref:string;

  x:number;
  y:number;
  scaleX:number;
  scaleY:number;
  skewX:number;
  skewY:number;
  pivotX:number;
  pivotY:number;

  visible:boolean;
  alpha:number;

  tweened:boolean;

  ease:number;

  constructor(json:IKeyframe|Array<any>) {
    if (json instanceof Array) {
      this.fromArray(<Array<any>> json);
    } else {
      const jsonObject = <IKeyframe> json;
      this.index = jsonObject.index;
      this.duration = jsonObject.duration;
      this.ref = "ref" in jsonObject ? jsonObject.ref : null;
      this.label = "label" in jsonObject ? jsonObject.label : null;
      this.x = "loc" in jsonObject ? jsonObject.loc[0] : 0.0;
      this.y = "loc" in jsonObject ? jsonObject.loc[1] : 0.0;
      this.scaleX = "scale" in jsonObject ? jsonObject.scale[0] : 1.0;
      this.scaleY = "scale" in jsonObject ? jsonObject.scale[1] : 1.0;
      this.skewX = "skew" in jsonObject ? jsonObject.skew[0] : 0.0;
      this.skewY = "skew" in jsonObject ? jsonObject.skew[1] : 0.0;
      this.pivotX = "pivot" in jsonObject ? jsonObject.pivot[0] : 0.0;
      this.pivotY = "pivot" in jsonObject ? jsonObject.pivot[1] : 0.0;
      this.visible = "visible" in jsonObject ? jsonObject.visible : true;
      this.alpha = "alpha" in jsonObject ? jsonObject.alpha : 1.0;
      this.tweened = "tweened" in jsonObject ? jsonObject.tweened : true;
      this.ease = "ease" in jsonObject ? jsonObject.ease : 0.0;
    }
  }


  public getValueOrder() {
    return [
      "index",
      "duration",
      "ref",
      "label",
      "x", "y",
      "scaleX", "scaleY",
      "skewX", "skewY",
      "pivotX", "pivotY",
      "visible",
      "alpha",
      "tweened",
      "ease",
    ];
  }

  public toArray() {
    const order = this.getValueOrder();
    const data = new Array(order.length);
    for (let i = 0; i < order.length; i++) {
      const name = order[i];
      data[i] = this[name];
    }

    return data;
  }

  public fromArray(data) {
    const order = this.getValueOrder();
    for (let i = 0; i < data.length; i++) {
      const name = order[i];
      const value = data[i];

      this[name] = value;
    }
  }

  public copyNotDefined(keyframe:KeyframeData):void {
    const order = this.getValueOrder();
    const data = keyframe.toArray();
    for (let i = 0; i < data.length; i++) {
      const name = order[i];
      const value = data[i];

      if (this[name] == void 0 && value != void 0 ) {
        this[name] = value;
      }
    }
  }
}

