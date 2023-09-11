import axios from "axios";
import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
    UPDATE_GROUP_CAMPAIGN_OBJECT_DATA, UPDATE_GROUP_CAMPAIGN_FIELD_DATA
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

export const createGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/group', group);
    dispatch({
        type: CREATE_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const updateGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.put(API + '/group/' + group._id, group);
    dispatch({
        type: UPDATE_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const deleteGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.delete(API + '/group/' + group._id);
    dispatch({
        type: DELETE_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const updateGroupCampaignField = (groupId = '', campaignId = '', updateFields = {}, databaseAccess = true, callback = function() {}) => async (dispatch) => {
    dispatch({
        type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
        data: {
            groupId: groupId,
            campaignId: campaignId,
            updateFields: updateFields
        }
    });

    if (databaseAccess)
        await axios.post(API + '/group/update_campaign_field', {groupId: groupId, campaignId: campaignId, updateFields: updateFields});
    callback();
}
