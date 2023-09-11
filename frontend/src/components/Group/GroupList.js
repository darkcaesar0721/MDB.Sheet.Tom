import {Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {PlusCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import { deleteGroup } from '../../redux/actions/group';
import MenuList from "../MenuList";
import Path from "../Settings/MdbSchedulePath";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function GroupList(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);

    const navigate = useNavigate();

    useEffect(function() {
        if (props.groups.length > 0) {
            let groups = props.groups;

            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: groups.length,
                },
            });

            setColumns([
                {
                    title: 'no',
                    key: 'no',
                    width: 30,
                    render: (_, record) => {
                        let index = -1;
                        groups.forEach((g, i) => {
                            if (g._id === record._id) index = i;
                        })
                        return (
                            <span>{index + 1}</span>
                        )
                    }
                },
                {
                    title: 'Group Name',
                    dataIndex: 'name',
                    key: 'name',
                },
                {
                    title: 'Campaign Count',
                    key: 'campaign_count',
                    render: (_, record) => {
                        return (
                            <span>{record.campaigns.length}</span>
                        )
                    }
                },
                {
                    title: 'Action',
                    key: 'operation',
                    render: (_, record) => {
                        return (
                            <>
                                <Button icon={<EditOutlined /> } onClick={(e) => {handleEditClick(record._id)}} style={{marginRight: 1}}/>
                                <Popconfirm
                                    title="Delete Group"
                                    description="Are you sure to delete the this group?"
                                    onConfirm={() => {handleGroupDelete(record)}}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button icon={<DeleteOutlined /> } />
                                </Popconfirm>
                            </>

                        )
                    }
                },
            ]);
        }
    }, [props.groups]);

    const handleGroupDelete = function(group) {
        props.deleteGroup(group, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    const handleAddClick = function() {
        navigate('/groups/add');
    }

    const handleEditClick = function(id) {
        navigate('/groups/' + id);
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <MenuList
                currentPage="group"
            />
            <Path/>
            <Divider>CAMPAIGN ACTION GROUP MANAGE FORM</Divider>
            <Row>
                <Col span={2} offset={16}>
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={(e) =>{handleAddClick()}} style={{marginBottom: 5}}>
                        Add Group
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={12} offset={6}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.groups}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table"
                    />
                </Col>
            </Row>
        </>
    );
}

const mapStateToProps = state => {
    return { groups: state.groups.data };
};

export default connect(
    mapStateToProps,
    { deleteGroup }
)(GroupList);