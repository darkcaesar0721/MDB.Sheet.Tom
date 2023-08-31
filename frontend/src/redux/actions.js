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

export const updateSetting = (setting = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.put(API + '/setting/' + setting._id, setting);
    dispatch({
        type: INIT_SETTING_DATA,
        data: result.data
    });
    callback();
}

export const backupDB = (callback = function() {}) => async (dispatch) => {
    await axios.post(API + '/setting/backup');
    callback();
}