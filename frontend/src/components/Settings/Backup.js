import {Button, Col, Input, message, Row, Form, Spin, Upload, Divider} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import toastr from 'toastr';
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import {
    updateSetting, backupDB
} from "../../redux/actions/setting";
import {API} from "../../config";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

const layout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 20,
        offset:1
    },
};

const layoutWithOutLabel = {
    wrapperCol: {
        xs: {
            span: 20,
            offset: 4,
        },
    },
};

const Backup = (props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [path, setPath] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [whatsappReceivers, setWhatsappReceivers] = useState({});

    useEffect(function() {
        setPath(props.setting.backup_path);

        setWhatsappReceivers(oldState => {
            const databaseObj = {...props.setting.whatsapp_receivers_for_database_backup};
            return Object.assign(databaseObj, {
                groups: databaseObj.groups && databaseObj.groups.length > 0 ? databaseObj.groups : [''],
                users: databaseObj.users && databaseObj.users.length > 0 ? databaseObj.users : ['']
            });
        });
    }, [props.setting]);

    useEffect(function() {
        form.setFieldsValue(whatsappReceivers);
    }, [whatsappReceivers]);

    const savePath = function() {
        const setting = Object.assign({...props.setting}, {backup_path : path});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the backup path");
        });
    }

    const handleChange = function(e) {
        setPath(e.target.value);
    }

    const handleClick = function() {
        setLoading(true);
        setTip("Wait for backup....");

        props.backupDB(function() {
            setLoading(false);
            messageApi.success('backup success');
        }, (error) => {
            toastr.error("There is a problem with server.");
        });
    }

    const upload_props = {
        headers: {
            authorization: 'authorization-text',
        },
        action: API + '/setting/restore',
        name: 'file',
    };

    const handleSubmit = function(data) {
        const setting = Object.assign({...props.setting}, {whatsapp_receivers_for_database_backup : data});
        props.updateSetting(setting, (error) => {
            toastr.error("There is a problem with server.\n Can't save the WhatsApp settings");
        });
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
                <Col span={1} offset={11}>
                    <Button type="primary" onClick={handleClick}>Backup</Button>

                </Col>
                <Col span={2}>
                    <Upload {...upload_props}
                            accept=".json, .txt"
                            onChange={(response) => {
                                if (response.file.status !== 'uploading') {
                                    console.log(response.file, response.fileList);
                                }
                                if (response.file.status === 'done') {
                                    message.success(`${response.file.name} db restored successfully`);
                                } else if (response.file.status === 'error') {
                                    message.error(`${response.file.name} db restore failed.`);
                                }
                            }}
                    >
                        <Button type="primary">Restore Db</Button>
                    </Upload>
                </Col>
            </Row>
            <Row style={{marginTop: '1rem'}}>
                <Col span={10} offset={7}>
                    <Divider>WHATSAPP RECEIVERS FOR DATABASE RESULT</Divider>
                    <Form
                        {...layout}
                        form={form}
                        name="whatsapp"
                        scrollToFirstError
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="message"
                            label="Message"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input message',
                                },
                            ]}
                        >
                            <Input.TextArea showCount autoSize={{ minRows: 3, maxRows: 10 }}/>
                        </Form.Item>
                        <Form.List
                            name="users"
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? layout : layoutWithOutLabel)}
                                            label={index === 0 ? 'Single Person' : ''}
                                            required={false}
                                            key={field.key}
                                            className={"m-t-10"}
                                        >
                                            <Form.Item
                                                {...field}
                                                noStyle
                                            >
                                                <Input
                                                    placeholder="WhatsApp Single Person"
                                                    style={{
                                                        width: '95%',
                                                    }}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{
                                                width: '30%',
                                                marginLeft: '15%'
                                            }}
                                            icon={<PlusOutlined />}
                                            className={"m-t-10"}
                                        >
                                            Add Single Person
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.List
                            name="groups"
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? layout : layoutWithOutLabel)}
                                            label={index === 0 ? 'Groups' : ''}
                                            required={false}
                                            key={field.key}
                                            className={"m-t-10"}
                                        >
                                            <Form.Item
                                                {...field}
                                                noStyle
                                            >
                                                <Input
                                                    placeholder="WhatsApp Group"
                                                    style={{
                                                        width: '95%',
                                                    }}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{
                                                width: '30%',
                                                marginLeft: '15%'
                                            }}
                                            icon={<PlusOutlined />}
                                            className={"m-t-10"}
                                        >
                                            Add Group
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 11,
                            }}
                        >
                            <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
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
    { updateSetting, backupDB }
)(Backup);