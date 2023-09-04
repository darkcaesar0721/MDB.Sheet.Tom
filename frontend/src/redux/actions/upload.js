import axios from "axios";
import {API} from "../../config";
import {UPDATE_CAMPAIGN_DATA, UPDATE_CAMPAIGN_FIELD_DATA} from "../actionTypes";

export const getUploadLastPhone = (campaign = {}, mdb = "", callback = function() {}) => async (dispatch) => {
    try {
        const result = await axios.get(API + '/upload/get_last_phone?campaign_id=' + campaign._id + '&campaign_query=' + campaign.query + '&mdb_path=' + mdb);
        if (result.data.status === 'error') {
            callback(result.data);
        } else {
            dispatch({
                type: UPDATE_CAMPAIGN_FIELD_DATA,
                data: result.data.campaign
            });
            callback(result.data);
        }
        // Process the response data
    } catch (error) {
        throw error;

    }
}