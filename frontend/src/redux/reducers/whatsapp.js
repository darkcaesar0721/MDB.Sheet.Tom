import {INIT_WHATSAPP_DATA} from "../actionTypes";

const initialState = {};

function whatsapp(state = initialState, action) {
    switch (action.type) {
        case INIT_WHATSAPP_DATA: {
            return Object.assign({...state}, {...action.data})
        }
        default: {
            return state;
        }
    }
}

export default whatsapp;