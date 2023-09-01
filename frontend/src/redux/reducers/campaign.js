import {
    INIT_CAMPAIGN_DATA,
    CREATE_CAMPAIGN_DATA,
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
            return Object.assign({...state}, {data: action.data.map(c => {
                    let campaign = {...c};
                    campaign.key = campaign._id;
                    return campaign;
                })})
        }
        case CREATE_CAMPAIGN_DATA:
        {
            let createdCampaign = {...action.data};
            createdCampaign.key = createdCampaign._id;

            return Object.assign({...state}, {data: [...state.data, createdCampaign]})
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
