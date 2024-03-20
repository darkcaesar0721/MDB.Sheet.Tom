import {
    Col,
    Divider,
    Form,
    Input,
    message,
    Row,
    Button
} from "antd";
import React, {useEffect} from "react";
import {connect} from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import "dragula/dist/dragula.css";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {updateGoogleAccount} from "../../redux/actions/google.account.action";

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

function GoogleAccountEdit(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        if (props.googleAccounts.data.length > 0) {
            let selectedGoogleAccount = props.googleAccounts.data.filter(c => c._id === id)[0];
            form.setFieldsValue(selectedGoogleAccount);
        }
    }, [props.googleAccounts.data]);

    const handleSubmit = function(form) {
        const currentGoogleAccount = props.googleAccounts.data.filter(c => c._id === id)[0];
        const googleAccount = Object.assign({...currentGoogleAccount}, form);

        props.updateGoogleAccount(googleAccount, function() {
            messageApi.success('update success');
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
                    <Divider>GOOGLE ACCOUNT EDIT FORM</Divider>
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
                                offset: 12,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Update Google Account
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
    return { googleAccounts: state.googleAccounts };
};

export default connect(
    mapStateToProps,
    { updateGoogleAccount }
)(GoogleAccountEdit);
