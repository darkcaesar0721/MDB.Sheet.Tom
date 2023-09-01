import axios from "axios";
import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA
} from "../actionTypes";
import {API} from "../../config";

export const getGroups = (callback = function() {}) => async (dispatch) => {
    const result = await axios.get(API + '/group');
    dispatch({
        type: INIT_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const createGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.post(API + '/group', group);
    dispatch({
        type: CREATE_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const updateGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.put(API + '/group/' + group._id, group);
    dispatch({
        type: UPDATE_GROUP_DATA,
        data: result.data
    });
    callback();
}

export const deleteGroup = (group = {}, callback = function() {}) => async (dispatch) => {
    const result = await axios.delete(API + '/group/' + group._id);
    dispatch({
        type: DELETE_GROUP_DATA,
        data: result.data
    });
    callback();
}