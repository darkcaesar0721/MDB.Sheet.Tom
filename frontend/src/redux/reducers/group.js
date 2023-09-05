import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
    UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
    UPDATE_GROUP_CAMPAIGN_OBJECT_DATA, UPDATE_CAMPAIGN_FIELD_DATA,
} from "../actionTypes";

const initialState = {
    data: []
};

function group(state = initialState, action) {
    switch (action.type) {
        case INIT_GROUP_DATA:
        {
            return Object.assign({...state}, {data: action.data.map(g => {
                    let group = {...g};
                    group.key = group._id;
                    return group;
                })})
        }
        case CREATE_GROUP_DATA:
        {
            let createdGroup = {...action.data};
            createdGroup.key = createdGroup._id;

            return Object.assign({...state}, {data: [...state.data, createdGroup]})
        }
        case UPDATE_GROUP_DATA:
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
        case UPDATE_GROUP_CAMPAIGN_OBJECT_DATA:
        {
            const {group, campaign, object_name, key, value} = action.data;

            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === group._id) {
                                return Object.assign({...g}, {campaigns: [...g.campaigns].map(c => {
                                        let updatedCampaign = c;
                                        if (c._id === campaign._id) updatedCampaign[object_name][key] = value;
                                        return updatedCampaign;
                                    })})
                            } else {
                                return g;
                            }
                        }
                    )
                });
        }
        case UPDATE_GROUP_CAMPAIGN_FIELD_DATA:
        {
            const {groupId, campaignId, updateFields} = action.data;

            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === groupId) {
                                return Object.assign({...g}, {campaigns : [...g.campaigns].map(c => {
                                        let updatedCampaign = c;
                                        if (c._id === campaignId) {
                                            const keys = Object.keys(updateFields);
                                            keys.forEach(key => {
                                                updatedCampaign[key] = updateFields[key];
                                            })
                                        }
                                        return updatedCampaign;
                                    })})
                            } else {
                                return g;
                            }
                        }
                    )
                });
        }
        case UPDATE_CAMPAIGN_FIELD_DATA:
        {
            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => Object.assign(g, {campaigns: g.campaigns.map(c => {
                            if (c.campaign._id === action.data._id) c.campaign = action.data;
                            return c;
                            })})
                    )
                });
        }
        case DELETE_GROUP_DATA:
        {
            return Object.assign({...state}, {data: [...state.data].filter(c => c._id !== action.data._id)});
        }
        default: {
            return state;
        }
    }
}

export default group;