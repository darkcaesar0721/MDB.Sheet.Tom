import {Input, Col, Row, Divider, Form, Switch} from 'antd';
import React, {useEffect} from "react";
import {connect} from "react-redux";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MdbSchedulePath from "./MdbSchedulePath";
import MenuList from "../MenuList";
import {updateSetting} from "../../redux/actions/setting.action";

const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 3,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 21,
        },
    },
};

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function Pdfcrowd(props) {
    const [form] = Form.useForm();

    useEffect(function() {
        if (props.setting.pdfcrowd !== undefined) {
            form.setFieldsValue(props.setting.pdfcrowd);
        }
    }, [props.setting]);

    const handlePdfcrowdSettingChange = function(e) {
        const pdfcrowd = props.setting.pdfcrowd !== undefined ? {...props.setting.pdfcrowd} : {username: '', apikey: ''};
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {pdfcrowd: pdfcrowd}));
    }

    const savePdfcrowdSetting = function() {
        let pdfcrowd = props.setting.pdfcrowd !== undefined ? {...props.setting.pdfcrowd} : {username: '', apikey: ''};
        const setting = Object.assign({...props.setting}, {pdfcrowd : Object.assign({...form.getFieldsValue()}, {pdfcrowd: pdfcrowd})});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the WhatsApp settings");
        });
    }

    return (
        <>
            <MenuList
                currentPage="pdfcrowd"
            />
            <MdbSchedulePath />
            <Divider>PDFCROWD INSTANCE SETTING</Divider>
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="whatsapp"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="username"
                            label="Username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input username',
                                },
                            ]}
                        >
                            <Input onBlur={savePdfcrowdSetting} onChange={handlePdfcrowdSettingChange}/>
                        </Form.Item>
                        <Form.Item
                            name="apikey"
                            label="API Key"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input api key',
                                },
                            ]}
                        >
                            <Input onBlur={savePdfcrowdSetting} onChange={handlePdfcrowdSettingChange}/>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { setting: state.setting };
};

export default connect(
    mapStateToProps,
    { updateSetting }
)(Pdfcrowd);