import {
    Button,
    Checkbox,
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row,
    Spin, Switch, Table,
} from "antd";
import { MinusCircleOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import Path from "./Path/Path";
import {connect} from "react-redux";
import { useNavigate } from 'react-router-dom';
import MenuList from "./MenuList";
import {createCampaign, getWhatsApp} from "../redux/actions";
import dragula from "dragula";
import "dragula/dist/dragula.css";

const layout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 21,
    },
};

const formItemLayout = {
    labelCol: {
        span: 3,
    },
    wrapperCol: {
        span: 21,
    },
};

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {
            span: 21,
            offset: 3,
        },
    },
};

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

function CampaignAdd(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [buttonState, setButtonState] = useState('column');
    const [tblColumns, setTblColumns] = useState([]);
    const [isWhatsApp, setIsWhatsApp] = useState(false);

    useEffect(function() {
        props.getWhatsApp();
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (buttonState === 'campaign') {
            let start;
            let end;
            const container = document.querySelector(".ant-table-tbody");
            const drake = dragula([container], {
                moves: (el) => {
                    start = getIndexInParent(el);
                    return true;
                },
            });

            drake.on("drop", (el) => {
                end = getIndexInParent(el);
                handleReorder(start, end);
            });
        }
    }, [buttonState]);

    useEffect(function() {
        let data = {
            urls: [''],
            whatsapp_message: props.whatsapp.default_message,
            isWhatsApp: false,
            whatsapp_people: [''],
            whatsapp_groups: [''],
        };
        form.setFieldsValue(data);
    }, [props.whatsapp]);

    useEffect(function() {
        setTblColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                render: (_, r) => {
                    return (
                        <>
                            <span>{(r.index + 1)}</span>
                        </>
                    )
                }
            },
            {
                title: 'Display',
                key: 'display',
                width: 50,
                render: (_, c) => {
                    return <Checkbox checked={c.display} onChange={(e) => {handleColumnCheck(e, c)}}/>
                }
            },
            {
                title: 'MDB Column Name',
                dataIndex: 'name',
                key: 'mdb',
            },
            {
                title: 'Sheet Column Name',
                dataIndex: 'field',
                key: 'sheet',
                render: (_, c) => {
                    return c.name === 'Phone' ? c.name : ((c.isInputDate == "true" || c.isInputDate == true)
                        ? c.field : <Input disabled={!c.display} onChange={(e) => {handleColumnFieldChange(e, c)}} value={c.field}/>)
                }
            },
        ])
    }, [columns]);

    const getQueryColumns = function(query) {
        setLoading(true);

        axios.post(APP_API_URL + 'api.php?class=Mdb&fn=get_query_columns', qs.stringify({
            query,
        })).then(function(resp) {
            setLoading(false);
            if (resp.data.status === 'error') {
                messageApi.error(resp.data.description);
            } else {
                let _columns = [];
                let status = false;
                resp.data.columns.forEach((c, i) => {
                    if (c.name === 'SystemCreateDate')
                        status = true;

                    if (!status)
                        _columns.push({index: i, key: c.name, name: c.name, field: c.field, display: true, isInputDate: c.isInputDate});
                });
                setColumns(_columns);
                setOpen(true);
                setButtonState('campaign');
            }
        })
    }

    const handleSubmit = function(form) {
        if (buttonState === 'column') {
            getQueryColumns(form.query);
            return;
        }

        if (validation()) {
            form.columns = columns;

            props.createCampaign(form, function() {
                messageApi.success('create success');
                setTimeout(function() {
                    navigate('/campaigns');
                }, 1000);
            });
        }
    }

    const validation = function() {
        if (columns.length === 0) {
            messageApi.warning('Please custom column! Currently nothing columns.');
            return false;
        }

        return true;
    }

    const validateMessages = {
        required: '${label} is required!'
    };

    const handleColumnCheck = function(e, column) {
        if (column.name === 'Phone') return;

        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {display: e.target.checked}) : c);
        });
    }

    const handleColumnFieldChange = function(e, column) {
        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {field: e.target.value}) : c);
        });
    }

    const handleViewColumnClick = function() {
        setOpen(true);
    }

    const handleReorder = (dragIndex, draggedIndex) => {
        setColumns((oldState) => {
            const newState = [...oldState];
            const item = newState.splice(dragIndex, 1)[0];
            newState.splice(draggedIndex, 0, item);
            return newState.map((s, i) => {return Object.assign(s, {index: i})});
        });
    };

    const handleIsWhatsAppChange = (v) => {
        form.setFieldsValue(Object.assign({...form.getFieldsValue()}, {isWhatsApp: v}));
        setIsWhatsApp(v);
    }

    return (
        <Spin spinning={loading} tip="CHECKING QUERY AND GET COLUMN LIST BASED ON QUERY ..." delay={300}>
            {contextHolder}
            <MenuList
                currentPage="campaign"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={20} offset={2}>
                    <Divider>CAMPAIGN ADD FORM</Divider>
                    <Form
                        {...layout}
                        name="campaign_add_form"
                        onFinish={handleSubmit}
                        validateMessages={validateMessages}
                        form={form}
                    >
                        <Form.Item
                            name={['query']}
                            label="Query Name"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.List
                            name="urls"
                            rules={[
                                {
                                    validator: async (_, names) => {
                                        if (!names || names.length < 1) {
                                            return Promise.reject(new Error('At least 1 sheets'));
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                            label={index === 0 ? 'Sheet URLS' : ''}
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: "Please input sheet url or delete this field.",
                                                    },
                                                ]}
                                                noStyle
                                            >
                                                <Input
                                                    placeholder="Sheet URL"
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
                                                width: '20%',
                                                marginLeft: '14%'
                                            }}
                                            icon={<PlusOutlined />}
                                        >
                                            Add Sheet URL
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.Item
                            name={['schedule']}
                            label="Schedule Name"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={['isWhatsApp']}
                            label="WhatsApp"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                                size="large"
                                onChange={handleIsWhatsAppChange}
                                disabled={!(props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true')}
                            />
                        </Form.Item>
                        <Form.Item
                            name={['whatsapp_message']}
                            label="WhatsApp Send Message"
                        >
                            <Input.TextArea disabled={!isWhatsApp} showCount autoSize={{ minRows: 3, maxRows: 10 }}/>
                        </Form.Item>
                        <Form.List
                            name="whatsapp_people"
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                            label={index === 0 ? 'WhatsApp Single People' : ''}
                                            required={false}
                                            key={field.key}
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
                                                    disabled={!isWhatsApp}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                    disabled={!isWhatsApp}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{
                                                width: '20%',
                                                marginLeft: '14%'
                                            }}
                                            icon={<PlusOutlined />}
                                            disabled={!isWhatsApp}
                                        >
                                            Add Single Person
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Form.List
                            name="whatsapp_groups"
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                            label={index === 0 ? 'WhatsApp Groups' : ''}
                                            required={false}
                                            key={field.key}
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
                                                    disabled={!isWhatsApp}
                                                />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                    disabled={!isWhatsApp}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{
                                                width: '20%',
                                                marginLeft: '14%'
                                            }}
                                            icon={<PlusOutlined />}
                                            disabled={!isWhatsApp}
                                        >
                                            Add Group
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Row>
                            <Col span={4} offset={10}>
                                <Button type="dashed" danger onClick={handleViewColumnClick} style={{marginBottom: 10}}>
                                    View Column List
                                </Button>
                            </Col>
                        </Row>
                        <Form.Item
                            wrapperCol={{
                                ...layout.wrapperCol,
                                offset: 19,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                {
                                    buttonState === 'column' ? 'Get Column List' : 'Add Campaign'
                                }
                            </Button>
                            <Button type="dashed" href="#/campaigns" style={{marginLeft: 5}}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form>
                    <Modal
                        title="CUSTOM COLUMN"
                        centered
                        open={open}
                        onOk={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                        width={700}
                    >
                        <Table
                            bordered={true}
                            size="small"
                            columns={tblColumns}
                            dataSource={columns}
                            pagination={false}
                        />
                    </Modal>
                </Col>
            </Row>
        </Spin>
    );
}

const mapStateToProps = state => {
    return { whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { createCampaign, getWhatsApp }
)(CampaignAdd);
