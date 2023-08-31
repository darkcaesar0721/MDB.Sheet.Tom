import {Button, Checkbox, Col, Form, Input, message, Modal, Radio, Row, Select, Spin, Switch, Table} from "antd";
import Path from "./Path/Path";
import {connect} from "react-redux";
import {getCampaigns, getGroups, getWhatsApp, updateCampaign} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import MenuList from "./MenuList";
import moment from "moment";
import axios from "axios";
import {APP_API_URL} from "../constants";
import dragula from "dragula";
import "dragula/dist/dragula.css";
import {CheckOutlined, CloseOutlined, MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";

let current_date = new Date()
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
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
        span: 14,
    },
    wrapperCol: {
        span: 8,
    },
};

const meridiemOption = [
    {value: 'AM', label: 'AM'},
    {value: 'PM', label: 'PM'},
];

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

const GroupEditSetting = (props) => {
    const [way, setWay] = useState('all'); //all,static,random
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState([]);
    const [staticCount, setStaticCount] = useState(1);
    const [isTime, setIsTime] = useState(false);
    const [time, setTime] = useState('');
    const [meridiem, setMeridiem] = useState('AM');
    const [dayOld, setDayOld] = useState(1);
    const [loading, setLoading] = useState(false);
    const [tblColumns, setTblColumns] = useState([]);
    const [isWhatsApp, setIsWhatsApp] = useState(false);

    const {campaignIndex, groupIndex} = useParams();
    const navigate = useNavigate();

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
        props.getWhatsApp();
    }, []);

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
            const selectedCampaign = props.campaigns.data[campaignIndex];
            setColumns(selectedCampaign.group.columns.map(c => {
                if (c.key === undefined || c.key === "") return Object.assign({...c}, {display: c.display ==='true', key: c.name})
                else return Object.assign({...c}, {display: c.display ==='true'})
            }));

            setIsWhatsApp((props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') && (selectedCampaign.group.isWhatsApp === 'true' || selectedCampaign.group.isWhatsApp === true));

            if (selectedCampaign.group.whatsapp_message === undefined) selectedCampaign.group.whatsapp_message = props.whatsapp.default_message;
            if (selectedCampaign.group.whatsapp_people === undefined) selectedCampaign.group.whatsapp_people = [''];
            if (selectedCampaign.group.whatsapp_groups === undefined) selectedCampaign.group.whatsapp_groups = [''];

            form.setFieldsValue(selectedCampaign.group);

            setWay(selectedCampaign.group.way);
            setStaticCount(selectedCampaign.group.staticCount);
            setDayOld(selectedCampaign.group.dayOld);
            setMeridiem(!selectedCampaign.group.meridiem ? 'AM' : selectedCampaign.group.meridiem);
            setTime(selectedCampaign.group.time);
            setIsTime(selectedCampaign.group.isTime == "true");
        }
    }, [props.campaigns.data, props.whatsapp]);

    const handleSubmit = (form) => {
        if (validation(form)) {
            let campaign = props.campaigns.data[campaignIndex];

            let group = {};
            group.way = way;
            group.columns = columns;
            switch (way) {
                case 'static':
                    group['staticCount'] = staticCount;
                    break;
                case 'random':
                    group['randomStart'] = form.randomStart;
                    group['randomEnd'] = form.randomEnd;
                    break;
                case 'random_first':
                    group['randomFirst'] = form.randomFirst;
                    group['randomStart'] = form.randomStart;
                    group['randomEnd'] = form.randomEnd;
                    break;
                case 'date':
                    group['isTime'] = isTime;
                    group['dayOld'] = !dayOld ? 0: dayOld;
                    group['time'] = time;
                    group['meridiem'] = meridiem;
                    if (isTime) {
                        group['date'] = moment(pstDate).add(0 - dayOld, 'day').format('MM/DD/YYYY');
                    } else {
                        group['date'] = moment(pstDate).add(0 - (parseInt(dayOld) + 1), 'day').format('MM/DD/YYYY');
                    }
                    break;
                case 'period':
                    group['periodStart'] = form.periodStart;
                    group['periodEnd'] = form.periodEnd;
                    break;
            }
            group.isWhatsApp = form.isWhatsApp;
            group.whatsapp_message = form.whatsapp_message;
            group.whatsapp_people = form.whatsapp_people;
            group.whatsapp_groups = form.whatsapp_groups;

            props.updateCampaign(campaign['file_name'], {}, group, function () {
                messageApi.success('save success');
                setTimeout(function () {
                    navigate('/groups/' + groupIndex + '/status/fix');
                }, 1000);
            });
        }
    }

    const validation = (form) => {
        if (form.way === 'static') {
            if (!form.staticCount) {
                messageApi.warning('Please input static count.');
                return false;
            }
        }
        if (form.way === 'random' || form.way === 'random_first') {
            if (!form.randomStart) {
                messageApi.warning('Please input random start count.');
                return false;
            }
            if (!form.randomEnd) {
                messageApi.warning('Please input random end count.');
                return false;
            }
            if (parseInt(form.randomStart) > parseInt(form.randomEnd)) {
                messageApi.warning('Random start count must be less than random end count.');
                return false;
            }
        }
        if (form.way === 'random_first') {
            if (!form.randomFirst) {
                messageApi.warning('Please input random first count.');
                return false;
            }
            if (parseInt(form.randomEnd) > parseInt(form.randomFirst)) {
                messageApi.warning('Random end count must be less than random first count.');
                return false;
            }
        }
        if (form.way === 'date') {
            if (!dayOld && !isTime) {
                messageApi.warning('Please input time field');
                return false;
            }
            if (isTime && !time) {
                messageApi.warning('Please input time field.');
                return false;
            }
        }
        if (form.way === 'period') {
            if (!form.periodStart) {
                messageApi.warning('Please input period start value.');
                return false;
            }
            if (!form.periodEnd) {
                messageApi.warning('Please input period end value.');
                return false;
            }
            if (parseInt(form.periodStart) > parseInt(form.periodEnd)) {
                messageApi.warning('Period start value must be less than period end value.');
                return false;
            }
        }
        if (columns.length === 0) {
            messageApi.warning('Please select columns.');
            return false;
        }
        return true;
    }

    const handleWayChange = (e) => {
        setWay(e.target.value);
    }

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

    const handleIsTimeCheck = function(e) {
        setIsTime(e.target.checked);
    }

    const handleTimeChange = function(e) {
        setTime(e.target.value);
    }

    const handleDayOldChange = function(e) {
        setDayOld(e.target.value);
    }

    const handleMeridiemChange = function(value) {
        setMeridiem(value);
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
                currentPage="group"
            />
            <Path/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.campaigns.data.length  > 0 && props.groups.data.length > 0 ?
                            <Form
                                {...layout}
                                name="add_group_form"
                                onFinish={handleSubmit}
                                className="group-setting-form"
                                form={form}
                            >
                                <Form.Item
                                    name={['group']}
                                    label="Group Name"
                                >
                                    <span>{props.groups.data[groupIndex].name}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['query']}
                                    label="Query Name"
                                >
                                    <span>{props.campaigns.data[campaignIndex].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['urls']}
                                    label="Sheet URLS"
                                >
                                    {
                                        props.campaigns.data[campaignIndex].urls.map(url => {
                                            return (
                                                <div key={url}>
                                                    <span>{url}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </Form.Item>
                                <Form.Item
                                    name={['schedule']}
                                    label="Sheet Name"
                                >
                                    <span>{props.campaigns.data[campaignIndex].schedule}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Send Type"
                                >
                                    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>
                                        <Radio value="all">All</Radio>
                                        <Radio value="static">Static</Radio>
                                        <Radio value="random">Random</Radio>
                                        <Radio value="random_first">Random First Select</Radio>
                                        <Radio value="date">Date & Time</Radio>
                                        <Radio value="period">Date Period</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {
                                    way === 'static' ?
                                        <Form.Item
                                            name={['staticCount']}
                                            label="Static Count"
                                        >
                                            <Row>
                                                <Col span={4}>
                                                    <Input style={{width: '100%'}} placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                                </Col>
                                            </Row>
                                        </Form.Item> : ''
                                }
                                {
                                    way === 'random' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomStart']}
                                                label="Random Count"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(5% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(13% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'random_first' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomFirst']}
                                                label="Random First"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="First"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomStart']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="Start"/>
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
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'date' ?
                                        <Form.Item label="Days Old" name={['date']} valuePropName="checked">
                                            <Row>
                                                <Col span={3}>
                                                    <Input placeholder="Days Old" value={dayOld} onChange={handleDayOldChange}/>
                                                </Col>
                                                <Col span={1} offset={1}>
                                                    <Checkbox checked={isTime} onChange={handleIsTimeCheck} style={{paddingTop: '0.3rem'}}></Checkbox>
                                                </Col>
                                                <Col span={2}>
                                                    <Input disabled={!isTime} placeholder="Time" value={time} onChange={handleTimeChange}/>
                                                </Col>
                                                <Col span={2}>
                                                    <Select
                                                        size="middle"
                                                        defaultValue="AM"
                                                        onChange={handleMeridiemChange}
                                                        style={{ width: 70 }}
                                                        options={meridiemOption}
                                                        value={meridiem}
                                                        disabled={!isTime}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Item> : ''
                                }
                                {
                                    way === 'period' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['periodStart']}
                                                label="Date Period"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="Start"/>
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
                                                name={['periodEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(13% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
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
                                                    {...(index === 0 ? layout : layoutWithOutLabel)}
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
                                                        marginLeft: '20%'
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
                                                    {...(index === 0 ? layout : layoutWithOutLabel)}
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
                                                        marginLeft: '20%'
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
                                <Form.Item
                                    name={['column']}
                                    label="Custom Column"
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
                                    <Button type="dashed" href={"#/groups/" + groupIndex + '/status/fix'}>
                                        Cancel
                                    </Button>
                                </Form.Item>
                            </Form> : ''
                    }
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
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups, whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign, getGroups, getWhatsApp }
)(GroupEditSetting);