import {Button, Checkbox, Col, Form, Input, message, Modal, Radio, Row, Select, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {CheckOutlined, CloseOutlined, MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import dragula from "dragula";
import "dragula/dist/dragula.css";
import moment from "moment";
import { DateRangePicker } from 'rsuite';
import 'rsuite/DateRangePicker/styles/index.css';

let current_date = new Date()
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});

const dateFormat = "YYYY-MM-DD";

const today = moment(pstDate).format(dateFormat);

const layout = {
    labelCol: {
        span: 3
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

const randomLayout = {
    labelCol: {
        span: 10,
    },
    wrapperCol: {
        offset: 3,
        span: 8,
    },
};

const meridianOption = [
    {value: 'AM', label: 'AM'},
    {value: 'PM', label: 'PM'},
];

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

const GroupCampaignSetting = (props) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [tblColumns, setTblColumns] = useState([]);

    const [campaign, setCampaign] = useState({});

    useEffect(() => {
        const newCampaign = Object.assign({...props.campaign}, {
            whatsapp: Object.assign({...props.campaign.whatsapp}, {
                groups: {...props.campaign.whatsapp}.groups.length > 0 ? {...props.campaign.whatsapp}.groups : [''],
                users: {...props.campaign.whatsapp}.users.length > 0 ? {...props.campaign.whatsapp}.users : ['']
            }) });

        setCampaign(newCampaign);

        setColumns(props.campaign.columns.map(c => {
            const column = c;
            column.key = c._id;
            return column;
        }));
    }, [props.campaign]);

    useEffect(() => {
        if (campaign.whatsapp) {
            let formFields = {...campaign};

            let whatsappKeys = Object.keys(formFields.whatsapp);
            whatsappKeys.forEach(k => {
                formFields[k] = formFields.whatsapp[k];
            });

            let filterKeys = Object.keys(formFields.filter);
            filterKeys.forEach(k => {
                formFields[k] = formFields.filter[k];
            });

            let pauseKeys = Object.keys(formFields.pause);
            formFields['pause_status'] = false;
            formFields['pause_type'] = 'TOTALLY';
            formFields['pause_period'] = [];

            pauseKeys.forEach(k => {
                if (k == 'period' && formFields.pause[k].start) {
                    formFields['pause_' + k] = [new Date(moment(formFields.pause[k].start).add(1, 'days').format(dateFormat)), new Date(moment(formFields.pause[k].end).add(1, 'days').format(dateFormat))];
                } else {
                    formFields['pause_' + k] = formFields.pause[k];
                }
            });

            form.setFieldsValue(formFields);
        }
    }, [campaign]);

    useEffect(() => {
        if (open) {
            let start;
            let end;
            const container = document.querySelector(".group-setting-form-table .ant-table-tbody");
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
        setTblColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                render: (_, r) => {
                    let index = -1;
                    columns.forEach((c, i) => {
                        if (c._id === r._id) {
                            index = i; return false;
                        }
                    })
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
                    return c.mdb_name === 'Phone' ? c.mdb_name : <Input readOnly={!c.is_display} onChange={(e) => {handleColumnSheetNameChange(e, c)}} value={c.sheet_name}/>;
                }
            },
        ])
    }, [columns]);

    const validation = () => {
        if (campaign.filter.way === 'STATIC') {
            if (!campaign.filter.static_count) {
                messageApi.warning('Please input static count.');
                return false;
            }
        }
        if (campaign.filter.way === 'RANDOM' || campaign.filter.way === 'RANDOM_FIRST') {
            if (!campaign.filter.random_start) {
                messageApi.warning('Please input random start count.');
                return false;
            }
            if (!campaign.filter.random_end) {
                messageApi.warning('Please input random end count.');
                return false;
            }
            if (parseInt(campaign.filter.random_start) > parseInt(campaign.filter.random_end)) {
                messageApi.warning('Random start count must be less than random end count.');
                return false;
            }
        }
        if (campaign.filter.way === 'RANDOM_FIRST') {
            if (!campaign.filter.random_start_position) {
                messageApi.warning('Please input random first count.');
                return false;
            }
            if (parseInt(campaign.filter.random_end) > parseInt(campaign.filter.random_start_position)) {
                messageApi.warning('Random end count must be less than random first count.');
                return false;
            }
        }
        if (campaign.filter.way === 'DATE') {
            if (!campaign.filter.date_old_day && !campaign.filter.date_is_time) {
                messageApi.warning('Please input time field');
                return false;
            }
            if (campaign.filter.date_is_time && !campaign.filter.date_time) {
                messageApi.warning('Please input time field.');
                return false;
            }
        }
        if (campaign.filter.way === 'PERIOD') {
            if (!campaign.filter.period_start) {
                messageApi.warning('Please input period start value.');
                return false;
            }
            if (!campaign.filter.period_end) {
                messageApi.warning('Please input period end value.');
                return false;
            }
            if (parseInt(campaign.filter.period_start) > parseInt(campaign.filter.period_end)) {
                messageApi.warning('Period start value must be less than period end value.');
                return false;
            }
        }
        if (campaign.columns.length === 0) {
            messageApi.warning('Please select columns.');
            return false;
        }
        return true;
    }

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
            return newState;
        });
    };

    const handleFilterFieldChange = (field, value) => {
        let object = {};
        object[field] = value;
        updateCampaign(object);
    }

    const handleWhatsappFieldChange = (field, value) => {
        let object = {};
        object[field] = value;
        updateCampaign({}, object);
    }

    const handlePauseFieldChange = (field, value) => {
        if (field === 'period') {
            const start_date = moment(value[0]).format(dateFormat);
            const end_date = moment(value[1]).format(dateFormat);

            value = {
                start: start_date,
                end: end_date
            }
        }

        let object = {};
        object[field] = value;
        updateCampaign({}, {}, object);
    }

    const updateCampaign = function(filter = {}, whatsapp = {}, pause = {}) {
        let object = {};
        object['filter'] = Object.assign(campaign.filter, filter);

        whatsapp['users'] = form.getFieldsValue().users;
        whatsapp['groups'] = form.getFieldsValue().groups;

        object['whatsapp'] = Object.assign(campaign.whatsapp, whatsapp);
        object['columns'] = columns;

        object['pause'] = Object.assign(campaign.pause, pause);

        setCampaign(oldState => Object.assign({...oldState}, object));
    }

    const handleSubmit = function(form) {
        if (validation()) {
            let users = [];
            form.users.forEach(user => {
                if (user !== '' && user !== undefined) users.push(user);
            });

            let groups = [];
            form.groups.forEach(group => {
                if (group !== '' && group !== undefined) groups.push(group);
            });

            let whatsapp = {...campaign.whatsapp};

            if (users.length === 0 && groups.length === 0) {
                whatsapp.send_status = false; whatsapp.xls_send_status = false;
            }

            let c = Object.assign({...campaign}, {whatsapp: Object.assign({...whatsapp}, {users: users, groups: groups}), columns: columns});
            if (c.filter.way === 'DATE') {
                c.filter.date_old_day = !c.filter.date_old_day ? 0 : c.filter.date_old_day;
            }

            if (c.pause.status && (c.pause.type === 'TOTALLY' || (c.pause.type === 'PERIOD' && new Date(moment(c.pause.period.start).format(dateFormat)) <= new Date(today) && new Date(moment(c.pause.period.end).format(dateFormat)) >= new Date(today) ))) {
                c.previous_color = (c.color === 'purple' ? 'green' : c.color);
                c.color = "purple";
                c.is_manually_upload = false;
            } else {
                c.color = c.previous_color ? c.previous_color : c.color;
            }

            props.updateCampaignSetting(Object.assign(props.campaign, c));
            props.showSettingModal(false);
        }
    }

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        campaign.sheet_urls ?
                            <>
                                <Form
                                    {...layout}
                                    name="add_group_form"
                                    onFinish={handleSubmit}
                                    className="group-setting-form"
                                    form={form}
                                >
                                    <Form.Item
                                        name={['query']}
                                        label="Query Name"
                                    >
                                        <span>{campaign.query}</span>
                                    </Form.Item>
                                    <Form.Item
                                        name={['sheet_urls']}
                                        label="Sheet URLs"
                                    >
                                        {
                                            campaign.sheet_urls.map(url => {
                                                return (
                                                    <div key={url}>
                                                        <a onClick={(e) => {window.open(url, '_blank')}} style={{fontSize: '1rem'}}>{url}</a>
                                                    </div>
                                                )
                                            })
                                        }
                                    </Form.Item>
                                    <Form.Item
                                        name={['schedule']}
                                        label="Schedule"
                                    >
                                        <span>{campaign.schedule}</span>
                                    </Form.Item>
                                    <Form.Item
                                        name={['way']}
                                        label="Filter Way"
                                    >
                                        <Radio.Group onChange={(e) => handleFilterFieldChange('way', e.target.value)} defaultValue="ALL" value={campaign.filter.way}>
                                            <Radio value="ALL">All Select</Radio>
                                            <Radio value="STATIC">Static Select</Radio>
                                            <Radio value="RANDOM">Random Select</Radio>
                                            <Radio value="RANDOM_FIRST">Random First Select</Radio>
                                            <Radio value="DATE">Date & Time</Radio>
                                            <Radio value="PERIOD">Date Period</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                    {
                                        campaign.filter.way === 'STATIC' ?
                                            <Form.Item
                                                name={['static_count']}
                                                label="Static Count"
                                            >
                                                <Row>
                                                    <Col span={4}>
                                                        <Input style={{width: '100%'}} placeholder="Static Count" value={campaign.filter.static_count} onChange={(e) => {handleFilterFieldChange('static_count', e.target.value)}}/>
                                                    </Col>
                                                </Row>
                                            </Form.Item> : ''
                                    }
                                    {
                                        campaign.filter.way === 'RANDOM' ?
                                            <Col span={24}>
                                                <Form.Item
                                                    {...randomLayout}
                                                    name={['random_start']}
                                                    label="Random Count"
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(30% + 2px)',
                                                    }}
                                                >
                                                    <Input placeholder="Start" value={campaign.filter.random_start} onChange={(e) => {handleFilterFieldChange('random_start', e.target.value)}}/>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['random']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(3% - 10px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <span>~</span>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['random_end']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(13% - 5px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <Input placeholder="End" value={campaign.filter.random_end} onChange={(e) => {handleFilterFieldChange('random_end', e.target.value)}}/>
                                                </Form.Item>
                                            </Col> : ''
                                    }
                                    {
                                        campaign.filter.way === 'RANDOM_FIRST' ?
                                            <Col span={24}>
                                                <Form.Item
                                                    {...randomLayout}
                                                    name={['random_start_position']}
                                                    label="Random First"
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(30% - 1px)',
                                                    }}
                                                >
                                                    <Input placeholder="First" value={campaign.filter.random_start_position} onChange={(e) => {handleFilterFieldChange('random_start_position', e.target.value)}}/>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['random_start']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(10% - 5px)',
                                                    }}
                                                >
                                                    <Input placeholder="Start" value={campaign.filter.random_start} onChange={(e) => {handleFilterFieldChange('random_start', e.target.value)}}/>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['random']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(3% - 5px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <span>~</span>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['random_end']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(10% - 5px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <Input placeholder="End" value={campaign.filter.random_end} onChange={(e) => {handleFilterFieldChange('random_end', e.target.value)}}/>
                                                </Form.Item>
                                            </Col> : ''
                                    }
                                    {
                                        campaign.filter.way === 'DATE' ?
                                            <Form.Item label="Days Old" name={['date']} valuePropName="checked">
                                                <Row>
                                                    <Col span={3}>
                                                        <Input placeholder="Days Old" value={campaign.filter.date_old_day} onChange={(e) => {handleFilterFieldChange('date_old_day', e.target.value)}}/>
                                                    </Col>
                                                    <Col span={1} offset={1}>
                                                        <Checkbox checked={campaign.filter.date_is_time} onChange={(e) => {handleFilterFieldChange('date_is_time', e.target.checked)}} style={{paddingTop: '0.3rem'}}></Checkbox>
                                                    </Col>
                                                    <Col span={2}>
                                                        <Input disabled={!campaign.filter.date_is_time} placeholder="Time" value={campaign.filter.date_time} onChange={(e) => {handleFilterFieldChange('date_time', e.target.value)}}/>
                                                    </Col>
                                                    <Col span={2}>
                                                        <Select
                                                            size="middle"
                                                            defaultValue="AM"
                                                            onChange={(value) => {handleFilterFieldChange('date_meridian', value)}}
                                                            style={{ width: 70 }}
                                                            options={meridianOption}
                                                            value={campaign.filter.date_meridian}
                                                            disabled={!campaign.filter.date_is_time}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Form.Item> : ''
                                    }
                                    {
                                        campaign.filter.way === 'PERIOD' ?
                                            <Col span={24}>
                                                <Form.Item
                                                    {...randomLayout}
                                                    name={['period_start']}
                                                    label="Date Period"
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(30% - 2px)',
                                                    }}
                                                >
                                                    <Input placeholder="Start" value={campaign.filter.period_start}  onChange={(e) => {handleFilterFieldChange('period_start', e.target.value)}}/>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['period']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(3% - 5px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <span>~</span>
                                                </Form.Item>
                                                <Form.Item
                                                    name={['period_end']}
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 'calc(13% - 5px)',
                                                        margin: '0 5px',
                                                    }}
                                                >
                                                    <Input placeholder="End" value={campaign.filter.period_end} onChange={(e) => {handleFilterFieldChange('period_end', e.target.value)}}/>
                                                </Form.Item>
                                            </Col> : ''
                                    }
                                    <Form.Item
                                        name={['pause_status']}
                                        label="Pause"
                                    >
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            size="large"
                                            onChange={(value) => {handlePauseFieldChange('status', value)}}
                                            checked={campaign.pause.status}
                                        />
                                    </Form.Item>
                                    {
                                        campaign.pause.status ?
                                            <Form.Item
                                                name={['pause_type']}
                                                label="Pause Type"
                                            >
                                                <Radio.Group onChange={(e) => handlePauseFieldChange('type', e.target.value)} defaultValue="TOTALLY" value={campaign.pause.type}>
                                                    <Radio value="TOTALLY">Totally</Radio>
                                                    <Radio value="PERIOD">Period</Radio>
                                                </Radio.Group>
                                            </Form.Item> : ''
                                    }
                                    {
                                        campaign.pause.status && campaign.pause.type === 'PERIOD'?
                                            <Form.Item
                                                name={['pause_period']}
                                                label="Pause Period"
                                            >
                                                <DateRangePicker onChange={(value) => handlePauseFieldChange('period', value)}/>
                                            </Form.Item> : ''
                                    }
                                    <Form.Item
                                        name={['send_status']}
                                        label="WhatsApp"
                                    >
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            size="large"
                                            onChange={(value) => {handleWhatsappFieldChange('send_status', value)}}
                                            checked={campaign.whatsapp.send_status}
                                            disabled={props.setting.whatsapp.whatsapp_global_send_status}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name={['xls_send_status']}
                                        label="WhatsApp(XLS)"
                                    >
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            size="large"
                                            onChange={(value) => {handleWhatsappFieldChange('xls_send_status', value)}}
                                            checked={campaign.whatsapp.xls_send_status}
                                            disabled={props.setting.whatsapp.whatsapp_global_send_status}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name={['message']}
                                        label="Message"
                                    >
                                        <Input.TextArea disabled={!campaign.whatsapp.send_status} showCount autoSize={{ minRows: 3, maxRows: 10 }} onChange={(e) => {handleWhatsappFieldChange('message', e.target.value);}}/>
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
                                                                disabled={!campaign.whatsapp.send_status}
                                                            />
                                                        </Form.Item>
                                                        {fields.length > 1 ? (
                                                            <MinusCircleOutlined
                                                                className="dynamic-delete-button"
                                                                onClick={() => remove(field.name)}
                                                                disabled={!campaign.whatsapp.send_status}
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
                                                            marginLeft: '15%'
                                                        }}
                                                        icon={<PlusOutlined />}
                                                        disabled={!campaign.whatsapp.send_status}
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
                                                                disabled={!campaign.whatsapp.send_status}
                                                            />
                                                        </Form.Item>
                                                        {fields.length > 1 ? (
                                                            <MinusCircleOutlined
                                                                className="dynamic-delete-button"
                                                                onClick={() => remove(field.name)}
                                                                disabled={!campaign.whatsapp.send_status}
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
                                                            marginLeft: '15%'
                                                        }}
                                                        icon={<PlusOutlined />}
                                                        disabled={!campaign.whatsapp.send_status}
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
                                        name={['column']}
                                        label="Custom Column"
                                        className={"m-t-10"}
                                    >
                                        <Button type="dashed" onClick={handleViewColumnClick}>
                                            Custom Column
                                        </Button>
                                    </Form.Item>
                                    <Form.Item
                                        wrapperCol={{
                                            ...layout.wrapperCol,
                                            offset: 10,
                                        }}
                                    >
                                        <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                            Save Setting
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </> : ''
                    }
                    <Modal
                        title="CUSTOM COLUMN"
                        centered
                        open={open}
                        onOk={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                        width={700}
                        okText="Save"
                        cancelButtonProps={{ style: { display: 'none' } }}
                    >
                        <Table
                            bordered={true}
                            size="small"
                            columns={tblColumns}
                            dataSource={columns}
                            pagination={false}
                            className={"group-setting-form-table"}
                        />
                    </Modal>
                </Col>
            </Row>
        </>
    )
}

export default GroupCampaignSetting;