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
import {createCompany} from "../../redux/actions/company";

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

function CompanyAdd(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    const handleSubmit = function(form) {
        props.createCompany(form, function() {
            messageApi.success('create success');
            setTimeout(function() {
                navigate('/companies');
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
                currentPage="company"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={10} offset={6}>
                    <Divider>COMPANY ADD FORM</Divider>
                    <Form
                        {...layout}
                        name="company_add_form"
                        onFinish={handleSubmit}
                        validateMessages={validateMessages}
                        form={form}
                    >
                        <Form.Item
                            name={['mdb_id']}
                            label="Company id"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={['mdb_name']}
                            label="Company name"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={['nick_name']}
                            label="Company nickname"
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
                                offset: 15,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Add Company
                            </Button>
                            <Button type="dashed" href="#/companies" style={{marginLeft: 5}}>
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
    { createCompany }
)(CompanyAdd);
