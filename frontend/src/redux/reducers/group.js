import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
    UPDATE_GROUP_CAMPAIGN_FIELD_DATA,
    UPDATE_IS_MANUALLY, UPDATE_GROUP_INPUT_DATE, UPDATE_IS_STOP_CAMPAIGN_RUNNING, UPDATE_UPLOAD_DATETIME,
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
        case UPDATE_IS_MANUALLY:
        {
            const {groupId, value} = action.data;

            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === groupId) {
                                return Object.assign({...g}, {campaigns : [...g.campaigns].map(c => {
                                        let updatedCampaign = c;
                                        updatedCampaign.is_manually_upload = value;
                                        return updatedCampaign;
                                    })})
                            } else {
                                return g;
                            }
                        }
                    )
                });
        }
        case UPDATE_GROUP_INPUT_DATE:
        {
            const {groupId, currentDate, inputDate, serviceDate} = action.data;

            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === groupId) {
                                return Object.assign({...g}, {last_control_date: currentDate, last_input_date: inputDate, last_service_date: serviceDate});
                            } else {
                                return g;
                            }
                        }
                    )
                });
        }

        case UPDATE_IS_STOP_CAMPAIGN_RUNNING:
        {
            const {groupId, campaignId} = action.data;

            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === groupId) {
                                return Object.assign({...g}, {campaigns: [...g.campaigns].map(c => {
                                    let campaign = {...c};
                                    campaign.is_stop_running_status = c._id === campaignId;
                                    return campaign;
                                    })});
                            } else {
                                return g;
                            }
                        }
                    )
                });
        }
        case UPDATE_UPLOAD_DATETIME:
        {
            const {groupId, campaignId, uploadDateTime} = action.data;
            return Object.assign(
                {...state}, {data: [...state.data].map(
                        g => {
                            if (g._id === groupId) {
                                return Object.assign({...g}, {campaigns: [...g.campaigns].map(c => {
                                        let campaign = {...c};
                                        if (campaign.detail === campaignId) {
                                            campaign.last_upload_start_datetime = uploadDateTime.last_upload_start_datetime;
                                            campaign.last_upload_end_datetime = uploadDateTime.last_upload_end_datetime;
                                        }
                                        return campaign;
                                    })});
                            } else {
                                return g;
                            }
                        }
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