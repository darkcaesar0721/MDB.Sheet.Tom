import {INIT_BACKUP_DATA} from "../actionTypes";

const initialState = {};

function backup(state = initialState, action) {
    switch (action.type) {
        case INIT_BACKUP_DATA: {
            return Object.assign({...state}, {...action.data})
        }
        default: {
            return state;
        }
    }
}

export default backup;
