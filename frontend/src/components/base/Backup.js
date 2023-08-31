import {Button, Col, Input, message, Row, Spin} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import MenuList from "../MenuList";
import {
    updateSetting, backupDB
} from "../../redux/actions";

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
        props.updateSetting(setting);
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
                <Col span={2} offset={11}>
                    <Button type="primary" onClick={handleClick}>Backup</Button>
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