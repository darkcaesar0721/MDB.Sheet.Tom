import {
    INIT_CAMPAIGN_DATA,
    INSERT_CAMPAIGN_DATA,
    UPDATE_CAMPAIGN_DATA,
    DELETE_CAMPAIGN_DATA,
} from "../actionTypes";

const initialState = {
    data: []
};

function campaign(state = initialState, action) {
    switch (action.type) {
        case INIT_CAMPAIGN_DATA:
        {
            return Object.assign({...state}, {data: action.data})
        }
        case INSERT_CAMPAIGN_DATA:
        {
            return Object.assign({...state}, {data: [...state, ...action.data]})
        }
        case UPDATE_CAMPAIGN_DATA:
        {
            return Object.assign(
                {...state}, {data: [...state.data].map(
                        c => {
                            if (c._id === action.data._id) return action.data;
                            else return c;
                        }
                    )
                });
        }
        case DELETE_CAMPAIGN_DATA:
        {
            return Object.assign({...state}, {data: [...state.data].filter(c => c._id !== action.data._id)});
        }
        default: {
            return state;
        }
    }
}

export default campaign;
