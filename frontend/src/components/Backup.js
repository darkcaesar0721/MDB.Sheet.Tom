import {Button, Col, Input, message, Row, Spin} from "antd";
import MenuList from "./MenuList";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getBackup, updateBackup,
} from "../redux/actions";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";

const Backup = (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tip, setTip] = useState('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [path, setPath] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(function() {
        props.getBackup();
    }, []);

    useEffect(function() {
        setPath(props.backup.path);
    }, [props.backup.path]);

    const savePath = function() {
        props.updateBackup({path: path});
    }

    const handleChange = function(e) {
        setPath(e.target.value);
    }

    const handleClick = function() {
        setLoading(true);
        setTip("Wait for backup....");
        axios.post(APP_API_URL + 'api.php?class=Backup&fn=run', qs.stringify({
            path,
        })).then(function(resp) {
            setLoading(false);
            messageApi.success('backup success');
        })
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
    return { backup: state.backup };
};

export default connect(
    mapStateToProps,
    { getBackup, updateBackup }
)(Backup);