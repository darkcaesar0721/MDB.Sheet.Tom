import {Button, Col, Input, message, Row, Spin, Upload} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import {
    downloadGoogleSheetCredential
} from "../../redux/actions/setting.action";
import {API} from "../../config";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

const Googlesheet = (props) => {
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const handleClick = function() {
        setLoading(true);
        setTip("Wait for download....");

        props.downloadGoogleSheetCredential(function(response) {
            // Create blob from JSON data
            const blob = new Blob([JSON.stringify(response)], {type: 'application/json'});
            
            // Generate file download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'credential.json';
            link.click();
            
            setLoading(false);
            messageApi.success('download success');
        }, (error) => {
            toastr.error("There is a problem with server.");
        });
    }

    const upload_props = {
        headers: {
            authorization: 'authorization-text',
        },
        action: API + '/setting/upload_google_sheet_credential',
        name: 'file',
    };

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <MenuList
                currentPage="googlesheet"
            />
            <Row style={{marginTop: '1rem'}}>
                <Col span={2} offset={8}>
                    <Button type="primary" onClick={handleClick}>Download Current Credential JSON File</Button>
                </Col>
                <Col span={2} offset={1}>
                    <Upload {...upload_props}
                            accept=".json"
                            onChange={(response) => {
                                if (response.file.status !== 'uploading') {
                                    console.log(response.file, response.fileList);
                                }
                                if (response.file.status === 'done') {
                                    message.success(`${response.file.name} upload successfully`);
                                } else if (response.file.status === 'error') {
                                    message.error(`${response.file.name} upload failed.`);
                                }
                            }}
                    >
                        <Button type="primary">Upload Credential JSON</Button>
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
    { downloadGoogleSheetCredential }
)(Googlesheet);