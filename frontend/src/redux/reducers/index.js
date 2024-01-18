import { combineReducers } from "redux";
import setting from "./setting";
import companies from "./company";
import campaigns from "./campaign";
import groups from "./group";

export default combineReducers({ setting, companies, campaigns, groups });
