import {
    Button,
    Checkbox,
    Col,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Row, Spin, Switch, Table,
} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {getCampaigns, getWhatsApp, updateCampaign} from "../redux/actions";
import {useNavigate, useParams} from 'react-router-dom';
import Path from "./Path/Path";
import MenuList from "./MenuList";
import {CheckOutlined, CloseOutlined, MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import axios from "axios";
import {APP_API_URL} from "../constants";
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

function CampaignEdit(props) {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tblColumns, setTblColumns] = useState([]);
    const [isWhatsApp, setIsWhatsApp] = useState(false);

    const {index} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (open === true) {
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
    }, [open]);

    useEffect(function() {
        props.getCampaigns();
        props.getWhatsApp();
    }, []);

    useEffect(function() {
        setTblColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                render: (_, r) => {
                    if (r.index === undefined || r.index === "") {
                        columns.forEach((c, i) => {
                            if (c.name === r.name) {
                                r.index = i; return;
                            }
                        })
                    }
                    return (
                        <>
                            <span>{(parseInt(r.index) + 1)}</span>
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

    useEffect(function() {
        if (props.campaigns.data.length > 0) {
            let selectedCampaign = props.campaigns.data[index];
            setColumns(selectedCampaign.columns.map(c => {
                if (c.key === undefined || c.key === "") return Object.assign({...c}, {display: c.display ==='true', key: c.name})
                else return Object.assign({...c}, {display: c.display ==='true'})
            }));

            setIsWhatsApp((props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') && (selectedCampaign.isWhatsApp === 'true' || selectedCampaign.isWhatsApp === true));

            if (selectedCampaign.whatsapp_message === undefined) selectedCampaign.whatsapp_message = props.whatsapp.default_message;
            if (selectedCampaign.whatsapp_people === undefined) selectedCampaign.whatsapp_people = [''];
            if (selectedCampaign.whatsapp_groups === undefined) selectedCampaign.whatsapp_groups = [''];

            form.setFieldsValue(selectedCampaign);
        }
    }, [props.campaigns.data, props.whatsapp]);

    const handleSubmit = function(form) {
        if (validation()) {
            const currentCampaign = props.campaigns.data[index];

            const campaign = {columns: columns, urls: form.urls, schedule: form.schedule, isWhatsApp: form.isWhatsApp, whatsapp_message: form.whatsapp_message, whatsapp_people: form.whatsapp_people, whatsapp_groups: form.whatsapp_groups};
            const group = {columns: columns};
            props.updateCampaign(currentCampaign.file_name, campaign, group, function() {
                messageApi.success('update success');
                setTimeout(function() {
                    navigate('/campaigns');
                }, 1000);
            });
        }
    }

    const validation = () => {
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
        checkInputDateField(openColumnModal);
    }

    const openColumnModal = function() {
        setOpen(true);
    }

    const checkInputDateField = function(callback) {
        let isInputDateField = false;
        columns.forEach(c => {
            if (c.isInputDate == "true" || c.isInputDate == true) {
                isInputDateField = true;
            }
        })
        if (isInputDateField) {
            setLoading(true);
            axios.post(APP_API_URL + 'api.php?class=Mdb&fn=get_input_date')
                .then((resp) => {
                    setColumns(columns.map(c => (c.isInputDate == "true" || c.isInputDate == true) ? Object.assign(c, {field: resp.data}) : c));
                    callback();
                    setLoading(false);
                })
        } else {
            callback();
        }
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
        <Spin spinning={loading} tip="Get input date from 002_DateInput query ..." delay={300}>
            {contextHolder}
            <MenuList
                currentPage="campaign"
            />
            <Path/>
            <Row style={{marginTop: '2rem'}}>
                <Col span={20} offset={2}>
                    <Divider>CAMPAIGN EDIT FORM</Divider>
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
                            <Input readOnly />
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
                                checked={isWhatsApp}
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
                                offset: 18,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Update Campaign
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
    return { campaigns: state.campaigns, whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign, getWhatsApp }
)(CampaignEdit);