import axios from "axios";
import {
    INIT_COMPANY_DATA,
    CREATE_COMPANY_DATA,
    UPDATE_COMPANY_DATA,
    DELETE_COMPANY_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getCompanies = (errorCallback = function() {}) => (dispatch) => {
    axios.get(API + '/company')
        .then(result => {
            dispatch({
                type: INIT_COMPANY_DATA,
                data: result.data
            });
        })
        .catch(error => {
            errorCallback(error);
        })
}

export const createCompany = (company = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.post(API + '/company', company)
        .then(result => {
            dispatch({
                type: CREATE_COMPANY_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const updateCompany = (company = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.put(API + '/company/' + company._id, company)
        .then(result => {
            dispatch({
                type: UPDATE_COMPANY_DATA,
                data: result.data
            });
            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}

export const deleteCompany = (company = {}, callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    axios.delete(API + '/company/' + company._id)
        .then(result => {
            dispatch({
                type: DELETE_COMPANY_DATA,
                data: result.data
            });

            callback();
        })
        .catch(error => {
            errorCallback(error);
        });
}