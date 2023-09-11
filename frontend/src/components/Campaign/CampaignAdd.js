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
    Spin, Table,
} from "antd";
import { MinusCircleOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import { useNavigate } from 'react-router-dom';
import dragula from "dragula";
import "dragula/dist/dragula.css";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {createCampaign, getQueryColumns} from "../../redux/actions/campaign";

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
            sheet_urls: [''],
        };
        form.setFieldsValue(data);
    }, []);

    useEffect(function() {
        setTblColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                render: (_, r) => {
                    let index = -1;
                    columns.forEach((c, i) => {
                        if (c.mdb_name === r.mdb_name) index = i;
                    });
                    return (
                        <>
                            <span>{(index + 1)}</span>
                        </>
                    )
                }
            },
            {
                title: 'Display',
                key: 'is_display',
                width: 50,
                render: (_, c) => {
                    return <Checkbox checked={c.is_display} onChange={(e) => {handleColumnCheck(e, c)}}/>
                }
            },
            {
                title: 'MDB Column Name',
                dataIndex: 'mdb_name',
                key: 'mdb_name',
            },
            {
                title: 'Sheet Column Name',
                dataIndex: 'sheet_name',
                key: 'sheet_name',
                render: (_, c) => {
                    return c.mdb_name === 'Phone' ? c.mdb_name : <Input readOnly={!c.is_display} onChange={(e) => {handleColumnSheetNameChange(e, c)}} value={c.sheet_name}/>
                }
            },
        ])
    }, [columns]);

    const getQueryColumns = function(query) {
        setLoading(true);

        props.getQueryColumns(query, function(result) {
             setLoading(false);

             if (result.status === 'error') {
                 messageApi.error(result.description);
                 return false;
             } else {
                 let columns = [];
                 for (const c of result) {
                     if (c.name.toLowerCase() === 'systemcreatedate' || c.name.toLowerCase() === 'stop') break;

                     columns.push({key: c.name, mdb_name: c.name, sheet_name: c.name, is_display: true});
                 }
                 setColumns(columns);
                 setOpen(true);
                 setButtonState('campaign');
             }
        }, (error) => {
            setLoading(false);
            toastr.error('There is a problem with server.');
        }, () => {
            setLoading(false);
            toastr.warning('There is a problem with MDB file.');
        });
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
            }, (error) => {
                toastr.error('There is a problem with server.');
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
        if (column.mdb_name === 'Phone') return;

        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {is_display: e.target.checked}) : c);
        });
    }

    const handleColumnSheetNameChange = function(e, column) {
        setColumns((oldState) => {
            const newState = [...oldState];
            return newState.map((c, i) => c === column ? Object.assign({...c}, {sheet_name: e.target.value}) : c);
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
                            name="sheet_urls"
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
    return { };
};

export default connect(
    mapStateToProps,
    { createCampaign, getQueryColumns }
)(CampaignAdd);
