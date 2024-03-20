import axios from "axios";
import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
    UPDATE_GROUP_CAMPAIGN_FIELD_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getGroups = (errorCallback = function() {}) => (dispatch) => {
    axios.get(API + '/group')
        .then(result => {
            dispatch({
                type: INIT_GROUP_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const createGroup = (group = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.post(API + '/group', group)
        .then(result => {
            dispatch({
                type: CREATE_GROUP_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        })

}

export const updateGroup = (group = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.put(API + '/group/' + group._id, group)
        .then(result => {
            dispatch({
                type: UPDATE_GROUP_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const deleteGroup = (group = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.delete(API + '/group/' + group._id)
        .then(result => {
            dispatch({
                type: DELETE_GROUP_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateGroupCampaignField = (groupId = '', campaignId = '', updateFields = {}, databaseAccess = true, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    dispatch({
        type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
        data: {
            groupId: groupId,
            campaignId: campaignId,
            updateFields: updateFields
        }
    });

    if (databaseAccess) {
        axios.post(API + '/group/update_campaign_field', {groupId: groupId, campaignId: campaignId, updateFields: updateFields})
            .then(result => {
                callback();
            })
            .catch(error => {
                errorCallback(error);
            });
    }
}
