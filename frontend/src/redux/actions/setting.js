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

export const updateSetting = (setting = {}, errorCallback = function() {}) => async (dispatch) => {
    axios.put(API + '/setting/' + setting._id, setting)
        .then(result => {
            dispatch({
                type: INIT_SETTING_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        })
}

export const backupDB = (callback = function() {}, errorCallback = function() {}) => async (dispatch) => {
    axios.post(API + '/setting/backup')
        .then(result => {
            callback();
        })
        .catch(error => {
            errorCallback(error);
        })
}