import axios from "axios";
import {
    INIT_CAMPAIGN_DATA,
    CREATE_CAMPAIGN_DATA,
    UPDATE_CAMPAIGN_DATA,
    DELETE_CAMPAIGN_DATA,
    UPDATE_CAMPAIGN_FIELD_DATA,
    INIT_GROUP_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getCampaigns = (errorCallback = function() {}) => (dispatch) => {
    axios.get(API + '/campaign')
        .then(result => {
            dispatch({
                type: INIT_CAMPAIGN_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        })
}

export const createCampaign = (campaign = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.post(API + '/campaign', campaign)
        .then(result => {
            dispatch({
                type: CREATE_CAMPAIGN_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateCampaign = (campaign = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.put(API + '/campaign/' + campaign._id, campaign)
        .then(result => {
            dispatch({
                type: UPDATE_CAMPAIGN_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const deleteCampaign = (campaign = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.delete(API + '/campaign/' + campaign._id)
        .then(campaignResult => {
            dispatch({
                type: DELETE_CAMPAIGN_DATA,
                data: campaignResult.data
            });

            axios.get(API + '/group')
                .then(groupResult => {
                    dispatch({
                        type: INIT_GROUP_DATA,
                        data: groupResult.data
                    });
                    callback();
                })
                .catch(error => {
                    errorCallback(error);
                });
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const getQueryColumns = (query = '', callback = function() {}, errorCallback = function() {}, timeoutCallback = function() {}) => (dispatch) => {
    const timeout = 60000;
    axios.post(API + '/campaign/get_query_column', {query: query})
        .then(result => {
            callback(result.data);
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

export const updateCampaignField = (campaignId = {}, updateFields = {}, database_access = false, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    dispatch({
        type: UPDATE_CAMPAIGN_FIELD_DATA,
        data: {
            campaignId: campaignId,
            updateFields: updateFields
        }
    });

    if (database_access) {
        axios.post(API + '/campaign/update_field', {campaignId: campaignId, updateFields: updateFields})
            .then(result => {
                callback();
            })
            .catch(error => {
                errorCallback(error);
            })
    }
}