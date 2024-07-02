import { isNonEmptyString, isRunningLocally } from "./utilities.js";

export default class Debug {
  constructor() {}
  static log(obj) {
    if (!isRunningLocally()) {
      return;
    }
    try {
      console.log(obj.toString());
    } catch (error) {
      console.log("trying to Debug.log an object caused the following error:");
      console.log(error);
    }
  }
}
