import {Button, Col, Divider, Popconfirm, Row, Table, Switch} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {PlusCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import {deleteGoogleAccount} from "../../redux/actions/google.account.action";
import Path from "../Settings/MdbSchedulePath";
import MenuList from "../MenuList";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function GoogleAccountList(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);

    const handleGoogleAccountDelete = function(googleAccount) {
        props.deleteGoogleAccount(googleAccount, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    useEffect(function() {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: props.googleAccounts.data.length,
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
                    props.googleAccounts.data.forEach((c, i) => {
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
                title: 'Gmail Address',
                dataIndex: 'mail_address',
                key: 'mail_address',
            },
            {
                title: 'Status',
                render: (_, record) => {
                    let status = false;
                    if (record.mail_address === 'form.fill18@gmail.com' || record.mail_address === 'darkcaesar0721@gmail.com' || record.mail_address === 'williamlimdc@gmail.com' || record.mail_address === 'morrispeter0311@gmail.com') {
                        status = true;
                    }
                    return (
                        <>
                            <Switch
                                size="large"
                                disabled={true}
                                checked={status}
                            />
                        </>
                    )
                }
            },
            {
                title: 'Action',
                key: 'operation',
                width: 100,
                render: (_, record) => {
                    const editUrl = "#/googleaccounts/" + record._id;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                            <Popconfirm
                                title="Delete Google Account"
                                description="Are you sure to delete the this google account?"
                                onConfirm={() => {handleGoogleAccountDelete(record)}}
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
    }, [props.googleAccounts]);

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
                currentPage="googleaccount"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={8} offset={8}>
                    <Divider>GOOGLE ACCOUNT LIST</Divider>
                    <Row>
                        <Col span={2} offset={18}>
                            <Button type="primary" icon={<PlusCircleOutlined />} href="#/googleaccounts/add" style={{marginBottom: 5}}>
                                Add Google Account
                            </Button>
                        </Col>
                    </Row>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.googleAccounts.data}
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
    return { googleAccounts: state.googleAccounts };
};

export default connect(
    mapStateToProps,
    { deleteGoogleAccount }
)(GoogleAccountList);
