import {Breadcrumb, Col, Row} from "antd";
import React from "react";

const MenuList = function(props) {
    return (
        <Row style={{marginTop: '1rem'}}>
            <Col span={20} offset={1}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "backup" ? "selected" : ""} href="#/backup">Backup(Restore)</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "whatsapp" ? "selected" : ""} href="#/whatsapp">WhatsApp</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "pdfcrowd" ? "selected" : ""} href="#/pdfcrowd">Pdfcrowd</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "company" ? "selected" : ""} href="#/companies">Add Companies</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "campaign" ? "selected" : ""} href="#/campaigns">Add Campaigns</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "group" ? "selected" : ""} href="#/groups">Edit Campaigns</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={props.currentPage === "upload" ? "selected" : ""} href="#/">Upload</a>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </Col>
        </Row>
    )
}

export default MenuList;