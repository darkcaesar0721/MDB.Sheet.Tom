import {Button, Checkbox, Col, Divider, Modal, Popconfirm, Radio, Row, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {UploadOutlined, EyeOutlined, CheckOutlined, CloseOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {Input} from "antd/lib";
import CampaignUploadManually from "./CampaignUploadManually";
import moment from "moment";
import StyledCheckBox from "../shared/StyledCheckBox";

const GroupCampaignUploadOneByOne = (props) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [open, setOpen] = useState(false);
    const [groupIndex, setGroupIndex] = useState('');
    const [groupCampaignIndex, setGroupCampaignIndex] = useState('');
    const [campaignIndex, setCampaignIndex] = useState('');

    useEffect(function() {
        if (props.campaigns.length > 0) {
            setCampaigns(props.campaigns);

            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: props.campaigns.length,
                },
            });

            let _columns = [
                {
                    title: 'no',
                    key: 'no',
                    width: 30,
                    fixed: 'left',
                    render: (_, record) => {
                        let number = 0;
                        props.campaigns.forEach((c, i) => {
                            if (c.key === record.key) {
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
                },
                {
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
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Sunday">S</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Monday">M</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Tuesday">T</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Wednesday">W</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Thursday">Th</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Friday">F</StyledCheckBox>
                                    </Col>
                                    <Col flex={1}>
                                        <StyledCheckBox onChange={(v) => {handleWeekdayChange(v, r)}} value="Saturday">S</StyledCheckBox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        )
                    }
                },
                {
                    title: 'WhatsApp',
                    key: 'whatsapp',
                    width: 70,
                    render: (_, r) => {
                        return (
                            <Switch
                                size="small"
                                disabled={!(props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true')}
                                checked={(props.whatsapp.isWhatsApp === undefined || props.whatsapp.isWhatsApp === true || props.whatsapp.isWhatsApp === 'true') && (r.isWhatsApp === "true" || r.isWhatsApp === true)}
                                onChange={(e) => handleIsWhatsAppChange(e, r)}
                            />
                        )
                    }
                },
                {
                    title: 'N G Y P',
                    key: 'color',
                    width: 90,
                    render: (_, r) => {
                        const color = r.color === undefined || r.color === "" ? "none" : r.color;
                        return (
                            <Radio.Group onChange={(e) => {handleColorChange(e, r)}} defaultValue="none" value={color}>
                                <Radio.Button value="none">N</Radio.Button>
                                <Radio.Button value="green">G</Radio.Button>
                                <Radio.Button value="yellow">Y</Radio.Button>
                                <Radio.Button value="pink">P</Radio.Button>
                            </Radio.Group>
                        )
                    }
                },
                {
                    title: 'Comment',
                    key: 'comment',
                    width: 130,
                    render: (_, r) => {
                        return (
                            <Input value={r.comment} onBlur={() => {handleCommentSave(r)}} onChange={(e) => {handleCommentChange(e, r)}}/>
                        )
                    }
                },
                {
                    title: 'Query Name',
                    key: 'query',
                    render: (_, record) => {
                        const link = '/groups/' + props.groupIndex + '/' + record.groupCampaignIndex + '/' + record.campaignIndex;
                        return (
                            <>
                                <Link to={link}>{record.query}</Link>
                            </>
                        )
                    }
                },
                {
                    title: 'Sheet Name',
                    dataIndex: 'schedule',
                    key: 'schedule',
                },
                {
                    title: 'Send Type',
                    dataIndex: 'way',
                    key: 'way',
                    width: 40,
                },
                {
                    title: 'Send Amount',
                    key: 'count',
                    width: 90,
                    render: (_, record) => {
                        let count = 'all';

                        switch (record.way) {
                            case 'all':
                                count = 'all';
                                break;
                            case 'static':
                                count = record.staticCount;
                                break;
                            case 'random':
                                count = record.randomStart + ' ~ ' + record.randomEnd;
                                break;
                            case 'random_first':
                                count = record.randomFirst + ': (' + record.randomStart + ' ~ ' + record.randomEnd + ')';
                                break;
                            case 'date':
                                let old = (record.dayOld == "0" || record.dayOld == "") ? 'today' : record.dayOld + ' day old ';
                                count = old + (record.isTime == "true" ? '  ' + record.time + record.meridiem : '');
                                break;
                            case 'period':
                                count = "(" + record.periodStart + ' ~ ' + record.periodEnd + ")" + " days";
                                break;
                        }

                        return (
                            <>
                                <span>{count}</span>
                            </>
                        )
                    }
                },
                {
                    title: 'Qty Available',
                    dataIndex: 'last_qty',
                    key: 'last_qty',
                    width: 25,
                },
                {
                    title: 'Qty Uploaded',
                    dataIndex: 'less_qty',
                    key: 'less_qty',
                    width: 25
                },
                {
                    title: 'LastUploadDate',
                    dataIndex: 'lastUploadDateTime',
                    key: 'lastUploadDateTime',
                    width: 130,
                    render: (_, r) => {
                        return (
                            <span>{r.lastUploadDateTime === "" || r.lastUploadDateTime === undefined ? "" : moment(r.lastUploadDateTime).format('M/D/Y, hh:mm A')}</span>
                        )
                    }
                },
                {
                    title: 'Last Phone',
                    key: 'last_phone',
                    width: 110,
                    render: (_, r) => {
                        return (
                            <Input style={{color: r.isGetLastPhone  ? 'red' : 'black'}} onBlur={() => {handlePhoneSave(r)}} value={r.last_phone} onChange={(e) => {handlePhoneChange(e, r)}}/>
                        )
                    }
                },
                {
                    title: 'SystemCreateDate',
                    dataIndex: 'SystemCreateDate',
                    key: 'SystemCreateDate',
                    width: 130,
                    render: (_, r) => {
                        return (
                            <span style={{color: r.isGetLastPhone  ? 'red' : 'black'}}>{r.SystemCreateDate === "" || r.SystemCreateDate === undefined ? "" : moment(r.SystemCreateDate).format('M/D/Y, hh:mm A')}</span>
                        )
                    }
                },
                {
                    title: 'Upload',
                    key: 'operation',
                    width: 80,
                    render: (_, record) => {
                        return (
                            <>
                                <Popconfirm
                                    title="Manually Upload data"
                                    description="Are you gonna get data to upload the row of this campaign?"
                                    onConfirm={(e) => {handleUpload(record, true)}}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button disabled={(record.isManually == "true" || record.isManually == true)} style={{marginRight: 1}}><span style={{fontSize: '1rem'}}>D</span></Button>
                                </Popconfirm>
                                {
                                    (record.isManually != "true" && record.isManually != true) ?
                                        <Popconfirm
                                            title="Upload data"
                                            description="Are you sure to upload the row of this campaign?"
                                            onConfirm={(e) => {handleUpload(record, false)}}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button icon={<UploadOutlined /> } style={{marginRight: 1}}/>
                                        </Popconfirm> : ''
                                }
                                {
                                    (record.isManually == "true" || record.isManually == true) ? <Button onClick={(e) => {handleShowResult(record)}} icon={<EyeOutlined /> } style={{marginRight: 1}}/> : ''
                                }
                            </>
                        )
                    }
                },
                {
                    title: 'Last Phone',
                    key: 'get_phone',
                    width: 90,
                    render: (_, r) => {
                        return (
                            <Button type="primary" onClick={(e) => {props.getLastPhone(r)}}>Last Phone</Button>
                        )
                    }
                }
            ];
            setColumns(_columns);
        }
    }, [props.campaigns]);

    const handleIsWhatsAppChange = function(v, r) {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {isWhatsApp: v})
    }

    const handleWeekdayChange = function(e, r) {
        const weekday = {};
        weekday[e.target.value] = e.target.checked;
        props.updateGroupCampaignWeekday(props.groupIndex, r.groupCampaignIndex, weekday);
    }

    const handleColorChange = function(e, r) {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {color: e.target.value});
    }

    const handleCommentChange = (e, r) => {
        r.comment = e.target.value;
        setCampaigns([...props.campaigns].map(c => {
            return (c.index === r.index ? r : c);
        }));
    }

    const handleCommentSave = (r) => {
        props.updateGroupCampaign(props.groupIndex, r.groupCampaignIndex, {comment: r.comment});
    }

    const handlePhoneChange = (e, r) => {
        r.last_phone = e.target.value;
        setCampaigns([...props.campaigns].map(c => {
            return (c.index === r.index ? r : c);
        }));
    };

    const handlePhoneSave = (r) => {
        props.updateCampaign(r.file_name, {last_phone: r.last_phone});
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const handleUpload = (r, manually) => {
        setGroupIndex(props.groupIndex);
        setGroupCampaignIndex(r.groupCampaignIndex);
        setCampaignIndex(r.campaignIndex);

        let callback = function(){};
        if (manually) {
            callback = function() {
                setOpen(true);
            };
        }

        props.upload({
            groupIndex: props.groupIndex,
            groupCampaignIndex: r.groupCampaignIndex,
            campaignIndex: r.campaignIndex,
            manually: manually,
        }, callback);
    }

    const handleShowResult = function(r) {
        setGroupIndex(props.groupIndex);
        setGroupCampaignIndex(r.groupCampaignIndex);
        setCampaignIndex(r.campaignIndex);

        setOpen(true);
    }

    return (
        <>
            <Row>
                <Col span={24}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table campaign-table"
                        rowClassName={(record, index) => ((record.color === undefined || record.color == "" || record.color === "none") ? "" : "campaign_" + record.color) }
                    />
                </Col>
            </Row>
            <Modal
                title="UPLOAD PREVIEW"
                centered
                open={open}
                width={1200}
                header={null}
                footer={null}
                onCancel={(e) => {setOpen(false)}}
                className="upload-preview"
            >
                {
                    props.globalGroups.length > 0 && props.globalCampaigns.length> 0 ?
                        <CampaignUploadManually
                            groupIndex={groupIndex}
                            groupCampaignIndex={groupCampaignIndex}
                            campaignIndex={campaignIndex}
                            groups={props.globalGroups}
                            campaigns={props.globalCampaigns}
                            setOpen={setOpen}
                            updateCampaign={props.updateCampaign}
                            uploadAfterPreview={props.uploadAfterPreview}
                        /> : ''
                }

            </Modal>
        </>
    )
}

export default GroupCampaignUploadOneByOne;