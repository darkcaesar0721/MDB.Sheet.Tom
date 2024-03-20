import { combineReducers } from "redux";
import setting from "./setting.reducer";
import companies from "./company.reducer";
import googleAccounts from "./google.account.reducer";
import campaigns from "./campaign.reducer";
import groups from "./group.reducer";

export default combineReducers({ setting, companies, googleAccounts, campaigns, groups });
