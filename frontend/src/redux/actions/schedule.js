import axios from "axios";

export const updateScheduleXLS = (callback = function() {}, errorCallback = function() {}) => (dispatch) => {
    const url = 'http://localhost:3011' + '/api/schedule/update_xls';
    axios.post(url)
        .then(result => {
            callback(result);
        })
        .catch(error => {
            errorCallback(error);
        });
}