

import {LayerData} from "./LayerData";
import {PixiFlump} from "../PixiFlump";
import {IMovie} from "../interface/ILibrary";
export class FlumpMovieData {

	public id:string;
	public library;
	public layerData:Array<LayerData>;

	public frames:number = 0;

	constructor(flumpLibrary:PixiFlump, json:IMovie)
	{
		this.library = flumpLibrary;
		this.id = json.id;

		var layers = json.layers;
		this.layerData = new Array(layers.length);
		for(var i = 0; i < layers.length; i++)
		{
			var layer = new LayerData(layers[i]);
			this.layerData[i] = layer;
			this.frames = Math.max(this.frames, layer.frames)
		}
	}
}
