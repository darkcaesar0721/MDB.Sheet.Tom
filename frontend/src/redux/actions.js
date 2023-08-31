import axios from "axios";
import {
    INIT_SETTING_DATA
} from "./actionTypes";
import {API} from "../config";

export const getSetting = (callback = function() {}) => async (dispatch) => {
    const result = await axios.get(API + '/setting');
    dispatch({
        type: INIT_SETTING_DATA,
        data: result.data
    });
    callback();
}