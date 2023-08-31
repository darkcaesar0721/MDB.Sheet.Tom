import {Button, Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select, Table} from "antd";
import Path from "./Path/Path";
import {connect} from "react-redux";
import {getCampaigns, getGroups} from "../redux/actions";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import MenuList from "./MenuList";
import moment from "moment";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

const randomLayout = {
    labelCol: {
        span: 13,
    },
    wrapperCol: {
        span: 8,
    },
};

const meridiemOption = [
    {value: 'AM', label: 'AM'},
    {value: 'PM', label: 'PM'},
]

const CampaignUploadPreview = (props) => {
    const [way, setWay] = useState('all'); //all,static,random
    const [mainForm] = Form.useForm();
    const [staticCount, setStaticCount] = useState(1);
    const [tableColumns, setTableColumns] = useState([]);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const {groupIndex, groupCampaignIndex, campaignIndex} = useParams();
    const [isTime, setIsTime] = useState(false);
    const [time, setTime] = useState('');
    const [meridiem, setMeridiem] = useState('AM');
    const [dayOld, setDayOld] = useState(1);

    useEffect(function() {
        props.getCampaigns();
        props.getGroups();
    }, []);

    useEffect(function() {
        if (props.groups.data.length > 0 && props.campaigns.data.length > 0) {
            const selectedCampaign = props.groups.data[groupIndex].campaigns[groupCampaignIndex];

            setWay(selectedCampaign.way);
            setStaticCount(selectedCampaign.staticCount);
            setDayOld(selectedCampaign.dayOld);
            setMeridiem(!selectedCampaign.meridiem ? 'AM' : selectedCampaign.meridiem);
            setTime(selectedCampaign.time);
            setIsTime(selectedCampaign.isTime == "true");

            setStaticCount(selectedCampaign.staticCount);
            mainForm.setFieldsValue(selectedCampaign);

            let tbl_columns = [];
            let no_column = {
                title: 'no',
                key: 'no',
                render: (_, record) => {
                    let number = 0;
                    props.campaigns.data[campaignIndex].upRows.forEach((c, i) => {
                        if (c['Phone'] === record['Phone']) {
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
            tbl_columns.push(no_column);
            selectedCampaign.columns.forEach(c => {
                if (c.display == 'true') {
                    tbl_columns.push({title: c.field, dataIndex: c.name, key: c.name});
                }
            });
            tbl_columns.push({
                title: 'SystemCreateDate',
                dataIndex: 'SystemCreateDate',
                key: 'SystemCreateDate',
                render: (_, r) => {
                    return (
                        <span>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
                    )
                }
            });
            setTableColumns(tbl_columns);
        }
    }, [props.groups.data, props.campaigns.data]);

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
                currentPage="upload"
            />
            <Path/>
            <Row>
                <Col span={20} offset={2} style={{marginTop: 20}}>
                    {
                        props.groups.data.length  > 0 && props.campaigns.data.length > 0 ?
                            <Form
                                {...layout}
                                name="add_group_form"
                                className="group-setting-form"
                                form={mainForm}
                            >
                                <Form.Item
                                    name={['group']}
                                    label="Action Group Name"
                                >
                                    <span>{props.groups.data[groupIndex].name}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['query']}
                                    label="Query Name"
                                >
                                    <span>{props.campaigns.data[campaignIndex].query}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['urls']}
                                    label="Sheet URLS"
                                >
                                    {
                                        props.campaigns.data[campaignIndex].urls.map(url => {
                                            return (
                                                <div key={url}>
                                                    <span>{url}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </Form.Item>
                                <Form.Item
                                    name={['schedule']}
                                    label="Sheet Name"
                                >
                                    <span>{props.campaigns.data[campaignIndex].schedule}</span>
                                </Form.Item>
                                <Form.Item
                                    name={['way']}
                                    label="Send Type"
                                >
                                    <Radio.Group disabled={true} defaultValue={way} value={way}>
                                        <Radio value="all">All Select</Radio>
                                        <Radio value="static">Static Select</Radio>
                                        <Radio value="random">Random Select</Radio>
                                        <Radio value="random_first">Random First Select</Radio>
                                        <Radio value="date">Date & Time</Radio>
                                        <Radio value="period">Period</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {
                                    way === 'static' ?
                                        <Form.Item
                                            name={['staticCount']}
                                            label="Static Count"
                                        >
                                            <Col span={3}>
                                                <InputNumber disabled={true} placeholder="Static Count" value={staticCount} onChange={(e) => {setStaticCount(e.target.value)}}/>
                                            </Col>
                                        </Form.Item> : ''
                                }
                                {
                                    way === 'random' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomStart']}
                                                label="Random Count"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <InputNumber disabled={true} placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(5% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <InputNumber disabled={true} placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'random_first' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['randomFirst']}
                                                label="Random First"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input disabled={true} placeholder="First"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomStart']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                }}
                                            >
                                                <Input disabled={true} placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['random']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(3% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['randomEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(10% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input disabled={true} placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                                {
                                    way === 'date' ?
                                        <Form.Item label="Days Old" name={['date']} valuePropName="checked">
                                            <Row>
                                                <Col span={3}>
                                                    <Input disabled={true} placeholder="Days Old" value={dayOld}/>
                                                </Col>
                                                <Col span={1} offset={1}>
                                                    <Checkbox disabled={true} checked={isTime} style={{paddingTop: '0.3rem'}}></Checkbox>
                                                </Col>
                                                <Col span={2}>
                                                    <Input disabled={true} placeholder="Time" value={time}/>
                                                </Col>
                                                <Col span={2}>
                                                    <Select
                                                        size="middle"
                                                        defaultValue="AM"
                                                        style={{ width: 70 }}
                                                        options={meridiemOption}
                                                        value={meridiem}
                                                        disabled={true}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Item> : ''
                                }
                                {
                                    way === 'period' ?
                                        <Col span={24}>
                                            <Form.Item
                                                {...randomLayout}
                                                name={['periodStart']}
                                                label="Date Period"
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(30% - 5px)',
                                                }}
                                            >
                                                <Input placeholder="Start"/>
                                            </Form.Item>
                                            <Form.Item
                                                name={['period']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(3% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <span>~</span>
                                            </Form.Item>
                                            <Form.Item
                                                name={['periodEnd']}
                                                style={{
                                                    display: 'inline-block',
                                                    width: 'calc(13% - 5px)',
                                                    margin: '0 5px',
                                                }}
                                            >
                                                <Input placeholder="End"/>
                                            </Form.Item>
                                        </Col> : ''
                                }
                            </Form> : ''
                    }
                </Col>
                {
                    props.campaigns.data.length  > 0 ?
                        <Col span={3} offset={1} style={{marginBottom: 5}}>
                            Qty Available : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns.data[campaignIndex].last_qty}</span>
                        </Col> : ''
                }
                {
                    props.campaigns.data.length  > 0 ?
                        <Col span={4} style={{marginBottom: 5}}>
                            Qty Uploaded : <span style={{color: 'red', fontSize: '1.2rem'}}>{props.campaigns.data[campaignIndex].less_qty}</span>
                        </Col> : ''
                }
                {
                    props.campaigns.data.length  > 0 ?
                        <Col span={22} offset={1}>
                            <Table
                                size="small"
                                columns={tableColumns}
                                dataSource={props.campaigns.data[campaignIndex].upRows}
                                pagination={tableParams.pagination}
                                onChange={handleTableChange}
                                className="antd-custom-table"
                            />
                        </Col> : ''
                }
            </Row>
            <Row style={{marginTop: '1rem'}}>
                <Col offset={20} span={3}>
                    <Button type="dashed" href="#/">
                        Go to Upload Page
                    </Button>
                </Col>
            </Row>
        </>
    )
}

const mapStateToProps = state => {
    return { campaigns: state.campaigns, groups: state.groups };
};

export default connect(
    mapStateToProps,
    { getCampaigns, getGroups }
)(CampaignUploadPreview);