import {Button, Col, Divider, message, Popconfirm, Radio, Row, Select, Spin, Table} from "antd";
import Path from "./Path/Path";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getCampaigns,
    getGroups, getLastPhone, getSchedulePath,
    getUpload, getWhatsApp,
    updateCampaign,
    updateGroupCampaign, updateGroupCampaignWeekday, updateGroupManuallyCampaigns,
    updateUpload, uploadAfterPreview, uploadOne
} from "../redux/actions";
import axios from "axios";
import {APP_API_URL} from "../constants";
import qs from "qs";
import {EyeOutlined} from "@ant-design/icons";
import GroupCampaignUploadOneByOne from "./GroupCampaignUploadOneByOne";
import MenuList from "./MenuList";
import GroupCampaignUploadAll from "./GroupCampaignUploadAll";
import moment from "moment/moment";
import {DraggableModal, DraggableModalProvider} from "@cubetiq/antd-modal";
import CampaignGetLastPhoneStatusList from "./CampaignGetLastPhoneStatusList";

const Upload = (props) => {
    const [options, setOptions] = useState([]);
    const [way, setWay] = useState('all');
    const [group, setGroup] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [getLastPhoneStatusList, setGetLastPhoneStatusList] = useState([]);
    const [open, setOpen] = useState(false);
    const [getLastPhoneIndex, setGetLastPhoneIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isResumed, setIsResumed] = useState(true);
    const [isClose, setIsClose] = useState(false);
    const [currentController, setCurrentController] = useState('');

    useEffect(function() {
        props.getSchedulePath();
        props.getUpload();
        props.getCampaigns();
        props.getGroups();
        props.getWhatsApp();
    }, []);

    useEffect(function() {
        setGroup(parseInt(props.upload.group));
        setWay(props.upload.way);
    }, [props.upload]);

    useEffect(function() {
        let _options = [];
        props.groups.data.forEach((g, i) => {
            _options.push({
                value: i,
                label: g.name,
            })
        });
        setOptions(_options);

        // initGetLastPhoneStatusList();
    }, [props.groups.data, props.campaigns.data]);

    useEffect(function() {
        let _campaigns = [];
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            props.groups.data[group].campaigns.forEach((c, i) => {
                let campaign = props.campaigns.data[c.index];
                campaign.groupCampaignIndex = i;
                campaign.campaignIndex = c.index;
                campaign.way = c.way;
                campaign.randomFirst = c.randomFirst;
                campaign.randomStart = c.randomStart;
                campaign.randomEnd = c.randomEnd;
                campaign.periodStart = c.periodStart;
                campaign.periodEnd = c.periodEnd;
                campaign.staticCount = c.staticCount;
                campaign.isEditPhone = c.isEditPhone;
                campaign.dayOld = c.dayOld;
                campaign.isTime = c.isTime;
                campaign.time = c.time;
                campaign.meridiem = c.meridiem;
                campaign.comment = c.comment;
                campaign.color = c.color;
                campaign.weekday = c.weekday;
                campaign.isWhatsApp = c.isWhatsApp;
                _campaigns.push(campaign);
            });
        }
        setCampaigns(_campaigns);
    }, [props.groups.data, props.campaigns.data, group]);

    useEffect(function() {
        if (props.groups.data.length > 0) {
            let _options = [];
            props.groups.data.forEach((g, i) => {
                _options.push({
                    value: i,
                    label: g.name,
                })
            });
            setOptions(_options);

            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: campaigns.length,
                },
            });

            let no_column = {
                title: 'no',
                key: 'no',
                width: 30,
                fixed: 'left',
                render: (_, record) => {

                    let number = 0;
                    props.campaigns.data.forEach((c, i) => {
                        if (c.key === record.key) {
                            number = i + 1;
                            return;
                        }
                    })

                    return (
                        <>
                            <span>{number}</span>
                        </>
                    )
                }
            }
            let _columns = [no_column,
                {
                    title: 'Query Name',
                    dataIndex: 'query',
                    key: 'query',
                    width: 350,
                },
                {
                    title: 'Sheet Name',
                    dataIndex: 'schedule',
                    key: 'schedule',
                    width: 200
                },
                {
                    title: 'Sheet URL Count',
                    key: 'url_count',
                    render: (_, r) => {
                        return (
                            <span>{r.urls.length}</span>
                        )
                    },
                    width: 120,
                },
                {
                    title: 'Qty Available',
                    dataIndex: 'last_qty',
                    key: 'last_qty'
                },
                {
                    title: 'Qty Uploaded',
                    dataIndex: 'less_qty',
                    key: 'less_qty'
                },
                {
                    title: 'LastUploadDate',
                    dataIndex: 'lastUploadDateTime',
                    key: 'lastUploadDateTime',
                    render: (_, r) => {
                        return (
                            <span>{r.lastUploadDateTime === "" || r.lastUploadDateTime === undefined ? "" : moment(r.lastUploadDateTime).format('M/D/Y, hh:mm A')}</span>
                        )
                    }
                },
                {
                    title: 'Last Phone',
                    dataIndex: 'last_phone',
                    key: 'last_phone',
                    width: 130
                },
                {
                    title: 'SystemCreateDate',
                    dataIndex: 'SystemCreateDate',
                    key: 'SystemCreateDate',
                    render: (_, r) => {
                        return (
                            <span>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
                        )
                    }
                },
                {
                    title: 'Preview',
                    key: 'operation',
                    fixed: 'right',
                    width: 60,
                    render: (_, record) => {
                        if (props.groups.data[record.lastGroupIndex]) {
                            let campaignIndex = -1;
                            let groupCampaignIndex = -1;

                            props.groups.data[record.lastGroupIndex].campaigns.forEach((c, i) => {
                                if (c.key == record.key) {
                                    groupCampaignIndex = i;
                                    campaignIndex = c.index;
                                }
                            });
                            const previewUrl = "#/preview/" + record.lastGroupIndex + '/' + groupCampaignIndex + '/' + campaignIndex;
                            return (
                                <>
                                    <Button icon={<EyeOutlined /> } href={previewUrl} style={{marginRight: 1}}/>
                                </>
                            )
                        } else {
                            return (
                                <>
                                    <Button disabled={true} icon={<EyeOutlined /> } style={{marginRight: 1}}/>
                                </>
                            )
                        }
                    }
                }
            ]

            setColumns(_columns);
        }
    }, [props.groups, campaigns]);



    const handleGroupChange = function(value) {
        setGroup(value);
        props.updateUpload({group: value});
    }
    const handleWayChange = function(e) {
        setWay(e.target.value);
        props.updateUpload({way: e.target.value});
    }
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };
    const handleUploadAll = function() {
        if (props.upload.selectedCampaignKeys === undefined || props.upload.selectedCampaignKeys.length === 0) {
            messageApi.warning('Please select campaign list.');
            return;
        }

        setLoading(true);
        setTip("Wait for uploading....");
        axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_all', qs.stringify({
            groupIndex: group,
        })).then(function(resp) {
            setLoading(false);
            props.getCampaigns();
            props.getGroups();
            messageApi.success('upload success');
        })
    }
    const handleUploadOneByOne = (data, callback = function() {}) => {
        if (validation()) {
            setLoading(true);
            if (data.manually)
                setTip("Wait for getting data....");
            else
                setTip("Wait for uploading....");

            if (props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') {
                axios.post(APP_API_URL + 'api.php?class=WhatsApp&fn=set_groups').then((resp) => {
                    if (typeof resp.data === "string") {
                        setLoading(false);
                        messageApi.error("Please confirm whatsapp setting");
                        return;
                    } else if (resp.data.error) {
                        setLoading(false);
                        messageApi.error(resp.data.error);
                        return;
                    }
                    axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_one_by_one', qs.stringify(data)).then(function(resp) {
                        props.getCampaigns();
                        props.getGroups();

                        if (data.manually)
                            messageApi.success('Get data success');
                        else
                            messageApi.success('Upload success');
                        setLoading(false);
                        callback();
                    })
                });
            } else {
                axios.post(APP_API_URL + 'api.php?class=Upload&fn=upload_one_by_one', qs.stringify(data)).then(function(resp) {
                    props.getCampaigns();
                    props.getGroups();

                    if (data.manually)
                        messageApi.success('Get data success');
                    else
                        messageApi.success('Upload success');
                    setLoading(false);
                    callback();
                })
            }
        }
    }

    const validation = function() {
        if (props.schedule.path == "") {
            messageApi.warning("Please input schedule sheet url");
            return false;
        }
        if (props.whatsapp.instance_id == "") {
            messageApi.warning("Please input whatsapp instance id");
            return false;
        }
        if (props.whatsapp.token == "") {
            messageApi.warning("Please input whatsapp token");
            return false;
        }
        return true;
    }

    const getLastPhone = (campaign) => {
        setLoading(true);
        setTip("Wait for get last phone....");
        const campaignIndex = campaign.index;
        axios.post(APP_API_URL + 'api.php?class=Upload&fn=get_last_phone', qs.stringify({
            campaignIndex
        })).then(function(resp) {
            props.getCampaigns(function() {
                setLoading(false);
            });
        });
    }

    const initGetLastPhoneStatusList = function() {
        setGetLastPhoneStatusList((oldState) => {
            let newState = [];

            props.groups.data.forEach((g, i) => {
                if (i === parseInt(props.upload.group)) {
                    g.campaigns.forEach((c, j) => {
                        newState.push({
                            no: j + 1,
                            index: j,
                            key: c.key,
                            query: c.key,
                            status: j === 0 ? 'loading' : 'normal'
                        });
                    });
                }
            });
            return newState;
        });
    }

    const updateGetLastPhoneStatus = function(index, data) {
        setGetLastPhoneStatusList((oldState) => {
            let newState = [...oldState];
            return newState.map((u, i) => {
                if (i === index) {
                    if (data === undefined) {
                        u.status = 'error';
                    } else {
                        u.status = 'complete'; u.last_phone = data.last_phone; u.SystemCreateDate = data.SystemCreateDate;
                    }
                }
                if (index + 1 !== newState.length && index + 1 === i) {
                    u.status = 'loading';
                }
                return u;
            })
        })
    }

    const handleOneGetLastPhone = (index) => {
        setGetLastPhoneIndex(index);

        const controller = new AbortController();
        setCurrentController(controller);

        axios.get(APP_API_URL + 'api.php?class=Upload&fn=get_last_phone&campaignIndex=' + index, {
            signal: controller.signal,
        }).then(function(resp) {
            if (typeof resp.data === "string") {
                updateGetLastPhoneStatus(index);
                props.getCampaigns();

                props.getUpload(function(uploadConfig) {
                    if (uploadConfig.pause_get_last_phone_index != index) {
                        if (props.campaigns.data.length === (index + 1)) {
                            setIsClose(true);
                            setTimeout(function() {
                                messageApi.success('Get all last phone success');
                            }, 1000);
                        } else {
                            handleOneGetLastPhone(parseInt(index) + 1);
                        }
                    } else {
                        props.updateUpload({resume_get_last_phone_index: index, pause_get_last_phone_index: -1});
                    }
                })
            } else {
                updateGetLastPhoneStatus(index, resp.data.campaign);
                props.getCampaigns();

                if (resp.data.config.pause_get_last_phone_index != index) {
                    if (props.campaigns.data.length === (index + 1)) {
                        setIsClose(true);
                        setTimeout(function() {
                            messageApi.success('Get all last phone success');
                        }, 1000);
                    } else {
                        handleOneGetLastPhone(parseInt(index) + 1);
                    }
                } else {
                    props.updateUpload({resume_get_last_phone_index: index, pause_get_last_phone_index: -1});
                }
            }
        });
    }

    const handleAllGetLastPhone = () => {
        setIsPaused(false);
        setIsResumed(true);

        initGetLastPhoneStatusList();
        handleOneGetLastPhone(0);
        setIsClose(false);
        setOpen(true);
    }

    const pause = function() {
        setIsPaused(true);
        setIsResumed(false);

        props.updateUpload({pause_get_last_phone_index: getLastPhoneIndex, resume_get_last_phone_index: -1});
    }

    const resume = function() {
        setIsPaused(false);
        setIsResumed(true);

        props.getUpload(function(config) {
            if (config.resume_get_last_phone_index !== undefined && parseInt(config.resume_get_last_phone_index) !== -1) {
                if (props.campaigns.data.length === (parseInt(config.resume_get_last_phone_index) + 1)) {
                    setTimeout(function () {
                        setIsClose(true);
                        messageApi.success('Get all last phone success');
                    }, 1000)
                } else {
                    handleOneGetLastPhone(parseInt(config.resume_get_last_phone_index) + 1);
                }
            }
            props.updateUpload({resume_get_last_phone_index: -1, pause_get_last_phone_index: -1});
        })
    }

    const cancel = function() {
        props.updateUpload({resume_get_last_phone_index: -1, pause_get_last_phone_index: -1});

        props.getCampaigns();

        currentController.abort();
        setOpen(false);
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <MenuList
                currentPage="upload"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={2} offset={1} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '0.7rem', marginLeft: '1.8rem'}}>
                    <span>Select Group :</span>
                </Col>
                <Col span={3}>
                    <Select
                        size="large"
                        defaultValue=""
                        onChange={handleGroupChange}
                        style={{ width: 200 }}
                        options={options}
                        value={group}
                    />
                </Col>
                <Col span={2} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '0.7rem', marginLeft: '-3rem'}}>
                    <span>Send Type :</span>
                </Col>
                <Col span={4}>
                    <Radio.Group onChange={handleWayChange} defaultValue="all" value={way}>
                        <Radio value="all">Upload all campaigns</Radio>
                        <Radio value="one">Upload one by one</Radio>
                    </Radio.Group>
                </Col>
            </Row>
            <Row>
                <Popconfirm
                    title="All Last Phone"
                    description="Are you sure to get last phone of all campaigns?"
                    onConfirm={handleAllGetLastPhone}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" style={{display: "flex", marginLeft: "auto", marginRight: "10px"}}>All Last Phone</Button>
                </Popconfirm>
            </Row>
            {
                props.groups.data.length > 0 && props.campaigns.data.length > 0 && way === 'all' ?
                    <GroupCampaignUploadAll
                        schedule={props.schedule}
                        whatsapp={props.whatsapp}
                        campaigns={campaigns}
                        groupIndex={group}
                        globalCampaigns={props.campaigns.data}
                        group={props.groups.data[group]}
                        upload={handleUploadAll}
                        uploadInfo={props.upload}
                        updateCampaign={props.updateCampaign}
                        updateUpload={props.updateUpload}
                        updateGroupCampaign={props.updateGroupCampaign}
                        updateGroupManuallyCampaigns={props.updateGroupManuallyCampaigns}
                        uploadOne={props.uploadOne}
                        getLastPhone={getLastPhone}
                        getCampaigns={props.getCampaigns}
                        updateGroupCampaignWeekday={props.updateGroupCampaignWeekday}
                        getUpload={props.getUpload}
                        setTip={setTip}
                        setLoading={setLoading}
                    /> : ''
            }
            {
                props.groups.data.length > 0 && props.campaigns.data.length > 0 && way === 'one' ?
                    <GroupCampaignUploadOneByOne
                        whatsapp={props.whatsapp}
                        campaigns={campaigns}
                        groupIndex={group}
                        globalGroups={props.groups.data}
                        globalCampaigns={props.campaigns.data}
                        group={props.groups.data[group]}
                        upload={handleUploadOneByOne}
                        updateCampaign={props.updateCampaign}
                        updateUpload={props.updateUpload}
                        updateGroupCampaign={props.updateGroupCampaign}
                        getLastPhone={getLastPhone}
                        uploadAfterPreview={props.uploadAfterPreview}
                        getCampaigns={props.getCampaigns}
                        updateGroupCampaignWeekday={props.updateGroupCampaignWeekday}
                    /> : ''
            }
            <Row style={{marginTop: 10}}>
                <Col span={22} offset={1}>
                    <Divider style={{fontSize: '0.8rem'}}>LAST CAMPAIGNS INFO</Divider>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.campaigns.data}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table"
                    />
                </Col>
            </Row>

            <DraggableModalProvider>
                <DraggableModal
                    title="GET LAST PHONE STATUS LIST"
                    open={open}
                    header={null}
                    footer={null}
                    closable={false}
                >
                    <CampaignGetLastPhoneStatusList
                        onPause={pause}
                        isPaused={isPaused}
                        onResume={resume}
                        isResumed={isResumed}
                        onCancel={cancel}
                        isClose={isClose}
                        setOpen={setOpen}
                        getLastPhoneStatusList={getLastPhoneStatusList}
                        getLastPhoneIndex={getLastPhoneIndex}
                    />
                </DraggableModal>
            </DraggableModalProvider>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups, upload: state.upload, schedule: state.schedule, whatsapp: state.whatsapp };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getGroups, getUpload, updateUpload, updateGroupCampaign, updateGroupManuallyCampaigns, updateCampaign, getLastPhone, uploadAfterPreview, uploadOne, getSchedulePath, updateGroupCampaignWeekday, getWhatsApp }
)(Upload);