import {INIT_SETTING_DATA} from "../actionTypes";

const initialState = {
    backup_path: '',
    mdb_path: '',
    schedule_path: '',
    last_system_create_date_time_for_company_qty: '',
    is_auto_whatsapp_sending_for_company_qty: true,
    whatsapp: {
        global_send_status: true,
        default_message_template: '',
        ultramsg_instance_id: '',
        ultramsg_token: ''
    },
    pdfcrowd: {
        username: '',
        apikey: ''
    }
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
