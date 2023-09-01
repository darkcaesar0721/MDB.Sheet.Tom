import {Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {PlusCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import moment from "moment";

import {deleteCampaign} from "../../redux/actions/campaign";
import Path from "../Settings/MdbSchedulePath";
import MenuList from "../MenuList";

function CampaignList(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);

    const handleCampaignDelete = function(campaign) {
        props.deleteCampaign(campaign);
    }

    useEffect(function() {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: props.campaigns.data.length,
            },
        });

        setColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                fixed: 'left',
                render: (_, record) => {
                    return (
                        <>
                            <span>{(record.index + 1)}</span>
                        </>
                    )
                }
            },
            {
                title: 'Query Name',
                dataIndex: 'query',
                key: 'query',
                width: 350,
            },
            {
                title: 'Schedule',
                dataIndex: 'schedule',
                key: 'schedule',
                width: 250
            },
            {
                title: 'Sheet URL Count',
                key: 'sheet_urls',
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
                key: 'last_phone'
            },
            {
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
                render: (_, r) => {
                    return (
                        <span>{r.system_create_datetime === "" || r.system_create_datetime === undefined ? "" : moment(r.system_create_datetime).format('M/D/Y, hh:mm A')}</span>
                    )
                }
            },
            {
                title: 'Action',
                key: 'operation',
                width: 100,
                render: (_, record) => {
                    const editUrl = "#/campaigns/" + record._id;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                            <Popconfirm
                                title="Delete Campaign"
                                description="Are you sure to delete the this campaign?"
                                onConfirm={() => {handleCampaignDelete(record)}}
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
    }, [props.campaigns]);

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
                currentPage="campaign"
            />
            <Path/>
            <Divider>MDB QUERY CAMPAIGN LIST</Divider>
            <Row>
                <Col span={2} offset={21}>
                    <Button type="primary" icon={<PlusCircleOutlined />} href="#/campaigns/add" style={{marginBottom: 5}}>
                        Add Campaign
                    </Button>
                </Col>
            </Row>
            <Table
                bordered={true}
                size="small"
                columns={columns}
                dataSource={props.campaigns.data}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                className="antd-custom-table"
            />
        </>
    );
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns };
};

export default connect(
    mapStateToProps,
    { deleteCampaign }
)(CampaignList);
