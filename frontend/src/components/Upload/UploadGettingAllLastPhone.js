import {Button, Col, message, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {WarningOutlined, LoadingOutlined, CheckCircleTwoTone, Loading3QuartersOutlined} from "@ant-design/icons";
import moment from "moment";

const UploadGettingAllLastPhone = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isPaused, setIsPaused] = useState(false);
    const [isResumed, setIsResumed] = useState(true);
    const [isClose, setIsClose] = useState(false);
    const [currentRunningIndex, setCurrentRunningIndex] = useState(0);
    const [columns, setColumns] = useState([]);
    const [isRunningStart, setIsRunningStart] = useState(false);
    const [statusResult, setStatusResult] = useState([]);

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });

    useEffect(function() {
        if (props.runningStatusList.length > 0 && !isRunningStart) {
            const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {cancel_status: false})});
            props.updateSetting(setting);

            getLastPhone(currentRunningIndex, props.runningStatusList.map(s => {
                return {status: '', campaign: {}};
            }));
            setIsRunningStart(true);
        }
    }, [props.runningStatusList]);

    useEffect(function() {
        setColumns([
            {
                title: 'no',
                key: 'no',
                dataIndex: 'no',
                width: 30,
                render: (_, r) => {
                    return (
                        <span>{r.index + 1}</span>
                    )
                }
            },
            {
                title: 'Status',
                key: 'status',
                width: 90,
                render: (_, r) => {
                    let element = '';
                    if (isPaused === true && r.index === currentRunningIndex) {
                        element = <Loading3QuartersOutlined />;
                    } else if (isPaused === true && r.index > currentRunningIndex) {
                        element = '';
                    } else {
                        switch (r.status) {
                            case 'error':
                                element = <WarningOutlined />;
                                break;
                            case 'loading':
                                element = <LoadingOutlined />;
                                break;
                            case 'success':
                                element = <CheckCircleTwoTone twoToneColor="#52c41a" />;
                                break;
                            case '':
                                element = '';
                                break;
                        }
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
                title: 'LastUploadDate',
                dataIndex: 'last_upload_datetime',
                key: 'last_upload_datetime',
            },
            {
                title: 'Last Phone',
                key: 'last_phone',
                render: (_, r) => {
                    return (
                        <>
                            {
                                (isPaused === true && currentRunningIndex <= r.index) || (isPaused !== true && currentRunningIndex <= r.index) ?
                                    <span></span> : <span>{r.last_phone}</span>
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
                                (isPaused === true && currentRunningIndex <= r.index) || (isPaused !== true && currentRunningIndex <= r.index) ?
                                    <span></span> : <span>{r.system_create_datetime === "" || r.system_create_datetime === undefined || r.system_create_datetime === null ? "" : moment(r.system_create_datetime).format('M/D/Y, hh:mm A')}</span>
                            }
                        </>
                    )
                }
            },
        ])
    }, [props.runningStatusList, currentRunningIndex, isPaused]);

    const getLastPhone = function(index, statusLists = []) {
        setCurrentRunningIndex(index);
        setStatusResult(statusLists);

        props.getUploadLastPhone(props.runningStatusList[index].detail, function(result) {
            props.getSettings(function(settings) {
                if (settings.current_upload.cancel_status === false) {
                    statusLists[index]['status'] = result.status;
                    statusLists[index]['campaign'] = result.campaign;
                    if (props.runningStatusList.length > (index + 1)) {
                        statusLists[index + 1]['status'] = 'loading';
                    }
                    setStatusResult(statusLists);
                    props.updateRunningStatusList(statusLists);

                    if (settings.current_upload.pause_index !== index) {
                        if (props.runningStatusList.length === (index + 1)) {
                            setIsClose(true);
                            setCurrentRunningIndex(index + 1);
                            setTimeout(function() {
                                messageApi.success('Get all last phone success');
                            }, 1000);
                        } else {
                            getLastPhone(index + 1, statusLists);
                        }
                    } else {
                        const setting = Object.assign({...settings}, {current_upload : Object.assign({...settings.current_upload}, {resume_index: index, pause_index: -1})});
                        props.updateSetting(setting);
                    }
                }
            });
        })
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const pause = function() {
        setIsPaused(true);
        setIsResumed(false);

        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {pause_index: currentRunningIndex, resume_index: -1})});
        props.updateSetting(setting);
    }

    const resume = function() {
        setIsPaused(false);
        setIsResumed(true);

        props.getSettings(function(settings) {
            if (settings.current_upload.resume_index !== undefined && parseInt(settings.current_upload.resume_index) !== -1) {
                if (props.runningStatusList.length === (parseInt(settings.current_upload.resume_index) + 1)) {
                    setIsClose(true);
                    setCurrentRunningIndex(currentRunningIndex + 1);
                    setTimeout(function () {
                        messageApi.success('Get all last phone success');
                    }, 1000)
                } else {
                    getLastPhone(parseInt(settings.current_upload.resume_index) + 1, statusResult);
                }
            }
            const setting = Object.assign({...settings}, {current_upload : Object.assign({...settings.current_upload}, {resume_index: -1, pause_index: -1, cancel_status: false})});
            props.updateSetting(setting);
        });
    }

    const cancel = function() {
        const setting = Object.assign({...props.setting}, {current_upload : Object.assign({...props.setting.current_upload}, {resume_index: -1, pause_index: -1, cancel_status: true})});
        props.updateSetting(setting);

        props.setOpen(false);
    }

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={2}>
                    <Button type="primary" disabled={!isClose} onClick={(e) => {props.setOpen(false)}}>Close Window</Button>
                </Col>
                <Col span={15} offset={5}>
                    <Button type="primary" disabled={isPaused} onClick={pause}>Pause</Button>
                    <Button type="primary" disabled={isResumed} onClick={resume} style={{marginLeft: '0.4rem'}}>Resume</Button>
                    <Button type="primary" onClick={cancel} style={{marginLeft: '0.4rem'}}>Cancel</Button>
                </Col>
            </Row>
            <Row style={{marginTop: '0.4rem'}}>
                <Col span={24}>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.runningStatusList}
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                        className="antd-custom-table upload-status-list"
                        rowClassName={(record, index) => ((record.status === "error") ? "campaign_red" : '') }
                    />
                </Col>
            </Row>

        </>
    )
}

export default UploadGettingAllLastPhone;