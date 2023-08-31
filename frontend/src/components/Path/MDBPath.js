import { Input, Col, Row } from 'antd';
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getMDBPath, setMDBPath} from "../../redux/actions";

function MDBPath(props) {
    const [path, setPath] = useState('');

    useEffect(function() {
        props.getMDBPath();
    }, []);

    useEffect(function() {
        setPath(props.mdb.path);
    }, [props.mdb.path]);

    const handleChange = function(e) {
        setPath(e.target.value);
    }

    const savePath = function() {
        props.setMDBPath({path: path});
    }

    return (
        <Row style={{marginTop: '2rem'}}>
            <Col span={16} offset={1}>
                <Input addonBefore="MDB PATH" onBlur={savePath} placeholder="C:\mdb_work\LeadDB_ThisSMALL.mdb" onChange={handleChange} value={path} />
            </Col>
        </Row>
    );
}

const mapStateToProps = state => {
    return { mdb: state.mdb };
};

export default connect(
    mapStateToProps,
    { getMDBPath, setMDBPath }
)(MDBPath);