import axios from "axios";
import {
    INIT_SETTING_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getSettings = (errorCallback = function() {}) => (dispatch) => {
    axios.get(API + '/setting')
        .then(result => {
            dispatch({
                type: INIT_SETTING_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        });
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