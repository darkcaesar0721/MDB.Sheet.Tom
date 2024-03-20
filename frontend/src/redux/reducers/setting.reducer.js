import {INIT_SETTING_DATA} from "../actionTypes";

const initialState = {
    backup_path: '',
    mdb_path: '',
    schedule_path: '',
    xls_path: '',
    local_folder_path: '',
    last_system_create_date_time_for_company_qty: '',
    is_auto_whatsapp_sending_for_company_qty: true,
    send_out_type: 'GOOGLE',
    send_local_file_type: 'CSV',
    is_auto_whatsapp_sending_for_local_way: false,
    whatsapp: {
        global_send_status: true,
        default_message_template: '',
        ultramsg_instance_id: '',
        ultramsg_token: ''
    },
    whatsapp_receivers_for_database_backup: {
        users: [],
        groups: [],
        message: ''
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
