import * as PIXI from "pixi.js";

import {FlumpLibrary} from "../FlumpLibrary";
import {IAtlas} from "../interface/ILibrary";

import Texture = PIXI.Texture;
import BaseTexture = PIXI.BaseTexture;
import Rectangle = PIXI.Rectangle;
import Point = PIXI.Point;

export class TextureGroupAtlas {
  public static load(library:FlumpLibrary, json:IAtlas):Promise<TextureGroupAtlas> {
    const file = json.file;
    const url = library.url + "/" + file;

    return new Promise(function(resolve, reject) {
      const img = <HTMLImageElement> document.createElement("img");
      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error("Failed toi load texture atlas"));
      };

      img.src = url;
    }).then((data:HTMLImageElement) => new TextureGroupAtlas(data, json) );
  }

  protected _baseTexture:BaseTexture;
  protected _names:Array<string> = [];
  protected _textures:Array<Texture> = [];
  protected _anchors:Array<Point> = [];
  protected _atlas:IAtlas;

  constructor( renderTexture:HTMLImageElement, json:IAtlas) {
    this._baseTexture = new BaseTexture(renderTexture);
    this._atlas = json;

    const atlasTextures = this._atlas.textures;
    const baseTexture = this._baseTexture;

    for (let i = 0; i < atlasTextures.length; i++) {
      const atlasTexture = atlasTextures[i];

      this._names.push(atlasTexture.symbol);
      this._textures.push(new Texture(baseTexture, new Rectangle(atlasTexture.rect[0], atlasTexture.rect[1], atlasTexture.rect[2], atlasTexture.rect[3])));
      this._anchors.push(new Point(atlasTexture.origin[0]/atlasTexture.rect[2], atlasTexture.origin[1]/atlasTexture.rect[3]));
    }
  }

  public getNames():Array<string> {
    return this._names;
  }

  public getTextures():Array<Texture> {
    return this._textures;
  }

  public getAnchors():Array<Point> {
    return this._anchors;
  }

  public destruct():void {
    this._names = null;
    this._textures = null;
    this._anchors = null;
  }
}

