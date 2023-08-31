import {Button, Col, Divider, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    getGroups, initEditGroup
} from "../redux/actions";
import Path from "./Path/Path";
import { PlusCircleOutlined, EditOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import MenuList from "./MenuList";

function Groups(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);

    const navigate = useNavigate();

    useEffect(function() {
        props.getGroups();
        props.initEditGroup();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0) {
            let groups = props.groups.data;

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
                        return (
                            <span>{record.index + 1}</span>
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
                            <Button icon={<EditOutlined /> } onClick={(e) => {handleEditClick(record.index)}} style={{marginRight: 1}}/>
                        )
                    }
                },
            ]);
        }
    }, [props.groups]);

    const handleAddClick = function() {
        navigate('/groups/add');
    }

    const handleEditClick = function(index) {
        navigate('/groups/' + index);
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
                <Col span={2} offset={13}>
                    <Button type="primary" icon={<PlusCircleOutlined />} onClick={(e) =>{handleAddClick()}} style={{marginBottom: 5}}>
                        Add Group
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={8} offset={8}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.groups.data}
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
    return { groups: state.groups };
};

export default connect(
    mapStateToProps,
    { getGroups, initEditGroup }
)(Groups);
