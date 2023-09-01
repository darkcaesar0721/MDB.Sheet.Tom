import axios from "axios";
import {
    INIT_CAMPAIGN_DATA,
    INSERT_CAMPAIGN_DATA,
    UPDATE_CAMPAIGN_DATA,
    DELETE_CAMPAIGN_DATA
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

export const insertCampaign = (campaign = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/campaign', campaign);
    dispatch({
        type: INSERT_CAMPAIGN_DATA,
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