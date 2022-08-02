import * as PIXI from "pixi.js";

import {ILoadable} from "./interface/ILoadable";
import {HttpRequest} from "./util/HttpRequest";
import {PromiseUtil} from "./util/PromiseUtil";

import {TextureGroup} from "./core/TextureGroup";
import {FlumpMovie} from "./core/FlumpMovie";
import {ILibrary} from "./interface/ILibrary";
import {MovieData} from "./data/MovieData";
import {QueueItem} from "./util/QueueItem";


/**
 * Structure:
 * FlumpLibrary
 *  - FlumpMovie
 */
export class FlumpLibrary implements ILoadable<FlumpLibrary> {
  public static EVENT_LOAD = "load";

  public static load(url:string, library:FlumpLibrary, onProcess?:(process:number) => any ):Promise<FlumpLibrary> {
    let baseDir = url;

    if (url.indexOf(".json") > -1) {
      baseDir = url.substr(0, url.lastIndexOf("/"));
    } else {
      if (baseDir.substr(-1) == "/") {
        baseDir = baseDir.substr(0, baseDir.length - 1);
      }

      url += ( url.substr(url.length-1) != "/" ? "/" : "" ) + "library.json";
    }

    if (library == void 0) {
      library = new FlumpLibrary(baseDir);
    } else {
      library.url = baseDir;
    }

    return HttpRequest.getJSON(url).then((json:ILibrary) => library.processData(json, onProcess) );
  }

  public movieData:Array<MovieData> = [];
  public textureGroups:Array<TextureGroup> = [];

  public url:string;
  public md5:string;
  public frameRate:number;
  public referenceList:Array<string>;

  public fps:number = 0;
  public isOptimised:boolean = false;

  protected _hasLoaded:boolean = false;
  protected _isLoading:boolean = false;

  constructor(basePath?:string) {
    if (basePath) {
      this.url = basePath;
    }
  }

  public hasLoaded():boolean {
    return this._hasLoaded;
  }

  public isLoading():boolean {
    return this._isLoading;
  }

  public load( onProgress?:(progress:number) => any):Promise<FlumpLibrary> {
    if ( this.hasLoaded() ) {
      onProgress(1);

      return Promise.resolve(this);
    }

    if (!this.url) {
      throw new Error("url is not set and there for can not be loaded");
    }

    return FlumpLibrary.load(this.url, this, onProgress ).catch(() => {
      throw new Error("could not load library");
    });
  }

  public processData(json:ILibrary, onProcess?:(process:number) => any):Promise<FlumpLibrary> {
    this.md5 = json.md5;
    this.frameRate = json.frameRate;
    this.referenceList = json.referenceList || null;
    this.isOptimised = json.optimised || false;

    const textureGroupLoaders:Array<Promise<TextureGroup>> = [];
    for (let i = 0; i < json.movies.length; i++) {
      const movieData = new MovieData(this, json.movies[i]);
      this.movieData.push(movieData);
    }

    const textureGroups = json.textureGroups;
    for (let i = 0; i < textureGroups.length; i++) {
      const textureGroup = textureGroups[i];
      const promise = TextureGroup.load(this, textureGroup);
      textureGroupLoaders.push(promise);
    }

    return PromiseUtil.wait(textureGroupLoaders, onProcess)
        .then((textureGroups:Array<TextureGroup>) => {
          for (let i = 0; i < textureGroups.length; i++) {
            const textureGroup = textureGroups[i];
            this.textureGroups.push(textureGroup);
          }


          this._hasLoaded = true;
          return this;
        });
  }

  public getMovieData(name:string):MovieData {
    for (let i = 0; i < this.movieData.length; i++) {
      const movieData = this.movieData[i];
      if (movieData.id == name) {
        return movieData;
      }
    }

    throw new Error("movie not found");
  }

  public createSymbol(name:string, paused:boolean = false):FlumpMovie|PIXI.Sprite {
    for (let i = 0; i < this.textureGroups.length; i++) {
      if (this.textureGroups[i].hasSprite(name)) {
        return this.textureGroups[i].createSprite(name);
      }
    }

    for (let i = 0; i < this.movieData.length; i++) {
      const movieData = this.movieData[i];

      if (movieData.id == name) {
        const movie = new FlumpMovie(this, name);
        movie.getQueue().add(new QueueItem(null, 0, movie.frames, -1, 0));
        movie.paused = paused;
        return movie;
      }
    }

    console.warn("no _symbol found: (" + name + ")");

    throw new Error("no _symbol found");
  }

  public createMovie(id:string):FlumpMovie {
    const name:string = id;;

    // if(this.referenceList)
    // {
    // 	name = this.referenceList.indexOf(<number> id);
    // }
    // else
    // {
    // }

    for (let i = 0; i < this.movieData.length; i++) {
      const movieData = this.movieData[i];
      if (movieData.id == name) {
        const movie = new FlumpMovie(this, name);
        movie.paused = true;
        return movie;
      }
    }

    console.warn("no _symbol found: (" + name + ") ", this);

    throw new Error("no _symbol found: " + this);
  }

  public getNameFromReferenceList(value:string|number):string {
    if (this.referenceList && typeof value == "number") {
      return this.referenceList[<number> value];
    }

    return <string> value;
  }
}
