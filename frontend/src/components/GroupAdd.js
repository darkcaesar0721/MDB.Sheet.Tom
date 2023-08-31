import {Button, Col, Divider, Input, message, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getCampaigns, getGroups, getTempGroup, updateCampaign, updateTempGroup, createGroup, updateCampaignGroupOrder,
} from "../redux/actions";
import Path from "./Path/Path";
import { SettingOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import MenuList from "./MenuList";
import moment from "moment";
import dragula from "dragula";
import "dragula/dist/dragula.css";

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

function GroupAdd(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignKeys, setSelectedCampaignKeys] = useState([]);
    const [name, setName] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
        props.getTempGroup();
    }, []);

    useEffect(function() {
        setCampaigns((oldState) => {
            const data = [...props.campaigns.data];
            return data.sort((a, b) => {
                if (parseInt(a.group.order) < parseInt(b.group.order)) return -1;
                return 0;
            });
        });
    }, [props.campaigns, selectedCampaignKeys]);

    useEffect(function() {
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
            fixed: 'left',
            width: 30,
            render: (_, record) => {
                let number = 0;
                campaigns.forEach((c, i) => {
                    if (c['key'] === record['key']) {
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
                key: 'url_count',
                width: 120,
                render: (_, r) => {
                    return (
                        <span>{r.urls.length}</span>
                    )
                }
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
                title: 'Setting',
                key: 'operation',
                width: 60,
                render: (_, record) => {
                    let selectedIndex = -1;
                    if (selectedCampaignKeys) {
                        selectedCampaignKeys.forEach((key, i) => {
                            if (key === record.key) {
                                selectedIndex = i;
                            }
                        })
                    }

                    let campaignIndex = 0;
                    props.campaigns.data.forEach((c, i) => {
                        if (c['key'] === record['key']) {
                            campaignIndex = i;
                            return;
                        }
                    })

                    const settingUrl = "#/groups/add/" + campaignIndex;
                    return (
                        <>
                            <Button disabled={selectedIndex === -1 ? true: false} icon={<SettingOutlined /> } href={settingUrl} style={{marginRight: 1}}/>
                        </>
                    )
                }
            },
        ]);
    }, [campaigns]);

    useEffect(function() {
        setName(props.temp.name);
        setSelectedCampaignKeys(props.temp.selectedCampaignKeys);
    }, [props.temp]);

    const handleSubmit = function() {
        if (validation()) {
            props.createGroup();
            messageApi.success('create success');
            setTimeout(function() {
                navigate('/groups');
            }, 1000);
        }
    }

    const validation = function() {
        if (!props.temp.name) {
            messageApi.warning("Please input group name.");
            return false;
        }
        if (!props.temp.selectedCampaignKeys || props.temp.selectedCampaignKeys.length === 0) {
            messageApi.warning("Please select campaigns.");
            return false;
        }

        if (props.groups.filter(g => g.key === props.temp.name).length > 0) {
            messageApi.warning("Already exist group name. Please input other name");
            return false;
        }

        return true;
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            let _selectedCampaignKeys = [];
            campaigns.forEach(c => {
                selectedRowKeys.forEach(k => {
                    if (c.key === k) _selectedCampaignKeys.push(k);
                });
            });
            setSelectedCampaignKeys(_selectedCampaignKeys);

            if (_selectedCampaignKeys.length === 0) _selectedCampaignKeys = "";
            props.updateTempGroup({selectedCampaignKeys: _selectedCampaignKeys});
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
        setName(e.target.value);
    }

    const saveName = () => {
        props.updateTempGroup({name: name});
    }

    const handleReorder = (dragIndex, draggedIndex) => {
        setCampaigns((oldState) => {
            const newState = [...oldState];
            const item = newState.splice(dragIndex, 1)[0];
            newState.splice(draggedIndex, 0, item);
            props.updateCampaignGroupOrder(newState);
            return newState;
        });
    };

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
                    <Input onBlur={saveName} placeholder="8AM ACTION" value={name} onChange={handleNameChange}/>
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
                dataSource={campaigns}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                className="antd-custom-table"
            />
            <Row>
                <Col offset={20} span={4}>
                    <Button type="primary" onClick={handleSubmit} style={{marginBottom: 5, marginRight: 5}}>
                        Create Group
                    </Button>
                    <Button type="dashed" href="#/groups">
                        Cancel
                    </Button>
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, temp: state.groups.temp, groups: state.groups.data };
};

export default connect(
    mapStateToProps,
    { getCampaigns, updateCampaign, getTempGroup, updateTempGroup, createGroup, getGroups, updateCampaignGroupOrder }
)(GroupAdd);
