import axios from "axios";
import {API} from "../../config";
import {
    UPDATE_CAMPAIGN_DATA, UPDATE_CAMPAIGN_FIELD_DATA, UPDATE_GROUP_CAMPAIGN_FIELD_DATA, UPDATE_GROUP_DATA,
    UPDATE_GROUP_INPUT_DATE,
    UPDATE_IS_MANUALLY, UPDATE_IS_STOP_CAMPAIGN_RUNNING, UPDATE_UPLOAD_DATETIME,
    INIT_SETTING_DATA
} from "../actionTypes";

export const getUploadLastPhone = (groupId, groupCampaignId, campaignId, runCampaignByServer = {}, index = -1, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 180000;
    const api = index !== -1 ? 'http://localhost:' + runCampaignByServer.server + '/api' : API;
    axios.get(api + '/upload/get_last_phone?campaignId=' + campaignId)
        .then(result => {
            axios.get(api + '/setting')
                .then(res => {
                    let updateFields = {};
                    if (result.data.status === 'error') {
                        updateFields['state'] = 'warning';
                        updateFields['description'] = result.data.description;
                    } else {
                        dispatch({
                            type: UPDATE_CAMPAIGN_DATA,
                            data: result.data.campaign
                        });
                        updateFields['state'] = 'success';
                        updateFields['description'] = '';
                    }

                    if (index !== -1) {
                        dispatch({
                            type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
                            data: {
                                groupId: groupId,
                                campaignId: groupCampaignId,
                                updateFields: updateFields
                            }
                        });
                        if ((index + 1) !== runCampaignByServer.campaigns.length) {
                            dispatch({
                                type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
                                data: {
                                    groupId: groupId,
                                    campaignId: runCampaignByServer.campaigns[index + 1]._id,
                                    updateFields: {
                                        state: 'loading',
                                        description: ''
                                    }
                                }
                            });
                        }
                    }
                    let response = result.data;
                    response.setting = res.data;
                    callback(response);
                });
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

export const uploadLeads = (groupId, campaignId, callback) => (dispatch) => {
    const timeout = 300000;
    axios.post(API + '/upload/upload_leads', {groupId: groupId, campaignId: campaignId})
        .then(result => {
            callback(result.data);
        });
}

export const sendCompanyQty = (callback) => (dispatch) => {
    axios.post(API + '/upload/send_company_qty')
        .then(result => {
            if (result.data.status === 'success') {
                dispatch({
                    type: INIT_SETTING_DATA,
                    data: result.data.setting
                });
            }
            callback(result.data);
        });
}

export const sendBackupData = (callback) => (dispatch) => {
    axios.post(API + '/upload/send_backup_data')
        .then(result => {
            callback(result.data);
        });
}

export const upload = (groupId, groupCampaignId, campaignId, runCampaignByServer = {}, index = -1, manually = false, callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 300000;
    const api = index !== -1 ? 'http://localhost:' + runCampaignByServer.server + '/api' : API;
    axios.post(api + '/upload', {groupId: groupId, campaignId: campaignId, manually: manually})
        .then(result => {
            if (!manually) {
                axios.post(api + '/group/get_upload_time', {groupId: groupId, campaignId: campaignId})
                    .then(res => {
                        let updateFields = {};
                        if (result.data.status === 'error') {
                            updateFields['state'] = 'warning';
                            updateFields['description'] = result.data.description;
                        } else {
                            dispatch({
                                type: UPDATE_CAMPAIGN_DATA,
                                data: result.data.campaign
                            });
                            dispatch({
                                type: UPDATE_UPLOAD_DATETIME,
                                data: {
                                    groupId: groupId,
                                    campaignId: campaignId,
                                    uploadDateTime: res.data.uploadDateTime
                                }
                            });
                            updateFields['state'] = 'success';
                            updateFields['description'] = '';
                        }

                        if (index !== -1) {
                            dispatch({
                                type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
                                data: {
                                    groupId: groupId,
                                    campaignId: groupCampaignId,
                                    updateFields: updateFields
                                }
                            });
                            if ((index + 1) !== runCampaignByServer.campaigns.length) {
                                dispatch({
                                    type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
                                    data: {
                                        groupId: groupId,
                                        campaignId: runCampaignByServer.campaigns[index + 1]._id,
                                        updateFields: {
                                            state: 'loading',
                                            description: ''
                                        }
                                    }
                                });
                            }
                        }
                        let response = result.data;
                        response.setting = res.data.setting;
                        callback(response);
                    })
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
    const timeout = 300000;
    axios.post(API + '/upload/upload_preview', {groupId: groupId, campaignId: campaignId})
        .then(result => {
            axios.post(API + '/group/get_upload_time', {groupId: groupId, campaignId: campaignId})
                .then(res => {
                    if (result.data.status === 'error') {
                        callback(result.data);
                    } else {
                        dispatch({
                            type: UPDATE_CAMPAIGN_DATA,
                            data: result.data.campaign
                        });
                        dispatch({
                            type: UPDATE_UPLOAD_DATETIME,
                            data: {
                                groupId: groupId,
                                campaignId: campaignId,
                                uploadDateTime: res.data.uploadDateTime
                            }
                        });
                        callback(result.data);
                    }
                })
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
    const timeout = 300000;
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
                        inputDate: result.data.inputDate,
                        serviceDate: result.data.serviceDate,
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

export const updateIsStopCampaignRunning = (groupId, campaignId, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    dispatch({
        type: UPDATE_IS_STOP_CAMPAIGN_RUNNING,
        data: {
            groupId: groupId,
            campaignId: campaignId
        }
    });

    axios.post(API + '/upload/stop_campaign_running', {groupId: groupId, campaignId: campaignId})
        .then(result => {
            callback(result);
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateUploadGroup = (group) => (dispatch) => {
    dispatch({
        type: UPDATE_GROUP_DATA,
        data: group
    });
}

export const restartServer = (campaignId, port, callback, errorCallback) => (dispatch) => {
    axios.post('http://localhost:4000/api/upload/restart_server', {campaignId: campaignId, port: port})
        .then(result => {
            callback(result);
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const checkSeverOnlineStatus = (port, callback, errorCallback) => (dispatch) => {
    axios.post('http://localhost:' + port + '/api/upload/check_server_online_status')
        .then(result => {
            callback(result)
        })
        .catch(error => {
            errorCallback(error);
        });
}