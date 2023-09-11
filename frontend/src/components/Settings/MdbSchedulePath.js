import { Input, Col, Row } from 'antd';
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {updateSetting} from "../../redux/actions/setting";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function MdbSchedulePath(props) {
    const [mdbPath, setMdbPath] = useState('');
    const [schedulePath, setSchedulePath] = useState('');

    useEffect(function() {
        setMdbPath(props.setting.mdb_path);
        setSchedulePath(props.setting.schedule_path);
    }, [props.setting]);

    const handleMdbChange = function(e) {
        setMdbPath(e.target.value);
    }

    const handleScheduleChange = function(e) {
        setSchedulePath(e.target.value);
    }

    const saveMdbPath = function() {
        const setting = Object.assign({...props.setting}, {mdb_path : mdbPath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the mdb path");
        });
    }

    const saveSchedulePath = function() {
        const setting = Object.assign({...props.setting}, {schedule_path : schedulePath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the schedule path");
        });
    }

    return (
        <div>
            <Row style={{marginTop: '2rem'}}>
                <Col span={16} offset={1}>
                    <Input addonBefore="MDB PATH" onBlur={saveMdbPath} placeholder="C:\mdb_work\LeadDB_ThisSMALL.mdb" onChange={handleMdbChange} value={mdbPath} />
                </Col>
            </Row>
            <Row style={{marginTop: '1rem'}}>
                <Col span={16} offset={1}>
                    <Input addonBefore="SCHEDULE SHEET URL" onBlur={saveSchedulePath} placeholder="https://docs.google.com/spreadsheets/d/16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI/edit#gid=0" onChange={handleScheduleChange} value={schedulePath} />
                </Col>
            </Row>
        </div>

    );
}

const mapStateToProps = state => {
    return { setting: state.setting };
};

export default connect(
    mapStateToProps,
    { updateSetting }
)(MdbSchedulePath);