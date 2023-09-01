import {
    INIT_GROUP_DATA,
    CREATE_GROUP_DATA,
    UPDATE_GROUP_DATA,
    DELETE_GROUP_DATA,
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