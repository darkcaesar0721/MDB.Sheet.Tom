import {Spin, Select, Button, Checkbox, Col, message, Popconfirm, Radio, Row, Switch, Table, Input, Modal} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {UploadOutlined, EyeOutlined} from "@ant-design/icons";
import {DraggableModal, DraggableModalProvider} from "@cubetiq/antd-modal";
import {Link} from "react-router-dom";
import moment from "moment";

import StyledCheckBox from "../../shared/StyledCheckBox";
import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {
    getSettings,
    updateSetting
} from "../../redux/actions/setting";
import {
    updateGroup,
    updateGroupCampaignField,
} from "../../redux/actions/group";
import {getUploadLastPhone, upload, uploadPreviewData} from "../../redux/actions/upload";
import {updateCampaignField} from "../../redux/actions/campaign";
import GroupCampaignSetting from "../Group/GroupCampaignSetting";
import UploadGettingAllLastPhone from "./UploadGettingAllLastPhone";
import UploadCampaign from "./UploadCampaign";
import UploadPreview from "./UploadPreview";
import UploadCampaignLastInfo from "./UploadCampaignLastInfo";
import UploadCampaignLastPreview from "./UploadCampaignLastPreview";

let current_date = new Date();
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});
const wday = moment(pstDate).format('dddd');

const UploadList = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
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
    const [settingModalOpen, setSettingModalOpen] = useState(false);
    const [uploadPreviewModalOpen, setUploadPreviewModalOpen] = useState(false);
    const [uploadCampaignLastPreviewModalOpen, setUploadCampaignLastPreviewModalOpen] = useState(false);
    const [openGetAllLastPhoneModal, setOpenGetAllLastPhoneModal] = useState(false);
    const [openUploadAutoStatusModal, setOpenUploadAutoStatusModal] = useState(false);
    const [openUploadManualStatusModal, setOpenUploadManualStatusModal] = useState(false);
    const [runningStatusList, setRunningStatusList] = useState([]);
    const [uploadDoneStatus, setUploadDoneStatus] = useState(false);

    const currentGroup = props.setting.current_upload && props.setting.current_upload.group ? props.setting.current_upload.group : '';
    const currentWay = props.setting.current_upload && props.setting.current_upload.way ? props.setting.current_upload.way : '';

    useEffect(function() {
        if (props.groups.length === 0 || props.campaigns.length === 0) return;
        setGroupOptions(oldState => props.groups.map((group, index) => {return {value: group._id, label: group.name}}));

        if (currentGroup === '') return;

        if (props.groups.filter(g => g._id === currentGroup).length === 0) {
            let setting = {...props.setting};
            setting.current_upload.group = "";
            props.updateSetting(setting);
            return;
        }

        const filterGroup = props.groups.filter(g => g._id === currentGroup)[0];
        let manualUploadCampaignKeys = [];

        setGroup(oldState => Object.assign(filterGroup, {campaigns: filterGroup.campaigns.map(c => {
                let campaign = {...c};
                if (campaign.is_manually_upload === true) manualUploadCampaignKeys.push(campaign._id);

                campaign.key = campaign._id;

                let globalCampaign = props.campaigns.filter(c => c._id === campaign.detail)[0];
                console.log(globalCampaign);
                const campaignKeys = Object.keys(globalCampaign);
                for(const key of campaignKeys) {
                    if (key === '_id' || key === 'columns' || key === 'key') continue;
                    campaign[key] = globalCampaign[key];
                }

                const filterKeys = Object.keys(campaign.filter);
                for(const key of filterKeys) {
                    campaign[key] = campaign.filter[key];
                }
                return campaign;
            })}));
        setSelectedManualUploadCampaignKeys(manualUploadCampaignKeys);
    }, [props.groups, props.campaigns, currentGroup]);

    useEffect(function() {
        if (group.campaigns === undefined) return;

        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: group.campaigns.length,
            },
        });

        let columns = [];
        columns = [...columns, {
            title: 'no',
            key: 'no',
            width: 30,
            fixed: 'left',
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
            title: 'WhatsApp',
            key: 'whatsapp',
            width: 70,
            render: (_, r) => {
                return (
                    <Switch
                        size="small"
                        disabled={!props.setting.whatsapp.global_send_status}
                        checked={r.whatsapp.send_status}
                        onChange={(v) => handleObjectChange(r, 'whatsapp', 'send_status', v)}
                    />
                )
            }
        }];
        columns = [...columns, {
            title: 'N G Y P',
            key: 'color',
            width: 90,
            render: (_, r) => {
                return (
                    <Radio.Group onChange={(e) => {handleFieldChange(r, 'color', e.target.value)}} defaultValue="none" value={r.color}>
                        <Radio.Button value="none">N</Radio.Button>
                        <Radio.Button value="green">G</Radio.Button>
                        <Radio.Button value="yellow">Y</Radio.Button>
                        <Radio.Button value="pink">P</Radio.Button>
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
            title: 'Query Name',
            key: 'query',
            render: (_, record) => {
                const link = '#';
                return (
                    <>
                        <Link to={link} onClick={(e) => {setSelectedCampaign(record); setSettingModalOpen(true)}}>{record.query}</Link>
                    </>
                )
            }
        }];
        columns = [...columns, {
            title: 'Sheet Name',
            dataIndex: 'schedule',
            key: 'schedule',
        }];
        columns = [...columns, {
            title: 'Filter Type',
            dataIndex: 'way',
            key: 'way',
        }];
        columns = [...columns, {
            title: 'Filter Amount',
            key: 'count',
            width: 90,
            render: (_, record) => {
                return (
                    <>
                        <span>{customFilterAmount(record)}</span>
                    </>
                )
            }
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
        if (currentWay === 'ONE')
            columns = [...columns, {
                title: 'Upload',
                key: 'operation',
                width: 80,
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
                                        <Button style={{marginRight: 1}}><span style={{fontSize: '1rem'}}>D</span></Button>
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

    }, [group, currentGroup, currentWay]);

    const upload = function(campaign, isManually = false) {
        setLoading(true);

        if (isManually)
            setTip("Wait for getting data....");
        else
            setTip("Wait for uploading....");

        props.upload(group._id, campaign.detail, isManually, function(result) {
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                if (!isManually)
                    messageApi.success('upload success');
                else {
                    setSelectedCampaign(campaign);
                    setUploadPreviewModalOpen(true);
                }
            }
        })
    }

    const showPreviewResult = function(campaign) {
        setSelectedCampaign(campaign);
        setUploadPreviewModalOpen(true);
    }

    const uploadPreview = function() {
        setUploadPreviewModalOpen(false);

        setLoading(true);
        setTip("Wait for uploading data....");
        props.uploadPreviewData(group._id, selectedCampaign.detail, function(result) {
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                messageApi.success('upload success');
            }
        })
    }

    const cancelUpload = function() {
        setUploadPreviewModalOpen(false);

        let updateFields = {};
        updateFields.last_temp_upload_info = {};
        updateFields.is_manually_uploaded = false;
        props.updateCampaignField(selectedCampaign.detail, updateFields, true);
    }

    const getLastPhone = function(campaign) {
        setLoading(true);
        setTip("Wait for getting last phone....");

        props.getUploadLastPhone(campaign.detail, function(result) {
            setLoading(false);
            if (result.status === 'error') {
                messageApi.warning(result.description);
            } else {
                messageApi.success('success');
            }
        })
    }

    const handleGroupChange = function(value) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {group: value})});
        props.updateSetting(setting);
    }

    const handleWayChange = function(e) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {way: e.target.value})});
        props.updateSetting(setting);
    }

    const handleFieldChange = function(campaign, key, value, databaseAccess = true) {
        const updateFields = {};
        updateFields[key] = value;
        props.updateGroupCampaignField(group._id, campaign._id, updateFields, databaseAccess);
    }

    const handleObjectChange = function(campaign, object_name, key, value, databaseAccess = true) {
        let object = campaign[object_name];
        object[key] = value;
        let updatedObject = {};
        updatedObject[object_name] = object;
        props.updateGroupCampaignField(group._id, campaign._id, updatedObject, databaseAccess);
    }

    const handleCampaignFieldChange = function(campaign, key, value, databaseAccess = true) {
        const updateFields = {};
        updateFields[key] = value;
        props.updateCampaignField(campaign.detail, updateFields, databaseAccess);
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
            if (!c.is_manually_upload && c.weekday[wday] === true) return true;

            return false;
        });
        setRunningStatusList(campaigns.map((c, i) => {
            let campaign = {...c};
            campaign.key = i;
            campaign.index = i;
            campaign.status = (i === 0 ? 'loading' : '');
            campaign.filter_amount = customFilterAmount(c);
            return campaign;
        }));

        setOpenUploadAutoStatusModal(true);
    }

    const handleManuallyUploadBtnClick = function() {
        let campaigns = group.campaigns.filter(c => {
            if (c.is_manually_upload) return true;

            return false;
        });
        setRunningStatusList(campaigns.map((c, i) => {
            let campaign = {...c};
            campaign.key = i;
            campaign.index = i;
            campaign.status = (i === 0 ? 'loading' : '');
            campaign.filter_amount = customFilterAmount(c);
            return campaign;
        }));

        setOpenUploadManualStatusModal(true);
    }

    const handleGetAllLastPhoneBtnClick = function() {
        setRunningStatusList(group.campaigns.map((c, i) => {
            let campaign = {...c};
            campaign.key = i;
            campaign.index = i;
            campaign.status = (i === 0 ? 'loading' : '');
            return campaign;
        }));

        setOpenGetAllLastPhoneModal(true);
    }

    const updateRunningStatusList = function(statusLists = []) {
        setRunningStatusList(oldState => runningStatusList.map((s, i) => {
            const updatedCampaign = {
                last_phone: statusLists[i]['campaign'].last_phone,
                system_create_datetime: statusLists[i]['campaign'].system_create_datetime,
                is_get_last_phone: statusLists[i]['campaign'].is_get_last_phone,
                qty_available: statusLists[i]['campaign'].qty_available,
                qty_uploaded: statusLists[i]['campaign'].qty_uploaded,
                last_upload_datetime: statusLists[i]['campaign'].last_upload_datetime,
            }

            if (statusLists[i]['status'] === 'success') {
                return Object.assign({...s}, updatedCampaign, {status: statusLists[i]['status']});
            } else {
                return Object.assign({...s}, {status: statusLists[i]['status']});
            }
        }))
    }

    // rowSelection object indicates the need for row selection
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
        })
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
            columns: campaign.columns
        }
        props.updateGroupCampaignField(group._id, campaign._id, updatedCampaign);
    }

    const showCampaignUploadLastInfo = function(campaign) {
        setSelectedCampaign(campaign);
        setUploadCampaignLastPreviewModalOpen(true);
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
                        options={groupOptions}
                        value={currentGroup}
                    />
                </Col>
                <Col span={2} style={{textAlign: 'right', lineHeight: '2rem', marginRight: '0.7rem', marginLeft: '-3rem'}}>
                    <span>Send Type :</span>
                </Col>
                <Col span={3}>
                    <Radio.Group onChange={handleWayChange} defaultValue="ALL" value={currentWay}>
                        <Radio value="ALL">Upload all campaigns</Radio>
                        <Radio value="ONE">Upload one by one</Radio>
                    </Radio.Group>
                </Col>
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
                                    <Button type="primary">
                                        Upload
                                    </Button>
                                </Popconfirm>
                            }
                        </Col> : ''
                }
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
                                    <Button type="primary">
                                        Manually
                                    </Button>
                                </Popconfirm>
                            }
                        </Col> : ''
                }
            </Row>
            <Row>
                <Col span={2} offset={22}>
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
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    {
                        currentWay === 'ALL' ?
                            <Table
                                bordered={true}
                                size="small"
                                columns={tblColumns}
                                dataSource={group.campaigns}
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
                                dataSource={group.campaigns}
                                pagination={tableParams.pagination}
                                onChange={handleTableChange}
                                className="antd-custom-table campaign-table antd-checked-custom-table"
                                rowClassName={(record, index) => ((record.color === undefined || record.color === "" || record.color === "none") ? "" : "campaign_" + record.color) }
                            />
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
                        campaigns={runningStatusList}
                        getUploadLastPhone={props.getUploadLastPhone}
                        setting={props.setting}
                        updateSetting={props.updateSetting}
                        getSettings={props.getSettings}
                        runningStatusList={runningStatusList}
                        updateRunningStatusList={updateRunningStatusList}
                    />
                </DraggableModal>
            </DraggableModalProvider>

            <DraggableModalProvider>
                <DraggableModal
                    title="UPLOAD AUTO STATUS LIST"
                    open={openUploadAutoStatusModal}
                    header={null}
                    footer={null}
                    closable={false}
                    width={1100}
                >
                    <UploadCampaign
                        setOpen={setOpenUploadAutoStatusModal}
                        campaigns={runningStatusList}
                        upload={props.upload}
                        group={group}
                        setting={props.setting}
                        updateSetting={props.updateSetting}
                        getSettings={props.getSettings}
                        runningStatusList={runningStatusList}
                        updateRunningStatusList={updateRunningStatusList}
                        setUploadDoneStatus={setUploadDoneStatus}
                        uploadDoneStatus={uploadDoneStatus}
                        setLoading={setLoading}
                        setTip={setTip}
                    />
                </DraggableModal>
            </DraggableModalProvider>

            <DraggableModalProvider>
                <DraggableModal
                    title="UPLOAD MANUAL STATUS LIST"
                    open={openUploadManualStatusModal}
                    header={null}
                    footer={null}
                    closable={false}
                    width={1100}
                >
                    <UploadCampaign
                        setOpen={setOpenUploadManualStatusModal}
                        campaigns={runningStatusList}
                        upload={props.upload}
                        group={group}
                        setting={props.setting}
                        updateSetting={props.updateSetting}
                        getSettings={props.getSettings}
                        runningStatusList={runningStatusList}
                        updateRunningStatusList={updateRunningStatusList}
                        setUploadDoneStatus={setUploadDoneStatus}
                        uploadDoneStatus={uploadDoneStatus}
                        setLoading={setLoading}
                        setTip={setTip}
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
            >
                <UploadCampaignLastPreview
                    campaign={selectedCampaign}
                    campaigns={props.campaigns}
                />
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
        getUploadLastPhone, upload, uploadPreviewData
    }
)(UploadList);