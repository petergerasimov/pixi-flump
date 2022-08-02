import * as PIXI from "pixi.js";

import {TextureGroupAtlas} from "./TextureGroupAtlas";
import {IAtlas, ITextureGroup} from "../interface/ILibrary";
import {FlumpLibrary} from "../FlumpLibrary";

export class TextureGroup {
  public static load(library:FlumpLibrary, json:ITextureGroup):Promise<TextureGroup> {
    const atlases = json.atlases;
    const loaders:Array<Promise<any>> = [];

    for (let i = 0; i < atlases.length; i++) {
      const atlas:IAtlas = atlases[i];
      loaders.push(TextureGroupAtlas.load(library, atlas));
    }

    return Promise.all(loaders).then((atlases:Array<TextureGroupAtlas>) => {
      let names:Array<string> = [];
      let textures:Array<PIXI.Texture> = [];
      let ancors:Array<PIXI.Point> = [];

      for (let i = 0; i < atlases.length; i++) {
        const atlas = atlases[i];

        // @todo check on duplicate names
        names = names.concat(atlas.getNames());
        textures = textures.concat(atlas.getTextures());
        ancors = ancors.concat(atlas.getAnchors());

        atlas.destruct();
      }

      return new TextureGroup(names, textures, ancors);
    }).catch((err) => {
      console.warn("could not load textureGroup", err);
      throw new Error("could not load textureGroup");
    });
  }

  // public textureGroupAtlases:Array<TextureGroupAtlas>;
  // public textures:IHashMap<Texture>;
  protected _names:Array<string> = [];
  protected _textures:Array<PIXI.Texture> = [];
  protected _ancors:Array<PIXI.Point> = [];

  constructor(names:Array<string>, textures:Array<PIXI.Texture>, ancors:Array<PIXI.Point>) {
    this._names = names;
    this._textures = textures;
    this._ancors = ancors;
  }

  public hasSprite(name:string):boolean {
    return this._names.indexOf(name) > -1;
  }

  public createSprite(name:string):PIXI.Sprite {
    const index = this._names.indexOf(name);

    const sprite = new PIXI.Sprite(this._textures[index]);
    sprite.anchor.set(this._ancors[index].x, this._ancors[index].y);
    sprite.name = name;

    return sprite;
  }
}

