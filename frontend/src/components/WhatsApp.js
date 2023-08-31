import {Input, Col, Row, Divider, Form, Switch} from 'antd';
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getWhatsApp, updateWhatsApp} from "../redux/actions";
import MenuList from "./MenuList";
import Path from "./Path/Path";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

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

function WhatsApp(props) {
    const [form] = Form.useForm();
    const [isWhatsApp, setIsWhatsApp] = useState(true);

    useEffect(function() {
        props.getWhatsApp();
    }, []);

    useEffect(function() {
        if (props.whatsapp.isWhatsApp !== undefined) setIsWhatsApp(props.whatsapp.isWhatsApp === "true" || props.whatsapp.isWhatsApp === true);

        form.setFieldsValue(props.whatsapp);
    }, [props.whatsapp]);

    const handleDefaultMessageChange = function(e) {
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {default_message: e.target.value}));
    }

    const saveDefaultMessage = function() {
        props.updateWhatsApp({default_message: form.getFieldsValue().default_message});
    }

    const handleInstanceIdChange = function(e) {
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {instance_id: e.target.value}));
    }

    const saveInstanceId = function() {
        props.updateWhatsApp({instance_id: form.getFieldsValue().instance_id,});
    }

    const handleTokenChange = function(e) {
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {token: e.target.value}));
    }

    const saveToken = function() {
        props.updateWhatsApp({token: form.getFieldsValue().token});
    }

    const handleIsWhatsAppChange = (v) => {
        setIsWhatsApp(v);
        props.updateWhatsApp({isWhatsApp: v});
    }

    return (
        <>
            <MenuList
                currentPage="whatsapp"
            />
            <Path/>
            <Divider>WHATSAPP INSTANCE SETTING</Divider>
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Form
                        {...formItemLayout}
                        form={form}
                        name="whatsapp"
                        scrollToFirstError
                    >
                        <Form.Item
                            name={['isWhatsApp']}
                            label="Global WhatsApp"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                                size="large"
                                onChange={handleIsWhatsAppChange}
                                checked={isWhatsApp}
                            />
                        </Form.Item>
                        <Form.Item
                            name="default_message"
                            label="Default Message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input default message',
                                },
                            ]}
                        >
                            <Input.TextArea disabled={!isWhatsApp} showCount autoSize={{ minRows: 3, maxRows: 10 }} onBlur={saveDefaultMessage} onChange={handleDefaultMessageChange}/>
                        </Form.Item>
                        <Form.Item
                            name="instance_id"
                            label="Ultramsg Instance Id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input instance id',
                                },
                            ]}
                        >
                            <Input disabled={!isWhatsApp} onBlur={saveInstanceId} onChange={handleInstanceIdChange}/>
                        </Form.Item>
                        <Form.Item
                            name="token"
                            label="Ultramsg Token"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input token',
                                },
                            ]}
                        >
                            <Input disabled={!isWhatsApp} onBlur={saveToken} onChange={handleTokenChange}/>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { getWhatsApp, updateWhatsApp }
)(WhatsApp);