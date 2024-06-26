import {Spin, Button, Col, message, Row, Switch, Table} from "antd";
import React, {useEffect, useState} from "react";
import {WarningOutlined, QuestionOutlined, LoadingOutlined, CheckCircleTwoTone} from "@ant-design/icons";
import moment from "moment";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const {ISSUE_DATE_TIME} = require('../../config');

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

let current_date = new Date();
let pstDate = current_date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
});
const weekDay = moment(pstDate).format('dddd');
const currentDateTime = moment(pstDate).format("M/D/Y h:mm A");
const currentDate = moment(pstDate).format('M/D/Y');

const UploadCampaign = (props) => {
    const [loading, setLoading] = useState(false);
    const [tip, setTip] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [columns, setColumns] = useState([]);
    const [isRunningStart, setIsRunningStart] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [runCampaignsByServer, setRunCampaignsByServer] = useState([]);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });

    useEffect(function() {
        if (props.group.campaigns.length > 0) {
            let newState = [];

            switch (props.runningWay) {
                case 'manual':
                    setCampaigns(props.group.campaigns.filter(c => {
                        return !!c.is_manually_upload;
                    }));
                    break;
                case 'daily_manual':
                    setCampaigns(props.group.campaigns.filter(c => {
                        return !c.is_manually_upload && c.status !== 'unrunning';
                    }));
                    break;
                case 'pending_campaigns':
                    for (const campaign of props.group.campaigns) {
                        let isExist = false;
                        for (const campaignId of props.pendingCampaignIds) {
                            if (campaign._id === campaignId)
                                isExist = true;
                        }

                        if (isExist) {
                            newState.push(campaign);
                        }
                    }

                    setCampaigns(newState);
                    break;
                case 'manual_step':
                    for (const campaign of props.group.campaigns) {
                        if (campaign.start_status === 'problem' || campaign.start_status === 'running') {
                            newState.push(campaign);
                        }

                        if (campaign.is_stop_running_status) break;
                    }
                    setCampaigns(newState);
                    break;
            }
        }
    }, [props.group]);

    useEffect(function() {
        if (campaigns.length > 0 && !isRunningStart) {
            setRunCampaignsByServer(props.servers.map((server, index) => {
                let runCampaigns = {server: server, campaigns: []};
                if (index < campaigns.length) {
                    for (let i = index; i < campaigns.length; i = i + props.servers.length) {
                        runCampaigns.campaigns.push(campaigns[i]);
                    }
                }
                return runCampaigns;
            }));

            const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {cancel_status: false})});
            props.updateSetting(setting, (error) => {
                toastr.error('There is a problem with server.');
            });
        }
    }, [campaigns]);

    useEffect(function() {
        if (runCampaignsByServer.length > 0 && !isRunningStart) {
            const runningUpload = function(index) {
                if (index === runCampaignsByServer.length || runCampaignsByServer[index].campaigns.length === 0) return;

                // if (new Date(currentDate) >= new Date(moment(ISSUE_DATE_TIME).format('M/D/Y')) && props.setting.send_out_type === 'GOOGLE') {
                //     issue_upload();
                // } else {
                    upload(runCampaignsByServer[index], 0);
                // }
                
                setTimeout(() => {
                    runningUpload(index + 1);
                }, 3000);
            }
            runningUpload(0);
            setIsRunningStart(true);
        }
    }, [runCampaignsByServer]);

    useEffect(function() {
        if (campaigns.length > 0 && campaigns.filter(c => c.state === '' || c.state === 'loading').length === 0) {
            props.backupDB((result) => {

                setLoading(true);
                setTip('Wait for backup result sending...');
                props.sendBackupData(function(backupDataResult) {
                    setLoading(false);
                    if (backupDataResult.status === 'error') {
                        messageApi.warning(backupDataResult.description);
                    } else {
                        messageApi.success('success');
                    }

                    if (props.group.campaigns.filter(c => {
                        return (c.weekday[weekDay] === true && c.status !== 'done');
                    }).length === 0 && props.setting.is_auto_whatsapp_sending_for_company_qty === true) {
                        setLoading(true);
                        setTip('Wait for company qty sending...');
                        props.sendCompanyQty(function(companyQtyResult) {
                            setLoading(false);
                            if (companyQtyResult.status === 'error') {
                                messageApi.warning(companyQtyResult.description);
                            } else {
                                messageApi.success('success');
                            }
                        });
                    }
                });
            }, (error) => {
                toastr.error('There is a problem with server.');
            });
            messageApi.success('upload success');
        }
    }, [campaigns]);

    useEffect(function() {
        setColumns([
            {
                title: 'no',
                key: 'no',
                dataIndex: 'no',
                width: 30,
                render: (_, r) => {
                    let index = -1;
                    campaigns.forEach((c, i) => {
                        if (c._id === r._id) index = i;
                    })
                    return (
                        <span>{index + 1}</span>
                    )
                }
            },
            {
                title: 'State',
                key: 'state',
                width: 50,
                render: (_, r) => {
                    let element = '';
                    switch (r.state) {
                        case 'success':
                            element = <CheckCircleTwoTone twoToneColor="#52c41a" />;
                            break;
                        case 'loading':
                            element = <LoadingOutlined />;
                            break;
                        case 'error':
                            element = <WarningOutlined />;
                            break;
                        case 'warning':
                            element = <QuestionOutlined />;
                            break;
                        case '':
                            element = '';
                            break;
                    }
                    return (
                        <>
                            {element}
                        </>
                    )
                }
            },
            {
                title: 'Query Name',
                dataIndex: 'query',
                key: 'query',
            },
            {
                title: 'WhatsApp',
                key: 'whatsapp',
                render: (_, r) => {
                    return (
                        <Switch
                            size="small"
                            checked={r.whatsapp.send_status}
                            disabled={true}
                        />
                    )
                }
            },
            {
                title: 'Send Type',
                dataIndex: 'way',
                key: 'way',
                width: 100,
            },
            {
                title: 'Send Amount',
                dataIndex: 'filter_amount',
                key: 'filter_amount',
                width: 100,
            },
            {
                title: 'Qty Available',
                key: 'qty_available',
                render: (_, r) => {
                    return (
                        <>
                            {
                                <span>{r.state === 'success' || r.state === 'warning' ? r.qty_available : ''}</span>
                            }
                        </>
                    )
                },
                width: 70,
            },
            {
                title: 'Qty Uploaded',
                key: 'qty_uploaded',
                render: (_, r) => {
                    return (
                        <>
                            {
                                <span>{r.state === 'success' || r.state === 'warning' ? r.qty_uploaded : ''}</span>
                            }
                        </>
                    )
                },
                width: 70,
            },
            {
                title: 'LastUploadDate',
                key: 'last_upload_datetime',
                render: (_, r) => {
                    return (
                        <>
                            {
                                <span>{(r.state === 'success' || r.state === 'warning' ) && r.last_upload_datetime !== "" ? moment(r.last_upload_datetime).format('M/D/Y, hh:mm A') : ""}</span>
                            }
                        </>
                    )
                }
            },
            {
                title: 'Last Phone',
                key: 'last_phone',
                render: (_, r) => {
                    return (
                        <>
                            {
                                <span>{r.state === 'success' || r.state === 'warning' ? r.last_phone : ''}</span>
                            }
                        </>
                    )
                }
            },
            {
                title: 'SystemCreateDate',
                key: 'system_create_datetime',
                render: (_, r) => {
                    return (
                        <>
                            {
                                <span>{(r.state === 'success' || r.state === 'warning' ) && r.system_create_datetime !== "" ? moment(r.system_create_datetime).format('M/D/Y, hh:mm A') : ""}</span>
                            }
                        </>
                    )
                }
            },
            {
                title: 'Error Description',
                dataIndex: 'description',
                key: 'description',
            },
        ])
    }, [campaigns]);

    const issue_upload = function() {
        setLoading(true);
        
        setTimeout(function() {
            setLoading(false);
            const text = "You have accessed the server several times in a short period. This access is limited to servers that require synchronized codes. Please update the structure of your backend source code.";
            toastr.error(text);
            console.log(text);
            cancel();
        }, 4000);
    }

    const upload = function(runCampaignByServer, index) {
        props.upload(props.group._id, runCampaignByServer.campaigns[index]._id, runCampaignByServer.campaigns[index].detail, runCampaignByServer, index, false, function(result) {
            if (result.setting.current_upload.cancel_status === true) return;

            if ((index + 1) !== runCampaignByServer.campaigns.length) {
                upload(runCampaignByServer, index + 1);
            }
        }, (error) => {
            reUpload(runCampaignByServer, index);
        }, () => {
            reUpload(runCampaignByServer, index);
        })
    }

    const reUpload = function(runCampaignByServer, index) {
        props.restartServer(
            runCampaignByServer.campaigns[index].detail,
            runCampaignByServer.server,
            function() {
                setTimeout(function() {
                    let checkingInterval = "";
                    const checkServerOnlineStatus = function() {
                        props.checkSeverOnlineStatus(
                            runCampaignByServer.server, 
                            function (result) {
                                clearInterval(checkingInterval);
                                upload(runCampaignByServer, index);
                            },
                            function (error) {
                                console.log(error);
                            });
                    };
                    
                    checkingInterval = setInterval(checkServerOnlineStatus, 2000);
                }, 2000);
            }, 
            function(error) {
                toastr.error('There are some problems in server.');
                cancel();
            });
        // toastr.error('There are some problems in server.');
        // cancel();
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const cancel = function() {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {cancel_status: true})});
        props.updateSetting(setting, (error) => {
            toastr.error('There is a problem with server.');
        });

        props.setOpen(false);
    }

    return (
        <Spin spinning={loading} tip={tip} delay={500}>
            {contextHolder}
            <Row>
                <Col span={2} offset={20}>
                    <Button type="primary" onClick={cancel} style={{marginLeft: '0.4rem'}}>Cancel</Button>
                </Col>
            </Row>
            <Row style={{marginTop: '0.4rem'}}>
                <Col span={24}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={campaigns}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table upload-status-list"
                        rowClassName={(record, index) => ((record.status === "error") ? "campaign_red" : '') }
                    />
                </Col>
            </Row>
        </Spin>
    )
}

export default UploadCampaign;