import {Button, Col, message, Row, Spin, Table} from "antd";
import React, {useEffect, useState} from "react";
import moment from "moment/moment";

const UploadPreview = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [columns, setColumns] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const currentCampaign = props.campaigns.filter(c => c._id === props.campaign.detail)[0];

    useEffect(function() {
        console.log(currentCampaign);
        if (currentCampaign.last_temp_upload_info.upload_rows) {
            let tblColumns = [];
            tblColumns = [...tblColumns, {
                title: 'no',
                key: 'no',
                render: (_, record) => {
                    let index = -1;
                    currentCampaign.last_temp_upload_info.upload_rows.forEach((row, i) => {
                        if (row.Phone === record.Phone) index = i;
                    })
                    return (
                        <>
                            <span>{index + 1}</span>
                        </>
                    )
                }
            }];
            for (const column of props.campaign.columns) {
                if (!column.is_display) continue;

                tblColumns = [...tblColumns, {
                    title: column.sheet_name,
                    key: column.mdb_name,
                    dataIndex: column.mdb_name
                }];
            }
            setColumns(tblColumns);
        }
    }, [props.campaign, props.campaigns])

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <Row>
                <Col span={3} className={"align-right"}>
                    Query Name:
                </Col>
                <Col span={20} offset={1}>
                    {props.campaign.query}
                </Col>
            </Row>
            <Row>
                <Col span={3} className={"align-right"}>
                    Sheet Urls:
                </Col>
                <Col span={20} offset={1}>
                    {
                        props.campaign.sheet_urls.map(url => {
                            return <div>{url}</div>;
                        })
                    }
                </Col>
            </Row>
            <Row>
                <Col span={3} className={"align-right"}>
                    Sheet Name:
                </Col>
                <Col span={20} offset={1}>
                    {props.campaign.schedule}
                </Col>
            </Row>
            <Row>
                <Col span={3} className={"align-right"}>
                    Qty Available:
                </Col>
                <Col span={3} offset={1}>
                    {currentCampaign.last_temp_upload_info.qty_available}
                </Col>
                <Col span={3} offset={1} className={"align-right"}>
                    Qty Uploaded:
                </Col>
                <Col span={3} offset={1}>
                    {currentCampaign.last_temp_upload_info.qty_uploaded}
                </Col>
            </Row>
            <Row>
                <Col span={3} className={"align-right"}>
                    Last Phone:
                </Col>
                <Col span={3} offset={1}>
                    {currentCampaign.last_temp_upload_info.last_phone}
                </Col>
                <Col span={3} offset={1} className={"align-right"}>
                    System Create Datetime:
                </Col>
                <Col span={5} offset={1}>
                    {moment(currentCampaign.last_temp_upload_info.system_create_datetime).format('M/D/Y, hh:mm A')}
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Table
                        size="small"
                        columns={columns}
                        dataSource={currentCampaign.last_temp_upload_info.upload_rows}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table"
                    />
                </Col>
            </Row>
            <Row>
                <Col span={2} offset={19}>
                    <Button type="primary" onClick={props.cancelUpload}>Cancel</Button>
                </Col>
                <Col span={2} offset={1}>
                    <Button type="primary" onClick={props.uploadPreview}>Upload</Button>
                </Col>
            </Row>
        </Spin>
    )
}

export default UploadPreview;