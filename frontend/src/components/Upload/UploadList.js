import {Spin, Select, Button, Checkbox, Col, message, Popconfirm, Radio, Row, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {EyeOutlined} from "@ant-design/icons";
import {DraggableModal, DraggableModalProvider} from "@cubetiq/antd-modal";

import StyledCheckBox from "../../shared/StyledCheckBox";
import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import {
    updateSetting
} from "../../redux/actions/setting";
import {
    updateGroupCampaignField, updateGroupCampaignObject,
} from "../../redux/actions/group";

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
    const [open, setOpen] = useState(false);
    const [groupOptions, setGroupOptions] = useState([]);
    const [tblColumns, setTblColumns] = useState([]);
    const [group, setGroup] = useState({});
    const [selectedManualUploadCampaignKeys, setSelectedManualUploadCampaignKeys] = useState([]);

    const currentGroup = props.setting.current_upload && props.setting.current_upload.group ? props.setting.current_upload.group : '';
    const currentWay = props.setting.current_upload && props.setting.current_upload.way ? props.setting.current_upload.way : '';

    useEffect(function() {
        if (props.groups.length === 0) return;
        setGroupOptions(oldState => props.groups.map((group, index) => {return {value: group._id, label: group.name}}));

        if (currentGroup === '') return;
        const g = props.groups.filter(g => g._id === currentGroup)[0];
        let manualUploadCampaignKeys = [];
        setGroup(oldState => Object.assign(g, {campaigns: g.campaigns.map(c => {
            let campaign = {...c};
            if (campaign.is_manually_upload === true) manualUploadCampaignKeys.push(campaign._id);

            campaign.key = campaign._id;
            return campaign;
            })}));
        setSelectedManualUploadCampaignKeys(manualUploadCampaignKeys);
    }, [props.groups, currentGroup]);

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
        if (currentWay === 'ALL')
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

        setTblColumns(columns);

    }, [group, currentGroup]);

    const handleGroupChange = function(value) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {group: value})});
        props.updateSetting(setting);
    }

    const handleWayChange = function(e) {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {way: e.target.value})});
        props.updateSetting(setting);
    }

    const handleFieldChange = function(campaign, key, value) {
        props.updateGroupCampaignField(group, campaign, key, value);
    }

    const handleObjectChange = function(campaign, object_name, key, value) {
        props.updateGroupCampaignObject(group, campaign, object_name, key, value);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleUploadBtnClick = function() {

    }

    const handleManuallyUploadBtnClick = function() {

    }

    const handleGetAllLastPhoneBtnClick = function() {

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
                                    onConfirm={handleUploadBtnClick}
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
        </Spin>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns.data, groups: state.groups.data, setting: state.setting };
};

export default connect(
    mapStateToProps,
    { updateSetting, updateGroupCampaignObject, updateGroupCampaignField }
)(UploadList);