import {
    INIT_COMPANY_DATA,
    CREATE_COMPANY_DATA,
    UPDATE_COMPANY_DATA,
    DELETE_COMPANY_DATA
} from "../actionTypes";

const initialState = {
    data: []
};

function company(state = initialState, action) {
    switch (action.type) {
        case INIT_COMPANY_DATA:
        {
            return Object.assign({...state}, {data: action.data.map(c => {
                    let company = {...c};
                    company.key = company._id;
                    return company;
                })})
        }
        case CREATE_COMPANY_DATA:
        {
            let createdCompany = {...action.data};
            createdCompany.key = createdCompany._id;

            return Object.assign({...state}, {data: [...state.data, createdCompany]})
        }
        case UPDATE_COMPANY_DATA:
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
        case DELETE_COMPANY_DATA:
        {
            return Object.assign({...state}, {data: [...state.data].filter(c => c._id !== action.data._id)});
        }
        default: {
            return state;
        }
    }
}

export default company;
