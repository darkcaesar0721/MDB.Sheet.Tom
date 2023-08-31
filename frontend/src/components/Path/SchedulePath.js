import { Input, Col, Row } from 'antd';
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getSchedulePath, setSchedulePath} from "../../redux/actions";

function SchedulePath(props) {
    const [path, setPath] = useState('');

    useEffect(function() {
        props.getSchedulePath();
    }, []);

    useEffect(function() {
        setPath(props.schedule.path);
    }, [props.schedule.path]);

    const handleChange = function(e) {
        setPath(e.target.value);
    }

    const savePath = function() {
        props.setSchedulePath({path: path});
    }

    return (
        <Row style={{marginTop: '1rem'}}>
            <Col span={16} offset={1}>
                <Input addonBefore="SCHEDULE SHEET URL" onBlur={savePath} placeholder="C:\mdb_work\LeadDB_ThisSMALL.mdb" onChange={handleChange} value={path} />
            </Col>
        </Row>
    );
}

const mapStateToProps = state => {
    return { schedule: state.schedule };
};

export default connect(
    mapStateToProps,
    { getSchedulePath, setSchedulePath }
)(SchedulePath);