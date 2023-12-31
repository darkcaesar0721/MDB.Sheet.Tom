import {INIT_SETTING_DATA} from "../actionTypes";

const initialState = {
    backup_path: '',
    mdb_path: '',
    schedule_path: '',
    whatsapp: {
        global_send_status: true,
        default_message_template: '',
        ultramsg_instance_id: '',
        ultramsg_token: ''
    },
};

function setting(state = initialState, action) {
    switch (action.type) {
        case INIT_SETTING_DATA: {
            return Object.assign({...state}, {...action.data})
        }
        default: {
            return state;
        }
    }
}

export default setting;
