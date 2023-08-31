import {
    INIT_TEMP_GROUP_DATA,
    INIT_GROUP_DATA
} from "../actionTypes";

const initialState = {
    temp: {
        selectedCampaignKeys: [],
        name: "",
    },
    data: [],
};

function groups(state = initialState, action) {
    switch (action.type) {
        case INIT_TEMP_GROUP_DATA: {
            return Object.assign({...state}, {temp: action.data});
        }
        case INIT_GROUP_DATA: {
            return Object.assign({...state}, {data: action.data});
        }
        default: {
            return state;
        }
    }
}

export default groups;
