import { combineReducers } from "redux";
import setting from "./setting";
import campaigns from "./campaign";
import groups from "./group";

export default combineReducers({ setting, campaigns, groups });
