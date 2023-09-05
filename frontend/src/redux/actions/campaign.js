import axios from "axios";
import {
    INIT_CAMPAIGN_DATA,
    CREATE_CAMPAIGN_DATA,
    UPDATE_CAMPAIGN_DATA,
    DELETE_CAMPAIGN_DATA, UPDATE_GROUP_CAMPAIGN_FIELD_DATA, UPDATE_CAMPAIGN_FIELD_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getCampaigns = (callback = function() {}) => async (dispatch) => {
    const result = await axios.get(API + '/campaign');
    dispatch({
        type: INIT_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const createCampaign = (campaign = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/campaign', campaign);
    dispatch({
        type: CREATE_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const updateCampaign = (campaign = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.put(API + '/campaign/' + campaign._id, campaign);
    dispatch({
        type: UPDATE_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const deleteCampaign = (campaign = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.delete(API + '/campaign/' + campaign._id);
    dispatch({
        type: DELETE_CAMPAIGN_DATA,
        data: result.data
    });
    callback();
}

export const getQueryColumns = (query = '', callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/campaign/get_query_column', {query: query});
    callback(result.data);
}

export const updateCampaignField = (campaign = {}, updateFields = {}, database_access = false, callback = function() {}) => async (dispatch) => {
    dispatch({
        type: UPDATE_CAMPAIGN_DATA,
        data: campaign
    });

    dispatch({
        type: UPDATE_CAMPAIGN_FIELD_DATA,
        data: campaign
    });

    if (database_access) {
        const result = await axios.put(API + '/campaign/' + campaign._id, updateFields);
    }
    callback();
}