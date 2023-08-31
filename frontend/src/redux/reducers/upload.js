import { INIT_UPLOAD_DATA } from "../actionTypes";

const initialState = {
    group: 0,
    way: 'all'
};

function upload(state = initialState, action) {
    switch (action.type) {
        case INIT_UPLOAD_DATA: {
            return Object.assign({...initialState}, action.data);
        }
        default: {
            return state;
        }
    }
}

export default upload;
