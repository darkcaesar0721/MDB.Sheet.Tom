import axios from "axios";
import {API} from "../../config";
import {UPDATE_CAMPAIGN_DATA, UPDATE_CAMPAIGN_FIELD_DATA} from "../actionTypes";

export const getUploadLastPhone = (campaign = {}, mdb = "", callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/upload/get_last_phone', {campaign: campaign, mdb: mdb});
    dispatch({
        type: UPDATE_CAMPAIGN_DATA,
        data: result.data
    });

    dispatch({
        type: UPDATE_CAMPAIGN_FIELD_DATA,
        data: result.data
    });
    callback();
}