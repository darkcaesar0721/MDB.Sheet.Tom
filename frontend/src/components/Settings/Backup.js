import {Button, Col, Input, message, Row, Spin, Upload} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import {
    updateSetting, backupDB
} from "../../redux/actions/setting";
import {API} from "../../config";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

const Backup = (props) => {
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [path, setPath] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(function() {
        setPath(props.setting.backup_path);
    }, [props.setting]);

    const savePath = function() {
        const setting = Object.assign({...props.setting}, {backup_path : path});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the backup path");
        });
    }

    const handleChange = function(e) {
        setPath(e.target.value);
    }

    const handleClick = function() {
        setLoading(true);
        setTip("Wait for backup....");

        props.backupDB(function() {
            setLoading(false);
            messageApi.success('backup success');
        });
    }

    const upload_props = {
        headers: {
            authorization: 'authorization-text',
        },
        action: API + '/setting/restore',
        name: 'file',
    };

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <MenuList
                currentPage="backup"
            />
            <Row style={{marginTop: '2rem'}}>
                <Col span={10} offset={7}>
                    <Input addonBefore="BACKUP PATH" onBlur={savePath} placeholder="C:\mdb_work" onChange={handleChange} value={path} />
                </Col>
            </Row>
            <Row style={{marginTop: '1rem'}}>
                <Col span={1} offset={9}>
                    <Button type="primary" onClick={handleClick}>Backup</Button>

                </Col>
                <Col span={2} offset={1}>
                    <Upload {...upload_props}
                            accept=".json"
                            onChange={(response) => {
                                if (response.file.status !== 'uploading') {
                                    console.log(response.file, response.fileList);
                                }
                                if (response.file.status === 'done') {
                                    message.success(`${response.file.name} 
                               db restored successfully`);
                                } else if (response.file.status === 'error') {
                                    message.error(`${response.file.name} 
                             db restore failed.`);
                                }
                            }}
                    >
                        <Button type="primary">Restore Db</Button>
                    </Upload>
                </Col>
            </Row>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { setting: state.setting };
};

export default connect(
    mapStateToProps,
    { updateSetting, backupDB }
)(Backup);