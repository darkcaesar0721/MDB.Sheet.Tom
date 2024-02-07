import axios from "axios";
import {
    INIT_SETTING_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getSettings = (server = '', callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    const url = server ? 'http://localhost:' + server + '/api/setting' : API + '/setting';
    axios.get(url)
        .then(result => {
            dispatch({
                type: INIT_SETTING_DATA,
                data: result.data
            });
            callback(result.data);
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateSetting = (setting = {}, errorCallback = function() {}, server = '') => async (dispatch) => {
    const url = server ? 'http://localhost:' + server + '/api/setting/' + setting._id : API + '/setting/' + setting._id;
    axios.put(url, setting)
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

export const downloadGoogleSheetCredential = (callback = function() {}, errorCallback = function() {}) => async (dispatch) => {
    axios.get(API + '/setting/download_google_sheet_credential')
        .then(result => {
            callback(result.data);
        })
        .catch(error => {
            errorCallback(error);
        })
}