import axios from "axios";
import {
    INIT_GOOGLE_ACCOUNT_DATA,
    CREATE_GOOGLE_ACCOUNT_DATA,
    UPDATE_GOOGLE_ACCOUNT_DATA,
    DELETE_GOOGLE_ACCOUNT_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getGoogleAccounts = (errorCallback = function() {}) => (dispatch) => {
    axios.get(API + '/google.account')
        .then(result => {
            dispatch({
                type: INIT_GOOGLE_ACCOUNT_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        })
}

export const createGoogleAccount = (googleAccount = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.post(API + '/google.account', googleAccount)
        .then(result => {
            dispatch({
                type: CREATE_GOOGLE_ACCOUNT_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateGoogleAccount = (googleAccount = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.put(API + '/google.account/' + googleAccount._id, googleAccount)
        .then(result => {
            dispatch({
                type: UPDATE_GOOGLE_ACCOUNT_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const deleteGoogleAccount = (googleAccount = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.delete(API + '/google.account/' + googleAccount._id)
        .then(result => {
            dispatch({
                type: DELETE_GOOGLE_ACCOUNT_DATA,
                data: result.data
            });

            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}