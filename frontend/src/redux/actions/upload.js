import axios from "axios";
import qs from "qs";
import {API} from "../../config";
import {INIT_GROUP_DATA, UPDATE_CAMPAIGN_DATA, UPDATE_CAMPAIGN_FIELD_DATA, UPDATE_IS_MANUALLY} from "../actionTypes";

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

export const upload = (groupId, campaignId, manually = false, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/upload', {groupId: groupId, campaignId: campaignId, manually: manually});
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

export const uploadPreviewData = (groupId, campaignId, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/upload/upload_preview', {groupId: groupId, campaignId: campaignId});
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

export const getLastInputDate = (callback) => async (dispatch) => {
    const result = await axios.get(API + '/upload/get_last_input_date');
    callback(result.data);
}

export const updateIsManually = (groupId, campaignIds, value) => async (dispatch) => {
    dispatch({
        type: UPDATE_IS_MANUALLY,
        data: {
            groupId: groupId,
            value: value
        }
    });
    await axios.post(API + '/upload/update_is_manually', {groupId: groupId, campaignIds: campaignIds, value: value});
}