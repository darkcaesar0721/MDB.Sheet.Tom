import {
    INIT_CAMPAIGN_DATA
} from "../actionTypes";

const initialState = {
    data: [],
};

function campaigns(state = initialState, action) {
    switch (action.type) {
        case INIT_CAMPAIGN_DATA: {
            return Object.assign({...state}, {data: action.data});
        }
        default: {
            return state;
        }
    }
}

export default campaigns;
