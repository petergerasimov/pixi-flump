import {ILoadable} from "../interface/ILoadable";

export class PromiseUtil {
  public static wait<T>(list:Array<Promise<T>>, onProgress:(progress:number) => any = (progress:number) => {}):Promise<Array<T>> {
    return new Promise(function(resolve:(response:Array<T>) => any) {
      const newList = [];

      const then = function(response:T) {
        newList.push(response);
        onProgress( newList.length / list.length);

        if (newList.length == list.length) {
          resolve(newList);
        }
      };

      for (let i = 0; i < list.length; i++) {
        list[i].then(then);
      }
    });
  }

  public static waitForLoadable<T>(list:Array<ILoadable<T>>, onProgress:(progress:number) => any = (progress:number) => {}):Promise<Array<T>> {
    const count = list.length;
    const progressList = [];
    for (let i = 0; i < count; i++) {
      progressList.push(0);
    }

    const prvProgress = function(index, progress:number) {
      progressList[index] = progress;
      let total = 0;
      const length = progressList.length;

      for (let i = 0; i < length; i++) {
        total += progressList[i];
      }

      onProgress(total / count);
    };

    const promiseList = new Array(count);
    for (let i = 0; i < count; i++) {
      promiseList[i] = list[i].load(prvProgress.bind(this, i));
    }

    return PromiseUtil.wait<T>(promiseList);
  }
}
