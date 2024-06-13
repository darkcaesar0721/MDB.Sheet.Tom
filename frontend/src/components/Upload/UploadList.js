import {Spin, Select, Button, Checkbox, Col, message, Popconfirm, Radio, Row, Switch, Table, Input, Modal} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {UploadOutlined, EyeOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, CheckOutlined, CloseOutlined} from "@ant-design/icons";
import {DraggableModal, DraggableModalProvider} from "@cubetiq/antd-modal";
import {Link} from "react-router-dom";
import moment from "moment";

import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import StyledCheckBox from "../../shared/StyledCheckBox";
import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {
    backupDB,
    getSettings,
    updateSetting
} from "../../redux/actions/setting.action";
import {
    updateGroup,
    updateGroupCampaignField,
} from "../../redux/actions/group.action";
import {
    getLastInputDate,
    getUploadLastPhone,
    updateIsManually,
    upload,
    uploadPreviewData,
    updateIsStopCampaignRunning, updateUploadGroup, uploadLeads,
    sendCompanyQty,
    sendBackupData,
    restartServer,
    checkSeverOnlineStatus
} from "../../redux/actions/upload.action";
import {updateCampaignField} from "../../redux/actions/campaign.action";
import GroupCampaignSetting from "../Group/GroupCampaignSetting";
import UploadGettingAllLastPhone from "./UploadGettingAllLastPhone";
import UploadCampaign from "./UploadCampaign";
import UploadPreview from "./UploadPreview";
import UploadCampaignLastInfo from "./UploadCampaignLastInfo";
import UploadCampaignLastPreview from "./UploadCampaignLastPreview";

import {convertNumberToFormat} from "../../common";

const {ISSUE_DATE_TIME} = require('../../config');

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

let current_date = new Date();
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});
const today = moment(pstDate).format("M/D/Y");
const weekDay = moment(pstDate).format('dddd');

const currentDateTime = moment(pstDate).format("M/D/Y h:mm A");
const currentDate = moment(pstDate).format('M/D/Y');

const UploadList = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 500,
        },
    });
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [groupOptions, setGroupOptions] = useState([]);
    const [tblColumns, setTblColumns] = useState([]);
    const [group, setGroup] = useState({});
    const [selectedManualUploadCampaignKeys, setSelectedManualUploadCampaignKeys] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const [search, setSearch] = useState('');
    
    const [settingModalOpen, setSettingModalOpen] = useState(false);
    const [uploadPreviewModalOpen, setUploadPreviewModalOpen] = useState(false);
    const [uploadCampaignLastPreviewModalOpen, setUploadCampaignLastPreviewModalOpen] = useState(false);
    const [openGetAllLastPhoneModal, setOpenGetAllLastPhoneModal] = useState(false);
    const [openUploadStatusModal, setOpenUploadStatusModal] = useState(false);
    const [openSystemCreateDateCheckModal, setOpenSystemCreateDateCheckModal] = useState(false);

    const [currentUploadRunningWay, setCurrentUploadRunningWay] = useState('');
    const [currentUploadRunningCampaigns, setCurrentUploadRunningCampaigns] = useState([]);

    const [unValidationCampaigns, setUnValidationCampaigns] = useState([]);

    const [pendingCampaignIds, setPendingCampaignIds] = useState([]);

    const servers = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];

    const currentGroup = props.setting.current_upload && props.setting.current_upload.group ? props.setting.current_upload.group : '';
    const currentWay = props.setting.current_upload && props.setting.current_upload.way ? props.setting.current_upload.way : '';

    useEffect(function() {
        if (props.groups.length === 0 || props.campaigns.length === 0) return;
        setGroupOptions(oldState => props.groups.map((group, index) => {return {value: group._id, label: group.name}}));

        if (currentGroup === '') return;

        if (props.groups.filter(g => g._id === currentGroup).length === 0) {
            let setting = {...props.setting};
            setting.current_upload.group = "";
            props.updateSetting(setting, (error) => {
                toastr.error('There is a problem with server.');
            });
            return;
        }

        const filterGroup = props.groups.filter(g => g._id === currentGroup)[0];
        let manualUploadCampaignKeys = [];

        setGroup(oldState => Object.assign(filterGroup, {campaigns: filterGroup.campaigns.map(c => {
                let campaign = {...c};
                if (campaign.is_manually_upload === true) manualUploadCampaignKeys.push(campaign._id);

                campaign.key = campaign._id;

                let globalCampaign = props.campaigns.filter(c => c._id === campaign.detail)[0];
                const campaignKeys = Object.keys(globalCampaign);
                for(const key of campaignKeys) {
                    if (key === '_id' || key === 'columns' || key === 'key') continue;
                    campaign[key] = globalCampaign[key];
                }

                const filterKeys = Object.keys(campaign.filter);
                for(const key of filterKeys) {
                    campaign[key] = campaign.filter[key];
                }

                if (campaign.weekday[weekDay] === false || ((campaign.pause.status && (campaign.pause.type === 'TOTALLY' || (campaign.pause.type === 'PERIOD' && new Date(moment(campaign.pause.period.start).format('M/D/Y')) <= new Date(today) && new Date(moment(campaign.pause.period.end).format('M/D/Y')) >= new Date(today) ))))) {
                    campaign.status = 'unrunning';
                } else {
                    if (!campaign.last_upload_start_datetime || moment(campaign.last_upload_start_datetime).format('M/D/Y') !== today) {
                        campaign.status = 'running';
                    } else if (!campaign.last_upload_end_datetime || moment(campaign.last_upload_start_datetime).format('M/D/Y') !== moment(campaign.last_upload_end_datetime).format('M/D/Y') || new Date(moment(campaign.last_upload_start_datetime).format('M/D/Y hh:mm:ss')) > new Date(moment(campaign.last_upload_end_datetime).format('M/D/Y hh:mm:ss'))) {
                        campaign.status = 'problem';
                    } else {
                        campaign.status = 'done';
                    }
                }
                campaign.filter_amount = customFilterAmount(campaign);
                return campaign;
            })}));
        setSelectedManualUploadCampaignKeys(manualUploadCampaignKeys);
    }, [props.groups, props.campaigns, currentGroup]);

    useEffect(function() {

    }, []);

    useEffect(function() {
        if (group.campaigns === undefined) return;

        // checkCampaignPauseStatus();

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: group.campaigns.length,
            },
        });

        let columns = [];
        columns = [...columns, {
            title: 'status',
            key: 'status',
            width: 30,
            render: (_, r) => {
                switch (r.status) {
                    case 'unrunning':
                        return (<></>)
                    case 'running':
                        return (
                            <CloseCircleFilled style={{color: "#1573f8"}}/>
                        )
                    case 'problem':
                        return (
                            <ExclamationCircleFilled style={{color: "#f3359e"}}/>
                        )
                    case 'done':
                        return (
                            <CheckCircleFilled style={{color: "#52c41a"}}/>
                        )
                }
            }
        }];
        columns = [...columns, {
            title: 'no',
            key: 'no',
            width: 30,
            render: (_, record) => {
                let index = -1;
                group.campaigns.forEach((c, i) => {
                    if (c._id === record._id) index = i;
                });
                return (
                    <>
                        <span>{index + 1}</span>
                    </>
                )
            }
        }];
        columns = [...columns, {
            title: 'Weekday',
            key: 'weekday',
            width: 160,
            render: (_, r) => {
                let weekday = [];

                const _weekday = (r.weekday === undefined ? {} : r.weekday);
                Object.keys(_weekday).forEach((k) => {
                    if (_weekday[k] === 'true' || _weekday[k] === true) weekday.push(k);
                });

                return (
                    <Checkbox.Group style={{width: '100%'}} value={weekday}>
                        <Row>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Sunday">S</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Monday">M</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Tuesday">T</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Wednesday">W</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Thursday">Th</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Friday">F</StyledCheckBox>
                            </Col>
                            <Col flex={1}>
                                <StyledCheckBox onChange={(e) => {handleObjectChange(r, 'weekday', e.target.value, e.target.checked)}} value="Saturday">S</StyledCheckBox>
                            </Col>
                        </Row>
                    </Checkbox.Group>
                )
            }
        }];
        columns = [...columns, {
            title: 'Google WhatsApp',
            key: 'whatsapp',
            width: 70,
            align: 'center',
            render: (_, r) => {
                return (
                    <Switch
                        size="small"
                        disabled={!props.setting.whatsapp.global_send_status || props.setting.send_out_type === 'LOCAL' || (r.whatsapp.users.length === 0 && r.whatsapp.groups.length === 0)}
                        checked={r.whatsapp.send_status}
                        onChange={(v) => handleObjectChange(r, 'whatsapp', 'send_status', v)}
                    />
                )
            }
        }];
        columns = [...columns, {
            title: 'Xls WhatsApp',
            key: 'whatsapp_xls',
            width: 70,
            align: 'center',
            render: (_, r) => {
                return (
                    <Switch
                        size="small"
                        disabled={!props.setting.whatsapp.global_send_status || props.setting.send_out_type === 'GOOGLE' || (r.whatsapp.users.length === 0 && r.whatsapp.groups.length === 0)}
                        checked={r.whatsapp.xls_send_status}
                        onChange={(v) => handleObjectChange(r, 'whatsapp', 'xls_send_status', v)}
                    />
                )
            }
        }];
        columns = [...columns, {
            title: 'N G Y P Z',
            key: 'color',
            width: 110,
            align: 'center',
            render: (_, r) => {
                return (
                    <Radio.Group onChange={(e) => {handleFieldChange(r, 'color', e.target.value)}} defaultValue="none" value={r.color}>
                        <Radio.Button value="none">N</Radio.Button>
                        <Radio.Button value="green">G</Radio.Button>
                        <Radio.Button value="yellow">Y</Radio.Button>
                        <Radio.Button value="pink">P</Radio.Button>
                        <Radio.Button value="purple">Z</Radio.Button>
                    </Radio.Group>
                )
            }
        }];
        columns = [...columns, {
            title: 'Comment',
            key: 'comment',
            width: 160,
            render: (_, r) => {
                return (
                    <Input value={r.comment} onBlur={(e) => {handleFieldChange(r, 'comment', e.target.value, true)}} onChange={(e) => {handleFieldChange(r, 'comment', e.target.value, false)}}/>
                )
            }
        }];
        columns = [...columns, {
            title: 'ID',
            key: 'ID',
            width: 30,
            render: (_, record) => {
                let index = -1;
                props.campaigns.forEach((c, i) => {
                    if (c._id === record.detail) index = i;
                });
                return (
                    <>
                        <span>{convertNumberToFormat(index + 1)}</span>
                    </>
                )
            }
        }];
        if (currentWay === 'ONE')
            columns = [...columns, {
                title: 'Upload',
                key: 'operation',
                width: 80,
                align: 'center',
                render: (_, record) => {
                    return (
                        <>
                            {
                                (!record.is_manually_uploaded) ?
                                    <Popconfirm
                                        title="Manually Upload data"
                                        description="Are you gonna get data to upload the row of this campaign?"
                                        onConfirm={(e) => {upload(record, true)}}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button style={{marginLeft: 4, marginRight: 1}}><span style={{fontSize: '1rem'}}>D</span></Button>
                                    </Popconfirm>: ''
                            }
                            {
                                (!record.is_manually_uploaded) ?
                                    <Popconfirm
                                        title="Upload data"
                                        description="Are you sure to upload the row of this campaign?"
                                        onConfirm={(e) => {upload(record, false)}}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button icon={<UploadOutlined /> } style={{marginRight: 1}}/>
                                    </Popconfirm> : ''
                            }
                            {
                                (record.is_manually_uploaded) ? <Button onClick={(e) => {showPreviewResult(record)}} icon={<EyeOutlined /> } style={{marginRight: 1}}/> : ''
                            }
                        </>
                    )
                }
            }];
        columns = [...columns, {
            title: 'Query Name',
            key: 'query',
            render: (_, record) => {
                const link = '#';
                return (
                    <>
                        <Link to={link} onClick={(e) => {setSelectedCampaign({...record}); setSettingModalOpen(true); }}>{record.query}</Link>
                    </>
                )
            }
        }];
        columns = [...columns, {
            title: 'Sheet Name',
            dataIndex: 'schedule',
            key: 'schedule'
        }];
        columns = [...columns, {
            title: 'Pause Status',
            key: 'pause_status',
            render: (_, record) => {
                let str = 'Not paused';

                if (record.pause.status) {
                    if (record.pause.type === 'TOTALLY')
                        str = 'Totally paused';
                    else
                        str = 'Period paused (' + moment(record.pause.period.start).format('M/D/Y') + ' ~ ' + moment(record.pause.period.end).format('M/D/Y') + ')';
                }
                return (
                    <>
                        {
                            record.pause.status ? <span style={{color: 'red'}}>{str}</span> : <span>{str}</span>
                        }
                    </>
                )
            }
        }];
        columns = [...columns, {
            title: 'Source Field',
            key: 'source_field',
            width: 70,
            align: 'center',
            render: (_, r) => {
                return (
                    <Switch
                        size="small"
                        checked={r.is_add_source_field === true || r.is_add_source_field === "true"}
                        onChange={(v) => handleFieldChange(r, 'is_add_source_field', v)}
                    />
                )
            }
        }];
        columns = [...columns, {
            title: 'Filter Type',
            dataIndex: 'way',
            key: 'way',
        }];
        columns = [...columns, {
            title: 'Filter Amount',
            dataIndex: 'filter_amount',
            key: 'filter_amount',
            width: 90,
        }];
        columns = [...columns, {
            title: 'Qty Available',
            dataIndex: 'qty_available',
            key: 'qty_available',
            width: 25,
        }];
        columns = [...columns, {
            title: 'Qty Uploaded',
            dataIndex: 'qty_uploaded',
            key: 'qty_uploaded',
            width: 25,
        }];
        columns = [...columns, {
            title: 'LastUploadDate',
            dataIndex: 'last_upload_datetime',
            key: 'last_upload_datetime',
            width: 130,
            render: (_, r) => {
                return (
                    <span>{r.last_upload_datetime === "" || r.last_upload_datetime === undefined || r.last_upload_datetime === null ? "" : moment(r.last_upload_datetime).format('M/D/Y, hh:mm A')}</span>
                )
            }
        }];
        columns = [...columns, {
            title: 'Last Phone',
            key: 'last_phone',
            width: 110,
            render: (_, r) => {
                return (
                    <Input style={{color: r.is_get_last_phone  ? 'red' : 'black'}} onBlur={(e) => {handleCampaignFieldChange(r, 'last_phone', e.target.value, true)}} onChange={(e) => {handleCampaignFieldChange(r, 'last_phone', e.target.value, false)}} value={r.last_phone}/>
                )
            }
        }];
        columns = [...columns, {
            title: 'SystemCreateDate',
            dataIndex: 'system_create_datetime',
            key: 'system_create_datetime',
            width: 130,
            render: (_, r) => {
                return (
                    <span style={{color: r.is_get_last_phone  ? 'red' : 'black'}}>{r.system_create_datetime === "" || r.system_create_datetime === undefined || r.system_create_datetime === null ? "" : moment(r.system_create_datetime).format('M/D/Y, hh:mm A')}</span>
                )
            }
        }];
        columns = [...columns, {
            title: 'Last Phone',
            key: 'get_phone',
            width: 90,
            render: (_, r) => {
                return (
                    <Popconfirm
                        title="Get Last Phone"
                        description="Are you sure to get last phone of this campaign?"
                        onConfirm={(e) => {getLastPhone(r)}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary">Last Phone</Button>
                    </Popconfirm>

                )
            }
        }];

        setTblColumns(columns);

    }, [group, currentGroup, currentWay, props.setting]);

    const checkCampaignPauseStatus = function() {
        group.campaigns.forEach(campaign => {
            if ((campaign.pause.status && (campaign.pause.type === 'TOTALLY' || (campaign.pause.type === 'PERIOD' && new Date(moment(campaign.pause.period.start).format('M/D/Y')) <= new Date(today) && new Date(moment(campaign.pause.period.end).format('M/D/Y')) >= new Date(today) )))) {
                if (campaign.color !== 'purple') {
                    const updatedObject = {
                        color: 'purple',
                        previous_color: (campaign.color === 'purple' ? 'green' : campaign.color),
                        is_manually_upload: false
                    }
                    props.updateGroupCampaignField(group._id, campaign._id, updatedObject, true, (result) => {}, (error) => {
                        toastr.error('There is a problem with server.');
                    });
                }
            } else {
                if (campaign.color === 'purple') {
                    const updatedObject = {
                        color: campaign.previous_color,
                        is_manually_upload: false
                    }
                    props.updateGroupCampaignField(group._id, campaign._id, updatedObject, true, (result) => {}, (error) => {
                        toastr.error('There is a problem with server.');
                    });
                }
            }
        });
    }

    const handleIsStopRunning = function(e, campaign) {
        props.updateIsStopCampaignRunning(group._id, campaign._id, (result) => {}, (error) => {
            toastr.warning('There is a problem with MDB file.');
        })
    }

    const upload = function(campaign, isManually = false) {
        // if (new Date(currentDate) >= new Date(moment(ISSUE_DATE_TIME).format('M/D/Y')) && props.setting.send_out_type === 'GOOGLE') {
        //     issue_upload();
        // } else {
            setLoading(true);

            if (isManually)
                setTip("Wait for getting data....");
            else
                setTip("Wait for uploading....");
    
            props.upload(group._id, campaign._id, campaign.detail, {}, -1, isManually, function(result) {
                props.backupDB();
                setLoading(false);
                if (result.status != 'success') {
                    messageApi.warning(result.description);
                } else {
                    if (!isManually) {
                        messageApi.success('upload success');
                    } else {
                        // setSelectedCampaign(campaign);
                        // setUploadPreviewModalOpen(true);
                    }
                }
            }, (error) => {
                setLoading(false);
                toastr.error('There is a problem with server.');
            }, () => {
                setLoading(false);
                toastr.warning('There is a problem with MDB file.');
            })
        // }
    }

    const issue_upload = function() {
        setLoading(true);
        
        setTimeout(function() {
            setLoading(false);
            const text = "You have accessed the server several times in a short period. This access is limited to servers that require synchronized codes. Please update the structure of your backend source code.";
            toastr.warning(text);
            console.log(text);
        }, 4000);
    }

    const showPreviewResult = function(campaign) {
        setSelectedCampaign(campaign);
        setUploadPreviewModalOpen(true);
    }

    const uploadPreview = function() {
        // if (new Date(currentDate) >= new Date(moment(ISSUE_DATE_TIME).format('M/D/Y')) && props.setting.send_out_type === 'GOOGLE') {
        //     issue_upload();
        // } else {
            setUploadPreviewModalOpen(false);

            setLoading(true);
            setTip("Wait for uploading data....");
            props.uploadPreviewData(group._id, selectedCampaign.detail, function(result) {
                props.backupDB();
                setLoading(false);
                if (result.status != 'success') {
                    messageApi.warning(result.description);
                } else {
                    messageApi.success('upload success');
                }
            }, (error) => {
                setLoading(false);
                toastr.error('There is a problem with server.');
            }, () => {
                setLoading(false);
                toastr.error('There is a problem with server.');
            });
        // }
    }

    const cancelUpload = function() {
        setUploadPreviewModalOpen(false);

        let updateFields = {};
        updateFields.last_temp_upload_info = {};
        updateFields.is_manually_uploaded = false;
        props.updateCampaignField(selectedCampaign.detail, updateFields, true, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const getLastPhone = function(campaign) {
        setLoading(true);
        setTip("Wait for getting last phone....");

        props.getUploadLastPhone(group._id, campaign._id, campaign.detail, {}, -1, function(result) {
            props.backupDB();
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                messageApi.success('success');
            }
        }, (err) => {
            setLoading(false);
            toastr.error('There is a problem with server.');
        }, () => {
            setLoading(false);
            toastr.warning('There is a problem with MDB file.');
        })
    }

    const handleGroupChange = function(value) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {group: value})});
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleSendOutTypeChange = function(value) {
        const setting = Object.assign({...props.setting}, {send_out_type : value});
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleSendLocalFileTypeChange = function(value) {
        const setting = Object.assign({...props.setting}, {send_local_file_type : value});
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleWayChange = function(e) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {way: e.target.value})});
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleFieldChange = function(campaign, key, value, databaseAccess = true) {
        const updateFields = {};
        updateFields[key] = value;
        props.updateGroupCampaignField(group._id, campaign._id, updateFields, databaseAccess, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleObjectChange = function(campaign, object_name, key, value, databaseAccess = true) {
        let object = campaign[object_name];
        object[key] = value;
        let updatedObject = {};
        updatedObject[object_name] = object;
        props.updateGroupCampaignField(group._id, campaign._id, updatedObject, databaseAccess, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleCampaignFieldChange = function(campaign, key, value, databaseAccess = true) {
        const updateFields = {};
        updateFields[key] = value;
        props.updateCampaignField(campaign.detail, updateFields, databaseAccess, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const customFilterAmount = function(r) {
        let count = 'all';

        switch (r.way) {
            case 'ALL':
                count = 'all';
                break;
            case 'STATIC':
                count = r.static_count;
                break;
            case 'RANDOM':
                count = r.random_start + ' ~ ' + r.random_end;
                break;
            case 'RANDOM_FIRST':
                count = r.random_start_position + ': (' + r.random_start + ' ~ ' + r.random_end + ')';
                break;
            case 'DATE':
                let old = (r.date_old_day == "0" || r.date_old_day == "") ? 'today' : r.date_old_day + ' day old ';
                count = old + (r.date_is_time === true ? '  ' + r.date_time + r.date_meridian : '');
                break;
            case 'PERIOD':
                count = "(" + r.period_start + ' ~ ' + r.period_end + ")" + " days";
                break;
        }
        return count;
    }

    const handleAutoUploadBtnClick = function() {
        let campaigns = group.campaigns.filter(c => {
            if (!c.is_manually_upload && c.status !== 'unrunning') return true;

            return false;
        });
        setCurrentUploadRunningWay('daily_manual');
        setCurrentUploadRunningCampaigns(campaigns);
        
        if (validationSystemCreateDatePeriod(campaigns)) {
            startUploadCampaigns(campaigns, 'daily_manual'); 
        }
    }

    const handlePendingUploadBtnClick = function() {
        let campaigns = group.campaigns.filter(c => {
            if (c.status !== 'done' && c.status !== 'unrunning') return true;

            return false;
        });
        
        setPendingCampaignIds(campaigns.map(c => {
            return c._id;
        }));

        setCurrentUploadRunningWay('pending_campaigns');
        setCurrentUploadRunningCampaigns(campaigns);
        
        if (validationSystemCreateDatePeriod(campaigns)) {
            startUploadCampaigns(campaigns, 'pending_campaigns');
        }
    }

    const handleManuallyUploadBtnClick = function() {
        let campaigns = group.campaigns.filter(c => !!c.is_manually_upload);
        setCurrentUploadRunningWay('manual');
        setCurrentUploadRunningCampaigns(campaigns);

        if (validationSystemCreateDatePeriod(campaigns)) {
            startUploadCampaigns(campaigns, 'manual'); 
        }
    }

    const validationSystemCreateDatePeriod = function(campaigns) {
        let unValidationCampaigns = [];

        const flagDate = moment().subtract(5, 'days').format('M/D/Y');
        for(const campaign of campaigns) {
            const systemCreateDateTime = new Date(campaign.system_create_datetime);
            const systemCreateDate = moment(systemCreateDateTime).format('M/D/Y');
            
            if (new Date(systemCreateDate) < new Date(flagDate)) {
                unValidationCampaigns = [...unValidationCampaigns, campaign];
            }
        }
        
        if (unValidationCampaigns.length > 0) {
            setUnValidationCampaigns(unValidationCampaigns);
            setOpenSystemCreateDateCheckModal(true);
            return false;
        }
        return true;
    }

    const handleRunBatch = function() {
        setOpenSystemCreateDateCheckModal(false);
        startUploadCampaigns(currentUploadRunningCampaigns, currentUploadRunningWay);
    }

    const validation = function(campaigns) {
        if (campaigns.length === 0) {
            messageApi.warning('Please select campaign list.');
            return;
        }
        if (props.setting.mdb_path === "") {
            messageApi.warning('Please input mdb path.');
            return;
        }
        if (props.setting.schedule_path === "") {
            messageApi.warning('Please input schedule sheet url.');
            return;
        }
        if (props.setting.whatsapp.ultramsg_instance_id === "") {
            messageApi.warning("Please input whatsapp instance id");
            return false;
        }
        if (props.setting.whatsapp.ultramsg_token === "") {
            messageApi.warning("Please input whatsapp token");
            return false;
        }

        return true;
    }

    const startUploadCampaigns = function(campaigns, runningWay = '') {
        if (validation(campaigns)) {
            if (moment(new Date(group.last_control_date)).format('M/D/Y') === today) {
                initRunningCampaignsAndShowBatchingModal(campaigns, runningWay);
            } else {
                setLoading(true);
                setTip('Wait for getting input date...');
                props.getLastInputDate(group._id, today, function(result) {
                    setLoading(false);
                    if (result.status === 'error') {
                    messageApi.warning(result.description);
                    } else {
                        initRunningCampaignsAndShowBatchingModal(campaigns, runningWay);
                    }
                }, (error) => {
                    setLoading(false);
                    toastr.error('There is a problem with server.');
                }, () => {
                    setLoading(false);
                    toastr.warning('There is a problem with MDB file.');
                });
            }
        }
    }

    const initRunningCampaignsAndShowBatchingModal = function(campaigns, runningWay) {
        initGroupUploadState(campaigns);

        setCurrentUploadRunningWay(runningWay);
        setOpenUploadStatusModal(true);
    }

    const handleGetAllLastPhoneBtnClick = function() {
        let campaigns = group.campaigns.filter(c => !!c.is_manually_upload);

        if (campaigns.length === 0) {
            messageApi.warning('Please select campaign list.');
            return;
        }
        initGroupUploadState(campaigns);
        setOpenGetAllLastPhoneModal(true);
    }

    const initGroupUploadState = function(campaigns) {
        let updatedGroup = {};
        updatedGroup = props.groups.filter(g => g._id === group._id)[0];

        updatedGroup.campaigns.forEach((campaign, index) => {
            let exist = false;
            for (let i = 0; i < (servers.length <= campaigns.length ? servers.length : campaigns.length); i++) {
                if (campaign._id === campaigns[i]._id) {
                    updatedGroup.campaigns[index].state = 'loading';
                    updatedGroup.campaigns[index].description = '';
                    exist = true;
                }
            }

            updatedGroup.campaigns[index].start_status = updatedGroup.campaigns[index].status;

            if (!exist) {
                updatedGroup.campaigns[index].state = '';
                updatedGroup.campaigns[index].description = '';
            }
        });
        updateUploadGroup(updatedGroup);
    }

    const handleIsManuallySelectAll = function(checked) {
        const campaignIds = group.campaigns.map(campaign => campaign._id);
        props.updateIsManually(group._id, campaignIds, checked, function() {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedManualUploadCampaignKeys((oldState) => {
                return [...selectedRowKeys];
            });
        },
        onSelect: (record, selected) => {
            handleFieldChange(record, 'is_manually_upload', selected);
        },
        getCheckboxProps: r => ({
            disabled: false
        }),
        onSelectAll: (checked) => {
            handleIsManuallySelectAll(checked);
        }
    };

    const showSettingModal = (show = false) => {
        setSettingModalOpen(show);
    }

    const updateCampaignSetting = function(campaign) {
        let globalCampaign = props.campaigns.filter(c => c._id === campaign.detail)[0];
        for (const key of Object.keys(globalCampaign)) {
            if (key === '_id' || key === 'columns') continue;
            delete campaign[key];
        }
        let updatedCampaign = {
            whatsapp: campaign.whatsapp,
            filter: campaign.filter,
            columns: campaign.columns,
            pause: campaign.pause,
            color: campaign.color,
            previous_color: campaign.previous_color,
            is_manually_upload: campaign.is_manually_upload
        }
        props.updateGroupCampaignField(group._id, campaign._id, updatedCampaign, true, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const showCampaignUploadLastInfo = function(campaign) {
        setSelectedCampaign(campaign);
        setUploadCampaignLastPreviewModalOpen(true);
    }

    const handleReUpload = function() {
        // if (new Date(currentDate) >= new Date(moment(ISSUE_DATE_TIME).format('M/D/Y')) && props.setting.send_out_type === 'GOOGLE') {
        //     issue_upload();
        // } else {
            setLoading(true);
            setTip('Wait for uploading...');
            props.uploadLeads(group._id, selectedCampaign._id, function(result) {
                setLoading(false);
                if (result.status === 'error') {
                    messageApi.warning(result.description);
                } else {
                    messageApi.success('success');
                }
            })
        // }
    }

    const handleCompanyQtySendBtnClick = function() {
        setLoading(true);
        setTip('Wait for sending...');
        props.sendCompanyQty(function(result) {
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                messageApi.success('success');
            }
        })
    }

    const handleAutoWhatsAppSendingForCampaignQtyChange = function(v) {
        let setting = {...props.setting};
        setting.is_auto_whatsapp_sending_for_company_qty = v;
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleAutoWhatsAppSendingForLocalWayChange = function(v) {
        let setting = {...props.setting};
        setting.is_auto_whatsapp_sending_for_local_way = v;
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleBackupDataSendBtnClick = function() {
        setLoading(true);
        setTip('Wait for sending...');
        props.sendBackupData(function(result) {
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                messageApi.success('success');
            }
        })
    }

    const handleSearchInputChange = function(e) {
        setSearch(e.target.value);
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <div style={{position:'sticky', top: 0, zIndex: 1, backgroundColor: 'white'}}>
                <MenuList
                    currentPage="upload"
                />
                <Row style={{marginTop: '-30px'}}>
                    <Col span={3} offset={16}>
                        <span>Send Out Type:</span>
                        <Select
                            size="medium"
                            defaultValue=""
                            onChange={handleSendOutTypeChange}
                            style={{ width: 129, marginLeft: '10px'}}
                            options={[{value: 'GOOGLE', label: 'Google Sheet'}, {value: 'LOCAL', label: 'Local File'}]}
                            value={props.setting.send_out_type}
                        />
                    </Col>
                    <Col span={4}>
                        <span>Send Local File Type:</span>
                        <Select
                            size="medium"
                            defaultValue=""
                            onChange={handleSendLocalFileTypeChange}
                            style={{ width: 129, marginLeft: '10px'}}
                            options={[{value: 'CSV', label: 'CSV'}, {value: 'XLS', label: 'XLS'}]}
                            value={props.setting.send_local_file_type}
                            disabled={props.setting.send_out_type !== 'LOCAL'}
                        />
                    </Col>
                </Row>
                <Path/>
                <Row style={{marginTop: '1rem'}}>
                    <Col span={7}>
                        {
                            group.campaigns ? 
                                <div style={{marginLeft: '10px', fontWeight: '900'}}>
                                    <div style={{fontSize: '1rem'}}>
                                        <span>Total: </span>
                                        <span>{group.campaigns.length}</span>
                                    </div>
                                    <div style={{fontSize: '1rem', fontWeight: '900'}}>
                                        <span> Run: </span>
                                        <span>{group.campaigns.filter(c => c.status !== 'unrunning').length}</span>
                                        <span> ( </span>
                                        <span style={{color: 'blue'}}>{group.campaigns.filter(c => c.status === 'running').length}</span>
                                        <span> + </span>
                                        <span style={{color: 'red'}}>{group.campaigns.filter(c => c.status === 'problem').length}</span>
                                        <span> + </span>
                                        <span style={{color: 'green'}}>{group.campaigns.filter(c => c.status === 'done').length}</span>
                                        <span> ) </span>
                                    </div>
                                </div> : <></>
                        }
                    </Col>
                    <Col span={1} offset={1}>
                        <Select
                            size="large"
                            defaultValue=""
                            onChange={handleGroupChange}
                            style={{ width: '100%'}}
                            options={groupOptions}
                            value={currentGroup}
                        />
                    </Col>
                    <Col span={3}>
                        <Radio.Group onChange={handleWayChange} defaultValue="ALL" value={currentWay} style={{marginLeft: '20px'}} >
                            <Radio value="ALL">Upload all campaigns</Radio>
                            <Radio value="ONE">Upload one by one</Radio>
                        </Radio.Group>
                    </Col>
                    <Col span={3} style={{marginTop: "5px"}} offset={1}>
                        <span style={{marginLeft: '-30px'}}>Auto WhatsApp Sending:</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            size="large"
                            onChange={handleAutoWhatsAppSendingForCampaignQtyChange}
                            checked={props.setting.is_auto_whatsapp_sending_for_company_qty}
                            style={{marginLeft: '10px'}}
                        />
                    </Col>
                    <Col span={3} style={{marginTop: "5px"}}>
                        <span>WhatsApp Sending In Local Way:</span>
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            size="large"
                            onChange={handleAutoWhatsAppSendingForLocalWayChange}
                            checked={props.setting.is_auto_whatsapp_sending_for_local_way}
                            disabled={props.setting.send_out_type !== 'LOCAL'}
                            style={{marginLeft: '10px'}}
                        />
                    </Col>
                    <Col span={4}>
                        <Input addonBefore="Search: " placeholder="" onChange={handleSearchInputChange} value={search} />
                    </Col>
                </Row>
                <Row style={{marginTop: '5px'}}>
                {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                {
                                    <Popconfirm
                                        title="Upload Manually data"
                                        description="Are you sure to upload manually the rows of selected campaign?"
                                        onConfirm={handleManuallyUploadBtnClick}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="primary" style={{marginLeft: '10px'}}>
                                            Manual
                                        </Button>
                                    </Popconfirm>
                                }
                            </Col> : <Col span={2}></Col>
                    }
                    {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                {
                                    <Popconfirm
                                        title="Upload data"
                                        description="Are you sure to upload the row of this campaign?"
                                        onConfirm={handleAutoUploadBtnClick}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="primary" style={{marginLeft: '-20px'}}>
                                            Daily - Manual
                                        </Button>
                                    </Popconfirm>
                                }
                            </Col> : <Col span={2}></Col>
                    }
                    {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                {
                                    <Popconfirm
                                        title="Upload data"
                                        description="Are you sure to upload the row of this campaign?"
                                        onConfirm={handlePendingUploadBtnClick}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="primary" style={{marginLeft: '-20px'}}>
                                            Pending campaign
                                        </Button>
                                    </Popconfirm>
                                }
                            </Col> : <Col span={2}></Col>
                    }
                    
                    {
                        currentWay === 'ALL' ?
                            <Col span={2} offset={10}>
                                <Input value={props.setting.last_system_create_date_time_for_company_qty} readonly={true}/>
                            </Col> : ''
                    }
                    {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                <Button type="primary" onClick={handleCompanyQtySendBtnClick} style={{marginLeft: '10px'}}>
                                    Send Company Qty
                                </Button>
                            </Col> : ''
                    }
                    {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                <Button type="primary" onClick={handleBackupDataSendBtnClick} style={{marginLeft: '5px'}}>
                                    Send Backup Data
                                </Button>
                            </Col> : ''
                    }
                    {
                        currentWay === 'ALL' ?
                            <Col span={2}>
                                <Popconfirm
                                    title="All Last Phone"
                                    description="Are you sure to get last phone of all campaigns?"
                                    onConfirm={handleGetAllLastPhoneBtnClick}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="primary">
                                        All Last Phone
                                    </Button>
                                </Popconfirm>
                            </Col> : ''
                    }
                </Row>
            </div>
            <Row>
                <Col span={24}>
                    {
                        group.campaigns ? 

                            currentWay === 'ALL' ?
                                <Table
                                    bordered={true}
                                    size="small"
                                    columns={tblColumns}
                                    dataSource={group.campaigns.filter(c => !search || c.query.toLowerCase().search(search.toLowerCase()) !== -1 || c.schedule.toLowerCase().search(search.toLowerCase()) !== -1)}
                                    pagination={tableParams.pagination}
                                    onChange={handleTableChange}
                                    rowSelection={{
                                        type: 'checkbox',
                                        selectedRowKeys: selectedManualUploadCampaignKeys,
                                        ...rowSelection,
                                    }}
                                    className="antd-custom-table campaign-table antd-checked-custom-table"
                                    rowClassName={(record, index) => ((record.color === undefined || record.color === "" || record.color === "none") ? "" : "campaign_" + record.color) }
                                /> :
                                <Table
                                    bordered={true}
                                    size="small"
                                    columns={tblColumns}
                                    dataSource={group.campaigns.filter(c => !search || c.query.toLowerCase().search(search.toLowerCase()) !== -1 || c.schedule.toLowerCase().search(search.toLowerCase()) !== -1)}
                                    pagination={tableParams.pagination}
                                    onChange={handleTableChange}
                                    className="antd-custom-table campaign-table antd-checked-custom-table"
                                    rowClassName={(record, index) => ((record.color === undefined || record.color === "" || record.color === "none") ? "" : "campaign_" + record.color) }
                                />
                            : <></>
                    }

                </Col>
            </Row>

            <Modal
                title="Campaign Setting"
                centered
                open={settingModalOpen}
                onOk={() => setSettingModalOpen(false)}
                onCancel={() => setSettingModalOpen(false)}
                width={1300}
                footer={null}
            >
                <GroupCampaignSetting
                    campaign={selectedCampaign}
                    updateCampaignSetting={updateCampaignSetting}
                    setting={props.setting}
                    showSettingModal={showSettingModal}
                />
            </Modal>

            <DraggableModalProvider>
                <DraggableModal
                    title="GET LAST PHONE STATUS LIST"
                    open={openGetAllLastPhoneModal}
                    header={null}
                    footer={null}
                    closable={false}
                >
                    <UploadGettingAllLastPhone
                        setOpen={setOpenGetAllLastPhoneModal}
                        group={group}
                        getUploadLastPhone={props.getUploadLastPhone}
                        setting={props.setting}
                        updateSetting={props.updateSetting}
                        backupDB={props.backupDB}
                        servers={servers}
                    />
                </DraggableModal>
            </DraggableModalProvider>

            <DraggableModalProvider>
                <DraggableModal
                    title={
                        <div>
                            <span style={{fontSize: '18px'}}>UPLOAD STATUS LIST</span>
                            <span
                                style={moment(new Date(group.last_input_date)).format('M/D/Y') === today ? {marginLeft: '20px', fontSize: '18px'} : {marginLeft: '20px', fontSize: '25px', color: 'red', fontWeight: 1000}}
                            >
                                {moment(new Date(group.last_input_date)).format('M/D/Y')}
                            </span>
                            <span
                                style={moment(new Date(group.last_service_date)).format('M/D/Y') === today ? {marginLeft: '20px', fontSize: '18px'} : {marginLeft: '20px', fontSize: '25px', color: 'red', fontWeight: 1000}}
                            >
                                {moment(new Date(group.last_service_date)).format('M/D/Y')}
                            </span>
                        </div>}
                    open={openUploadStatusModal}
                    header={null}
                    footer={null}
                    closable={false}
                    width={1500}
                    className="upload-status-modal"
                >
                    <UploadCampaign
                        setOpen={setOpenUploadStatusModal}
                        group={group}
                        pendingCampaignIds={pendingCampaignIds}
                        upload={props.upload}
                        setting={props.setting}
                        updateSetting={props.updateSetting}
                        backupDB={props.backupDB}
                        servers={servers}
                        runningWay={currentUploadRunningWay}
                        sendCompanyQty={props.sendCompanyQty}
                        sendBackupData={props.sendBackupData}
                        restartServer={props.restartServer}
                        checkSeverOnlineStatus={props.checkSeverOnlineStatus}
                    />
                </DraggableModal>
            </DraggableModalProvider>

            <Modal
                title="Upload Preview"
                centered
                open={uploadPreviewModalOpen}
                onOk={() => setUploadPreviewModalOpen(false)}
                onCancel={() => setUploadPreviewModalOpen(false)}
                width={1300}
                footer={null}
            >
                <UploadPreview
                    campaign={selectedCampaign}
                    campaigns={props.campaigns}
                    uploadPreview={uploadPreview}
                    cancelUpload={cancelUpload}
                />
            </Modal>
            <Row>
                <Col span={24}>
                    <UploadCampaignLastInfo
                        campaigns={props.campaigns}
                        showCampaignUploadLastInfo={showCampaignUploadLastInfo}
                    />
                </Col>
            </Row>
            <Modal
                title="Upload Preview"
                centered
                open={uploadCampaignLastPreviewModalOpen}
                onOk={() => setUploadCampaignLastPreviewModalOpen(false)}
                onCancel={() => setUploadCampaignLastPreviewModalOpen(false)}
                width={1300}
                footer={[
                    <Button key="upload" type="warning" onClick={handleReUpload}>ReUpload</Button>,
                    <Button key="close" type="primary" onClick={() => setUploadCampaignLastPreviewModalOpen(false)}>
                        close
                    </Button>
                ]}
            >
                <UploadCampaignLastPreview
                    campaign={selectedCampaign}
                    campaigns={props.campaigns}
                    loading={loading}
                    tip={tip}
                />
            </Modal>
            <Modal
                title="Older then 5 days"
                centered
                open={openSystemCreateDateCheckModal}
                onOk={() => setOpenSystemCreateDateCheckModal(false)}
                onCancel={() => setOpenSystemCreateDateCheckModal(false)}
                width={1300}
                footer={[
                    <Button key="close" onClick={() => setOpenSystemCreateDateCheckModal(false)}>
                        Stop Batch
                    </Button>,
                    <Button key="upload" type="primary" onClick={handleRunBatch}>Run Batch</Button>
                ]}
            >
                {
                    <>
                        <Row>
                            <Col span={1} style={{color: "blue", fontSize: "1.05rem"}}>No</Col>
                            <Col span={7} style={{color: "blue", fontSize: "1.05rem"}}>Query</Col>
                            <Col span={4} style={{color: "blue", fontSize: "1.05rem"}}>Schedule</Col>
                            <Col span={4} style={{color: "blue", fontSize: "1.05rem"}}>LastUploadDate</Col>
                            <Col span={4} style={{color: "blue", fontSize: "1.05rem"}}>LastPhone</Col>
                            <Col span={4} style={{color: "blue", fontSize: "1.05rem"}}>SystemCreateDate</Col>
                        </Row>
                        {
                            unValidationCampaigns.map((campaign, index) => {
                                return (
                                    <>
                                        <Row>
                                            <Col span={1}>{index + 1}</Col>
                                            <Col span={7}>{campaign.query}</Col>
                                            <Col span={4}>{campaign.schedule}</Col>
                                            <Col span={4}>{moment(campaign.last_upload_datetime).format('M/D/Y, hh:mm A')}</Col>
                                            <Col span={4}>{campaign.last_phone}</Col>
                                            <Col span={4}>{moment(campaign.system_create_datetime).format('M/D/Y, hh:mm A')}</Col>
                                        </Row>
                                    </>
                                )
                            })
                        }
                    </>
                }
            </Modal>
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns.data, groups: state.groups.data, setting: state.setting };
};

export default connect(
    mapStateToProps,
    {
        updateSetting, getSettings,
        updateCampaignField, updateGroup, updateGroupCampaignField,
        getUploadLastPhone, upload, uploadPreviewData, getLastInputDate, updateIsManually, backupDB, updateIsStopCampaignRunning, updateUploadGroup, uploadLeads,
        sendCompanyQty, sendBackupData,
        restartServer, checkSeverOnlineStatus
    }
)(UploadList);