import axios from "axios";
import {API} from "../../config";
import {
    UPDATE_CAMPAIGN_DATA,
    UPDATE_GROUP_INPUT_DATE,
    UPDATE_IS_MANUALLY
} from "../actionTypes";

export const getUploadLastPhone = (campaignId, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 120000;
    axios.get(API + '/upload/get_last_phone?campaignId=' + campaignId)
        .then(result => {
            if (result.data.status === 'error') {
                callback(result.data);
            } else {
                dispatch({
                    type: UPDATE_CAMPAIGN_DATA,
                    data: result.data.campaign
                });
                callback(result.data);
            }
        })
        .catch(error => {
            errorCallback(error);
        })
        .finally(() => {
            clearTimeout(timer);
        });

    const timer = setTimeout(() => {
        timeoutCallback();
    }, timeout);
}

export const upload = (groupId, campaignId, manually = false, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 120000;
    axios.post(API + '/upload', {groupId: groupId, campaignId: campaignId, manually: manually})
        .then(result => {
            if (result.data.status === 'error') {
                callback(result.data);
            } else {
                dispatch({
                    type: UPDATE_CAMPAIGN_DATA,
                    data: result.data.campaign
                });
                callback(result.data);
            }
        })
        .catch(error => {
            errorCallback(error);
        })
        .finally(() => {
            clearTimeout(timer);
        });

    const timer = setTimeout(() => {
        timeoutCallback();
    }, timeout);
}

export const uploadPreviewData = (groupId, campaignId, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 120000;
    axios.post(API + '/upload/upload_preview', {groupId: groupId, campaignId: campaignId})
        .then(result => {
            if (result.data.status === 'error') {
                callback(result.data);
            } else {
                dispatch({
                    type: UPDATE_CAMPAIGN_DATA,
                    data: result.data.campaign
                });
                callback(result.data);
            }
        })
        .catch(error => {
            errorCallback(error);
        })
        .finally(() => {
            clearTimeout(timer);
        });

    const timer = setTimeout(() => {
        timeoutCallback();
    }, timeout);
}

export const getLastInputDate = (groupId, currentDate, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 120000;
    axios.post(API + '/upload/get_last_input_date', {groupId: groupId, currentDate: currentDate})
        .then(result => {
            if (result.data.status === 'error') {
                callback(result.data);
            } else {
                dispatch({
                    type: UPDATE_GROUP_INPUT_DATE,
                    data: {
                        groupId: groupId,
                        currentDate: currentDate,
                        inputDate: result.data.date
                    }
                });
                callback(result.data);
            }
        })
        .catch(error => {
            errorCallback(error);
        })
        .finally(() => {
            clearTimeout(timer);
        });

    const timer = setTimeout(() => {
        timeoutCallback();
    }, timeout);
}

export const updateIsManually = (groupId, campaignIds, value, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.post(API + '/upload/update_is_manually', {groupId: groupId, campaignIds: campaignIds, value: value})
        .then(result => {
            dispatch({
                type: UPDATE_IS_MANUALLY,
                data: {
                    groupId: groupId,
                    value: value
                }
            });

            callback(result);
        })
        .catch(error => {
            errorCallback(error);
        });
}