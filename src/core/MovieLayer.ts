import * as PIXI from "pixi.js";

import {IHashMap} from "../interface/IHashMap";
import {FlumpMovie} from "./FlumpMovie";
import {FlumpLibrary} from "../FlumpLibrary";
import {LayerData} from "../data/LayerData";
import {LabelData} from "../data/LabelData";
import {KeyframeData} from "../data/KeyframeData";

export class MovieLayer extends PIXI.Container {
  public name:string = "";

  private _frame:number = 0;

  protected _index:number;
  protected _movie:FlumpMovie;
  protected _layerData:LayerData;
  protected _symbol:FlumpMovie|PIXI.Sprite;
  protected _symbols:IHashMap<FlumpMovie|PIXI.Sprite> = {};

  // disable layer from code
  public enabled:boolean = true;

  // public _storedMtx = new FlumpMtx(1, 0, 0, 1, 0, 0);

  constructor(index:number, movie:FlumpMovie, library:FlumpLibrary, layerData:LayerData) {
    super();

    const keyframeData = layerData.keyframeData;

    this._index = index;
    this._movie = movie;
    this._layerData = layerData;
    this.name = layerData.name;

    for (let i = 0; i < keyframeData.length; i++) {
      const keyframe = keyframeData[i];

      if (keyframe.label) {
        movie.setLabel(keyframe.label, new LabelData(keyframe.label, keyframe.index, keyframe.duration));
      }

      if (( ( <any> keyframe.ref) != -1 && ( <any> keyframe.ref) != null) && ( keyframe.ref in this._symbols ) == false) {
        this._symbols[keyframe.ref] = library.createSymbol(keyframe.ref, false);
      }
    }

    this.setFrame(0);
  }

  public getSymbol(name:string):FlumpMovie {
    const symbols = this._symbols;
    for (const symbol of Object.values(symbols)) {
      if (symbol instanceof FlumpMovie) {
        if (symbol.name == name) {
          return symbol;
        } else {
          const data = symbol.getSymbol(name);

          if (data != null) {
            return data;
          }
        }
      }
    }

    return null;
  }

  public replaceSymbol(name:string, item:FlumpMovie|PIXI.Sprite):boolean {
    const symbols = this._symbols;
    for (const val of Object.keys(symbols)) {
      const symbol = symbols[val];

      if (symbol.name == name) {
        this._symbols[val] = <FlumpMovie|PIXI.Sprite> item;
        return true;
      } else if (symbol instanceof FlumpMovie && symbol.replaceSymbol(name, item)) {
        return true;
      }
    }

    return false;
  }


  public onTick(delta:number, accumulated:number):void {
    if (this._symbol != null && (this._symbol instanceof FlumpMovie)) {
      ( <FlumpMovie> this._symbol ).onTick(delta, accumulated);
    }
  }

  public setFrame(frame:number):boolean {
    const keyframe:KeyframeData = this._layerData.getKeyframeForFrame(Math.floor(frame));

    if (( <any> keyframe.ref ) != -1 && ( <any> keyframe.ref ) != null) {
      if (this._symbol != this._symbols[keyframe.ref]) {
        this.removeChildren();

        this._symbol = this._symbols[keyframe.ref];

        if (this._symbol instanceof FlumpMovie) {
          ( <FlumpMovie> this._symbol).reset();
        }

        this.addChild(this._symbol);
      }

      this.setKeyframeData(this._symbol, keyframe, frame);
    } else {
      this.removeChildren();
      this._symbol = null;
    }

    return true;
  }

  public setKeyframeData(symbol:PIXI.DisplayObject, keyframe:KeyframeData, frame:number) {
    let x = keyframe.x;
    let y = keyframe.y;
    let scaleX = keyframe.scaleX;
    let scaleY = keyframe.scaleY;
    let skewX = keyframe.skewX;
    let skewY = keyframe.skewY;
    const pivotX = keyframe.pivotX;
    const pivotY = keyframe.pivotY;
    let alpha = keyframe.alpha;
    let ease:number;
    let interped:number;
    let nextKeyframe;

    if (keyframe.index < frame && keyframe.tweened) {
      nextKeyframe = this._layerData.getKeyframeAfter(keyframe);

      if (nextKeyframe instanceof KeyframeData) {
        interped = (frame - keyframe.index) / keyframe.duration;
        ease = keyframe.ease;

        if (ease != 0) {
          let t = 0.0;
          if (ease < 0) {
            const inv = 1 - interped;
            t = 1 - inv * inv;
            ease = 0 - ease;
          } else {
            t = interped * interped;
          }
          interped = ease * t + (1 - ease) * interped;
        }

        x = x + (nextKeyframe.x - x) * interped;
        y = y + (nextKeyframe.y - y) * interped;
        scaleX = scaleX + (nextKeyframe.scaleX - scaleX) * interped;
        scaleY = scaleY + (nextKeyframe.scaleY - scaleY) * interped;
        skewX = skewX + (nextKeyframe.skewX - skewX) * interped;
        skewY = skewY + (nextKeyframe.skewY - skewY) * interped;
        alpha = alpha + (nextKeyframe.alpha - alpha) * interped;
      }
    }


    let rotation = 0;
    // Got the idea from the pixi animate extension
    if (skewX === skewY)
    {
        rotation = skewY;
        skewX = 0;
        skewY = 0;
    }
    this.setTransform(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY);

    this.alpha = alpha;
    this.visible = keyframe.visible;

    this._frame = frame;
  }

  public reset():void {
    if (this._symbol instanceof FlumpMovie) {
      ( <FlumpMovie> this._symbol).reset();
    }

    for (const symbol of Object.values(this._symbols)) {
      if (symbol instanceof FlumpMovie) {
        symbol.reset();
      }
    }
  }
}

