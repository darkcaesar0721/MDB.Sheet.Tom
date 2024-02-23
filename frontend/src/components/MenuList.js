import {Breadcrumb, Col, Row} from "antd";
import React from "react";

const MenuList = function(props) {
    return (
        <Row style={{marginTop: '1rem'}}>
            <Col span={20} offset={1}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "backup" ? "selected" : "") + " menu-bar-customize"} href="#/backup">Backup(Restore)</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "whatsapp" ? "selected" : "") + " menu-bar-customize"} href="#/whatsapp">WhatsApp</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "pdfcrowd" ? "selected" : "") + " menu-bar-customize"} href="#/pdfcrowd">Pdfcrowd</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "googlesheet" ? "selected" : "") + " menu-bar-customize"} href="#/googlesheet">Google Sheet</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "company" ? "selected" : "") + " menu-bar-customize"} href="#/companies">Add Companies</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "campaign" ? "selected" : "") + " menu-bar-customize"} href="#/campaigns">Add Campaigns</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "group" ? "selected" : "") + " menu-bar-customize"} href="#/groups">Edit Campaigns</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <a className={(props.currentPage === "upload" ? "selected" : "") + " menu-bar-customize"} href="#/">Upload</a>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </Col>
        </Row>
    )
}

export default MenuList;