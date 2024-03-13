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
    const [xlsPath, setXLSPath] = useState('');
    const [schedulePath, setSchedulePath] = useState('');
    const [localFolderPath, setLocalFolderPath] = useState('');

    useEffect(function() {
        setMdbPath(props.setting.mdb_path);
        setXLSPath(props.setting.xls_path);
        setSchedulePath(props.setting.schedule_path);
        setLocalFolderPath(props.setting.local_folder_path);
    }, [props.setting]);

    const handleMdbChange = function(e) {
        setMdbPath(e.target.value);
    }

    const handleXLSChange = function(e) {
        setXLSPath(e.target.value);
    }

    const handleScheduleChange = function(e) {
        setSchedulePath(e.target.value);
    }

    const handleLocalFolderChange = function(e) {
        setLocalFolderPath(e.target.value);
    }

    const saveMdbPath = function() {
        const setting = Object.assign({...props.setting}, {mdb_path : mdbPath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the mdb path");
        });
    }

    const saveXLSPath = function() {
        const setting = Object.assign({...props.setting}, {xls_path : xlsPath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the xls path");
        });
    }

    const saveSchedulePath = function() {
        const setting = Object.assign({...props.setting}, {schedule_path : schedulePath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the schedule path");
        });
    }

    const saveLocalFolderPath = function() {
        const setting = Object.assign({...props.setting}, {local_folder_path : localFolderPath});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the schedule path");
        });
    }

    return (
        <div>
            <Row style={{marginTop: '1rem'}}>
                <Col span={3} offset={1}>
                    <Input addonBefore="MDB PATH" onBlur={saveMdbPath} placeholder="C:\mdb_work\LeadDB_ThisSMALL.mdb" onChange={handleMdbChange} value={mdbPath} />
                </Col>
                <Col span={3}>
                    <Input addonBefore="XLS PATH" onBlur={saveXLSPath} placeholder="" onChange={handleXLSChange} value={xlsPath} />
                </Col>
                <Col span={7} offset={1}>
                    <Input addonBefore="SCHEDULE SHEET URL" onBlur={saveSchedulePath} placeholder="https://docs.google.com/spreadsheets/d/16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI/edit#gid=0" onChange={handleScheduleChange} value={schedulePath} />
                </Col>
                <Col span={6} offset={1}>
                    <Input addonBefore="LOCAL FOLDER PATH" onBlur={saveLocalFolderPath} placeholder="C:\VA.MDB.TO.GOOGLE\CSV" onChange={handleLocalFolderChange} value={localFolderPath} />
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