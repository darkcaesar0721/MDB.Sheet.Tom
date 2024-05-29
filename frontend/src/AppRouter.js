import React, {Fragment, useEffect} from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import {connect} from "react-redux"
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import {
    getSettings, updateSetting
} from "./redux/actions/setting.action";
import {
    getCompanies
} from "./redux/actions/company.action";
import {
    getCampaigns
} from "./redux/actions/campaign.action";
import {
    getGoogleAccounts
} from "./redux/actions/google.account.action";
import {
    getGroups
} from "./redux/actions/group.action";
import {
    updateScheduleXLS
} from "./redux/actions/schedule.action";

import Backup from "./components/Settings/Backup";
import Whatsapp from "./components/Settings/Whatsapp";
import Pdfcrowd from "./components/Settings/Pdfcrowd";
import Googlesheet from "./components/Settings/Googlesheet";

import GoogleAccountList from "./components/GoogleAccount/GoogleAccountList";
import GoogleAccountAdd from "./components/GoogleAccount/GoogleAccountAdd";
import GoogleAccountEdit from "./components/GoogleAccount/GoogleAccountEdit";

import CompanyList from "./components/Company/CompanyList";
import CompanyAdd from "./components/Company/CompanyAdd";
import CompanyEdit from "./components/Company/CompanyEdit";

import CampaignList from "./components/Campaign/CampaignList";
import CampaignAdd from "./components/Campaign/CampaignAdd";
import CampaignEdit from "./components/Campaign/CampaignEdit";

import GroupList from "./components/Group/GroupList";
import GroupAdd from "./components/Group/GroupAdd";
import GroupEdit from "./components/Group/GroupEdit";

import UploadList from "./components/Upload/UploadList";

const DASHBOARD = '/';

toastr.options = {
    positionClass : 'toast-top-right',
    hideDuration: 300,
    timeOut: 5000
}

const AppRouter = (props) => {

    useEffect(function() {
        const updateScheduleXLS = function() {
            props.updateScheduleXLS(
                function(result) {
                    console.log(result);
                }, 
                function(error) {
                    toastr.error('There is a problem with server.');
                }
            );
        }

        updateScheduleXLS();
        setInterval(function() {
            updateScheduleXLS();
        }, 10000);

        let isErrorDisplay = false;
        props.getSettings('', 
            (setting) => {
            }, function(error) {
                isErrorDisplay = true;
                toastr.error('There is a problem with server.');
            }
        );
        props.getCompanies(function(error) {
            if (!isErrorDisplay)
                toastr.error('There is a problem with server.');
        });
        props.getGoogleAccounts(function(error) {
            if (!isErrorDisplay)
                toastr.error('There is a problem with server.');
        });
        props.getCampaigns(function(error) {
            if (!isErrorDisplay)
                toastr.error('There is a problem with server.');
        });
        props.getGroups(function(error) {
            if (!isErrorDisplay)
                toastr.error('There is a problem with server.');
        });
    }, []);

    return (
        <HashRouter>
            <Fragment>
                <main>
                    <Routes>
                        <Route path={DASHBOARD}>
                            <Route index path="/" element={<UploadList />} />

                            <Route path="/backup" element={<Backup />} />
                            <Route path="/whatsapp" element={<Whatsapp />} />
                            <Route path="/pdfcrowd" element={<Pdfcrowd />} />
                            <Route path="/googlesheet" element={<Googlesheet />} />

                            <Route path="/googleaccounts" element={<GoogleAccountList />} />
                            <Route path="/googleaccounts/add" element={<GoogleAccountAdd />} />
                            <Route path="/googleaccounts/:id" element={<GoogleAccountEdit />} />

                            <Route path="/companies" element={<CompanyList />} />
                            <Route path="/companies/add" element={<CompanyAdd />} />
                            <Route path="/companies/:id" element={<CompanyEdit />} />

                            <Route path="/campaigns" element={<CampaignList />} />
                            <Route path="/campaigns/add" element={<CampaignAdd />} />
                            <Route path="/campaigns/:id" element={<CampaignEdit />} />

                            <Route path="/groups" element={<GroupList />} />
                            <Route path="/groups/add" element={<GroupAdd />} />
                            <Route path="/groups/:id" element={<GroupEdit />} />
                        </Route>
                    </Routes>
                </main>
            </Fragment>
        </HashRouter>
    )
}

const mapStateToProps = state => {
    return { setting: state.setting };
};

export default connect(
    mapStateToProps,
    { getSettings, updateSetting, getCompanies, getCampaigns, getGoogleAccounts, getGroups, updateScheduleXLS }
)(AppRouter);