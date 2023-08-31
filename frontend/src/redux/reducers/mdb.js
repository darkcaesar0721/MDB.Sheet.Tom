import {INIT_MDB_DATA} from "../actionTypes";

const initialState = {};

function mdb(state = initialState, action) {
    switch (action.type) {
        case INIT_MDB_DATA: {
            return Object.assign({...state}, {...action.data})
        }
        default: {
            return state;
        }
    }
}

export default mdb;
