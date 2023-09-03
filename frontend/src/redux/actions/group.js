import axios from "axios";
import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
    UPDATE_GROUP_CAMPAIGN_OBJECT_DATA, UPDATE_GROUP_CAMPAIGN_FIELD_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getGroups = (callback = function() {}) => async (dispatch) => {
    const result = await axios.get(API + '/group');
    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });
    callback();
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

export const updateGroupCampaignObject = (group = {}, campaign = {}, object_name= "", key = '', value = '', callback = function() {}) => async (dispatch) => {
    dispatch({
        type: UPDATE_GROUP_CAMPAIGN_OBJECT_DATA,
        data: {
            group: group,
            campaign: campaign,
            object_name: object_name,
            key: key,
            value: value
        }
    });

    const result = await axios.put(API + '/group/' + group._id, Object.assign({...group}, {campaigns : [...group.campaigns].map(c => {
            let updatedCampaign = c;
            if (c._id === campaign._id) updatedCampaign[object_name][key] = value;
            return updatedCampaign;
        })}));
    callback();
}

export const updateGroupCampaignField = (group = {}, campaign = {}, key = '', value = '', callback = function() {}) => async (dispatch) => {
    dispatch({
        type: UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
        data: {
            group: group,
            campaign: campaign,
            key: key,
            value: value
        }
    });

    const result = await axios.put(API + '/group/' + group._id, Object.assign({...group}, {campaigns : [...group.campaigns].map(c => {
            let updatedCampaign = c;
            if (c._id === campaign._id) updatedCampaign[key] = value;
            return updatedCampaign;
        })}));
    callback();
}
