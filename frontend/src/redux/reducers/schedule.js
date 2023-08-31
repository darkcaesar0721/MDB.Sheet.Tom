import {INIT_SCHEDULE_DATA} from "../actionTypes";

const initialState = {};

function schedule(state = initialState, action) {
    switch (action.type) {
        case INIT_SCHEDULE_DATA: {
            return Object.assign({...state}, {...action.data})
        }
        default: {
            return state;
        }
    }
}

export default schedule;
