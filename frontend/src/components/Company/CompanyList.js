import {Button, Col, Divider, Popconfirm, Row, Table} from "antd";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {PlusCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import moment from "moment";
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import {deleteCompany} from "../../redux/actions/company";
import Path from "../Settings/MdbSchedulePath";
import MenuList from "../MenuList";

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

function CompanyList(props) {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 200,
        },
    });
    const [columns, setColumns] = useState([]);

    const handleCompanyDelete = function(company) {
        props.deleteCompany(company, (result) => {}, (error) => {
            toastr.error('There is a problem with server.');
        });
    }

    useEffect(function() {
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: props.companies.data.length,
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
                    props.companies.data.forEach((c, i) => {
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
                title: 'Company Id',
                dataIndex: 'mdb_id',
                key: 'mdb_id',
            },
            {
                title: 'Company name',
                dataIndex: 'mdb_name',
                key: 'mdb_name',
            },
            {
                title: 'Company nickname',
                dataIndex: 'nick_name',
                key: 'nick_name',
            },
            {
                title: 'Action',
                key: 'operation',
                width: 100,
                render: (_, record) => {
                    const editUrl = "#/companies/" + record._id;
                    return (
                        <>
                            <Button icon={<EditOutlined /> } href={editUrl} style={{marginRight: 1}}/>
                            <Popconfirm
                                title="Delete Company"
                                description="Are you sure to delete the this company?"
                                onConfirm={() => {handleCompanyDelete(record)}}
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
                currentPage="company"
            />
            <Path/>
            <Row style={{marginTop: '1rem'}}>
                <Col span={16} offset={4}>
                    <Divider>COMPANY LIST</Divider>
                    <Row>
                        <Col span={2} offset={21}>
                            <Button type="primary" icon={<PlusCircleOutlined />} href="#/companies/add" style={{marginBottom: 5}}>
                                Add Company
                            </Button>
                        </Col>
                    </Row>
                    <Table
                        bordered={true}
                        size="small"
                        columns={columns}
                        dataSource={props.companies.data}
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
    return { companies: state.companies };
};

export default connect(
    mapStateToProps,
    { deleteCompany }
)(CompanyList);
