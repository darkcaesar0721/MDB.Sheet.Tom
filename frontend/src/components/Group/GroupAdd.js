import {Button, Col, Divider, Input, message, Modal, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {SettingOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import moment from "moment";
import dragula from "dragula";
import "dragula/dist/dragula.css";

import {createGroup,} from "../../redux/actions/group";
import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";
import GroupCampaignSetting from "./GroupCampaignSetting";

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

function GroupAdd(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);
    const [group, setGroup] = useState({name: '', campaigns: []});
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [initDragDropStatus, setInitDragDropStatus] = useState(false);
    const [settingModalOpen, setSettingModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    let lastDragDropCampaigns = [];

    const navigate = useNavigate();

    useEffect(() => {
        if (!initDragDropStatus && group.campaigns.length > 0) {
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
            setInitDragDropStatus(true);
        }
    }, [group.campaigns, initDragDropStatus]);

    useEffect(function() {
        let campaigns = [];
        let ids = [];
        props.campaigns.forEach(c => {
            let campaign = {
                key: c._id,
                campaign_id: c._id,
                is_checked: true,
                whatsapp: {
                    send_status: props.setting.whatsapp.global_send_status,
                    message: props.setting.whatsapp.default_message_template,
                    groups: [],
                    users: []
                },
                filter: {
                    way: 'ALL',
                    date_is_time: false,
                    date_meridian: 'AM'
                },
            };
            const keys = Object.keys(c);
            keys.forEach(key => {
                campaign[key] = c[key];
            })
            campaigns.push(campaign);
            ids.push(c._id);
        });

        setSelectedCampaignKeys(ids);

        setGroup((oldState) => {
            let newState = {...oldState};
            newState.campaigns = campaigns;
            return newState;
        });

    }, [props.campaigns]);

    useEffect(function() {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: group.campaigns.length,
            },
        });

        let no_column = {
            title: 'no',
            key: 'no',
            fixed: 'left',
            width: 30,
            render: (_, record) => {
                let index = -1;
                group.campaigns.forEach((c, i) => {
                    if (c._id === record._id) {
                        index = i + 1;
                        return true;
                    }
                })
                return (
                    <>
                        <span>{index}</span>
                    </>
                )
            }
        }

        setColumns([no_column,
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
                width: 150
            },
            {
                title: 'Sheet URL Count',
                key: 'sheet_urls',
                width: 120,
                render: (_, r) => {
                    return (
                        <span>{r.sheet_urls.length}</span>
                    )
                }
            },
            {
                title: 'Qty Available',
                dataIndex: 'qty_available',
                key: 'qty_available'
            },
            {
                title: 'Qty Uploaded',
                dataIndex: 'qty_uploaded',
                key: 'qty_uploaded'
            },
            {
                title: 'LastUploadDate',
                dataIndex: 'last_upload_datetime',
                key: 'last_upload_datetime',
                render: (_, r) => {
                    return (
                        <span>{r.last_upload_datetime === "" || r.last_upload_datetime === undefined ? "" : moment(r.last_upload_datetime).format('M/D/Y, hh:mm A')}</span>
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
                dataIndex: 'system_create_datetime',
                key: 'system_create_datetime',
                render: (_, r) => {
                    return (
                        <span>{r.system_create_datetime === "" || r.system_create_datetime === undefined ? "" : moment(r.system_create_datetime).format('M/D/Y, hh:mm A')}</span>
                    )
                }
            },
            {
                title: 'Setting',
                key: 'operation',
                width: 60,
                render: (_, record) => {
                    return (
                        <>
                            <Button disabled={!record.is_checked} icon={<SettingOutlined /> } onClick={() => {handleEditSettingClick(record)}} style={{marginRight: 1}}/>
                        </>
                    )
                }
            },
        ]);
    }, [group.campaigns]);

    const handleSubmit = function() {
        if (validation()) {
            const g = Object.assign({...group}, {campaigns: group.campaigns.filter(g => g.is_checked)});

            props.createGroup(g, (resp) => {
                messageApi.success('create success');
                setTimeout(function() {
                    navigate('/groups');
                }, 1000);
            });
        }
    }

    const validation = function() {
        if (!group.name) {
            messageApi.warning("Please input group name.");
            return false;
        }
        if (group.campaigns.filter(c => c.is_checked).length === 0) {
            messageApi.warning("Please select campaigns.");
            return false;
        }
        if (props.groups.filter(g => g.name === group.name).length > 0) {
            messageApi.warning("Already exist group name. Please input other name");
            return false;
        }

        return true;
    }

    const handleEditSettingClick = function(campaign) {
        setSelectedCampaign(campaign);
        setSettingModalOpen(true);
    }

    const updateCampaignSetting = function(campaign) {
        setGroup(oldState => Object.assign({...oldState}, {campaigns: [...oldState.campaigns].map(c => c._id === campaign._id ? campaign : c)}));
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedCampaignKeys(oldState => {
                return [...selectedRowKeys];
            });

            setGroup(oldState => {
                return Object.assign({...oldState}, {campaigns: [...oldState.campaigns].map(c => {
                     return Object.assign({...c}, {is_checked: selectedRowKeys.filter(sc => sc === c._id).length > 0});
                    })})
            })
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleNameChange = (e) => {
        setGroup(oldState => {
            return Object.assign({...oldState}, {name: e.target.value})
        });
    }

    const handleReorder = (dragIndex, draggedIndex) => {
        const campaigns = lastDragDropCampaigns.length > 0 ? lastDragDropCampaigns : [...group.campaigns];
        const item = campaigns.splice(dragIndex, 1)[0];
        campaigns.splice(draggedIndex, 0, item);
        lastDragDropCampaigns = campaigns;

        setGroup(oldState => {
            return Object.assign({...oldState}, {campaigns: [...oldState.campaigns].map((c, i) => {return Object.assign(c, {index: i})})});
        });
    };

    const showSettingModal = (show = false) => {
        setSettingModalOpen(show);
    }

    return (
        <>
            {contextHolder}
            <MenuList
                currentPage="group"
            />
            <Path/>
            <Divider>CAMPAIGN ACTION GROUP ADD FORM</Divider>
            <Row style={{marginBottom: 5}}>
                <Col span={2} offset={7}>
                    <span style={{lineHeight: 2}}>Group Name:</span>
                </Col>
                <Col span={7}>
                    <Input onBlur={handleNameChange} placeholder="8AM ACTION" value={group.name} onChange={handleNameChange}/>
                </Col>
            </Row>
            <Row>
                <Col offset={21} span={3}>
                    <Button type="primary" onClick={handleSubmit} style={{marginBottom: 5, marginRight: 5}}>
                        Create Group
                    </Button>
                    <Button type="dashed" href="#/groups">
                        Cancel
                    </Button>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedCampaignKeys,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={group.campaigns}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                className="antd-custom-table"
                style={{marginTop: 5}}
            />
            <Row>
                <Col offset={21} span={3}>
                    <Button type="primary" onClick={handleSubmit} style={{marginBottom: 5, marginRight: 5}}>
                        Create Group
                    </Button>
                    <Button type="dashed" href="#/groups">
                        Cancel
                    </Button>
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
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns.data, groups: state.groups.data, setting: state.setting };
};

export default connect(
    mapStateToProps,
    { createGroup }
)(GroupAdd);
