import {Input, Col, Row, Divider, Form, Switch} from 'antd';
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
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
            span: 5,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 19,
        },
    },
};

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function Whatsapp(props) {
    const [form] = Form.useForm();
    const [globalSendStatus, setGlobalSendStatus] = useState(true);

    useEffect(function() {
        if (props.setting.whatsapp !== undefined) {
            setGlobalSendStatus(props.setting.whatsapp.global_send_status === "true" || props.setting.whatsapp.global_send_status === true);
            form.setFieldsValue(props.setting.whatsapp);
        }
    }, [props.setting]);

    const handleWhatsappSettingChange = function(e) {
        const whatsapp = props.setting.whatsapp !== undefined ? {...props.setting.whatsapp} : {global_send_status: true, default_message_template: '', xls_message_template: '', ultramsg_instance_id: '', ultramsg_token: ''};
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {whatsapp: whatsapp}));
    }

    const saveWhatsappSetting = function() {
        let whatsapp = props.setting.whatsapp !== undefined ? {...props.setting.whatsapp} : {global_send_status: true, default_message_template: '', xls_message_template: '', ultramsg_instance_id: '', ultramsg_token: ''};
        whatsapp.global_send_status = globalSendStatus;
        const setting = Object.assign({...props.setting}, {whatsapp : Object.assign({...form.getFieldsValue()}, {whatsapp: whatsapp})});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the WhatsApp settings");
        });
    }

    const handleGlobalSendStatusChange = (v) => {
        setGlobalSendStatus(v);
        let whatsapp = props.setting.whatsapp !== undefined ? {...props.setting.whatsapp} : {global_send_status: true, default_message_template: '', xls_message_template: '', ultramsg_instance_id: '', ultramsg_token: ''};
        whatsapp.global_send_status = v;
        const setting = Object.assign({...props.setting}, {whatsapp : Object.assign({...form.getFieldsValue()}, {whatsapp: whatsapp})});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the WhatsApp settings");
        });
    }

    return (
        <>
            <MenuList
                currentPage="whatsapp"
            />
            <MdbSchedulePath />
            <Divider>WHATSAPP INSTANCE SETTING</Divider>
            <Row style={{marginTop: '2rem'}}>
                <Col span={8} offset={8}>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="whatsapp"
                        scrollToFirstError
                    >
                        <Form.Item
                            name={['global_send_status']}
                            label="Global WhatsApp"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                                size="large"
                                onChange={handleGlobalSendStatusChange}
                                checked={globalSendStatus}
                            />
                        </Form.Item>
                        <Form.Item
                            name="default_message_template"
                            label="Default Message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input default message',
                                },
                            ]}
                        >
                            <Input.TextArea disabled={!globalSendStatus} showCount autoSize={{ minRows: 3, maxRows: 10 }} onBlur={saveWhatsappSetting} onChange={handleWhatsappSettingChange}/>
                        </Form.Item>
                        <Form.Item
                            name="xls_message_template"
                            label="XLS Global Message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input xls global message',
                                },
                            ]}
                        >
                            <Input.TextArea disabled={!globalSendStatus} showCount autoSize={{ minRows: 3, maxRows: 10 }} onBlur={saveWhatsappSetting} onChange={handleWhatsappSettingChange}/>
                        </Form.Item>
                        <Form.Item
                            name="ultramsg_instance_id"
                            label="Ultramsg Instance Id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input instance id',
                                },
                            ]}
                        >
                            <Input disabled={!globalSendStatus} onBlur={saveWhatsappSetting} onChange={handleWhatsappSettingChange}/>
                        </Form.Item>
                        <Form.Item
                            name="ultramsg_token"
                            label="Ultramsg Token"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input token',
                                },
                            ]}
                        >
                            <Input disabled={!globalSendStatus} onBlur={saveWhatsappSetting} onChange={handleWhatsappSettingChange}/>
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
)(Whatsapp);