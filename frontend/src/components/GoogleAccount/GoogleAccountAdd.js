import {
    Col,
    Divider,
    Form,
    Input,
    message,
    Row,
    Button
} from "antd";
import React from "react";
import {connect} from "react-redux";
import { useNavigate } from 'react-router-dom';
import "dragula/dist/dragula.css";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {createGoogleAccount} from "../../redux/actions/google.account.action";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

const layout = {
    labelCol: {
        span: 5,
    },
    wrapperCol: {
        span: 16,
    },
};

function GoogleAccountAdd(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    const handleSubmit = function(form) {
        props.createGoogleAccount(form, function() {
            messageApi.success('create success');
            setTimeout(function() {
                navigate('/googleaccounts');
            }, 1000);
        }, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const validateMessages = {
        required: '${label} is required!'
    };

    return (
        <>
            {contextHolder}
            <MenuList
                currentPage="googleaccount"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={8} offset={8}>
                    <Divider>GOOGLE ACCOUNT ADD FORM</Divider>
                    <Form
                        {...layout}
                        name="google_account_add_form"
                        onFinish={handleSubmit}
                        validateMessages={validateMessages}
                        form={form}
                    >
                        <Form.Item
                            name={['mail_address']}
                            label="Mail Address"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 13,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Add Google Account
                            </Button>
                            <Button type="dashed" href="#/googleaccounts" style={{marginLeft: 5}}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { };
};

export default connect(
    mapStateToProps,
    { createGoogleAccount }
)(GoogleAccountAdd);
