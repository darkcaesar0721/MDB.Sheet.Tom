import {
    INIT_GOOGLE_ACCOUNT_DATA,
    CREATE_GOOGLE_ACCOUNT_DATA,
    UPDATE_GOOGLE_ACCOUNT_DATA,
    DELETE_GOOGLE_ACCOUNT_DATA
} from "../actionTypes";

const initialState = {
    data: []
};

function googleAccount(state = initialState, action) {
    switch (action.type) {
        case INIT_GOOGLE_ACCOUNT_DATA:
        {
            return Object.assign({...state}, {data: action.data.map(c => {
                    let googleAccount = {...c};
                    googleAccount.key = googleAccount._id;
                    return googleAccount;
                })})
        }
        case CREATE_GOOGLE_ACCOUNT_DATA:
        {
            let createdGoogleAccount = {...action.data};
            createdGoogleAccount.key = createdGoogleAccount._id;

            return Object.assign({...state}, {data: [...state.data, createdGoogleAccount]})
        }
        case UPDATE_GOOGLE_ACCOUNT_DATA:
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
        case DELETE_GOOGLE_ACCOUNT_DATA:
        {
            return Object.assign({...state}, {data: [...state.data].filter(c => c._id !== action.data._id)});
        }
        default: {
            return state;
        }
    }
}

export default googleAccount;
