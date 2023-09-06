import {Button, Table} from "antd";
import React, {useEffect, useState} from "react";
import {EyeOutlined} from '@ant-design/icons';
import moment from "moment";

function UploadCampaignLastInfo(props) {
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
                total: props.campaigns.length,
            },
        });

        setColumns([
            {
                title: 'no',
                key: 'no',
                width: 30,
                fixed: 'left',
                render: (_, record) => {
                    let index = -1;
                    props.campaigns.forEach((c, i) => {
                        if (c._id === record._id) index = i;
                    });

                    return (
                        <>
                            <span>{(index + 1)}</span>
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
                        <span>{r.system_create_datetime === "" || r.system_create_datetime === undefined || r.system_create_datetime === null ? "" : moment(r.system_create_datetime).format('M/D/Y, hh:mm A')}</span>
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
                            <Button onClick={(e) => {props.showCampaignUploadLastInfo(record)}} icon={<EyeOutlined /> } style={{marginRight: 1}}/>
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
            <Table
                bordered={true}
                size="small"
                columns={columns}
                dataSource={props.campaigns}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                className="antd-custom-table"
            />
        </>
    );
}

export default UploadCampaignLastInfo;
