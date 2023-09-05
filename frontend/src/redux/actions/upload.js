import axios from "axios";
import qs from "qs";
import {API} from "../../config";
import {UPDATE_CAMPAIGN_DATA, UPDATE_CAMPAIGN_FIELD_DATA} from "../actionTypes";

export const getUploadLastPhone = (campaignId, callback = function() {}) => async (dispatch) => {
    const result = await axios.get(API + '/upload/get_last_phone?campaignId=' + campaignId);
    if (result.data.status === 'error') {
        callback(result.data);
    } else {
        dispatch({
            type: UPDATE_CAMPAIGN_DATA,
            data: result.data.campaign
        });
        callback(result.data);
    }
}

export const upload = (group = {}, campaign = {}, setting = {}, index, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/upload', {group: group, campaign: campaign, setting: setting, index: index});
    if (result.data.status === 'error') {
        callback(result.data);
    } else {
        dispatch({
            type: UPDATE_CAMPAIGN_DATA,
            data: result.data.campaign
        });

        dispatch({
            type: UPDATE_CAMPAIGN_FIELD_DATA,
            data: result.data.campaign
        });
        callback(result.data);
    }
}