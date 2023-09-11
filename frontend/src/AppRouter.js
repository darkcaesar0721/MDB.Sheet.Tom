import React, {Fragment, useEffect} from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import {connect} from "react-redux"
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

import {
    getSettings
} from "./redux/actions/setting";
import {
    getCampaigns
} from "./redux/actions/campaign";
import {
    getGroups
} from "./redux/actions/group";

import Backup from "./components/Settings/Backup";
import Whatsapp from "./components/Settings/Whatsapp";

import CampaignList from "./components/Campaign/CampaignList";
import CampaignAdd from "./components/Campaign/CampaignAdd";
import CampaignEdit from "./components/Campaign/CampaignEdit";

import GroupList from "./components/Group/GroupList";
import GroupAdd from "./components/Group/GroupAdd";
import GroupEdit from "./components/Group/GroupEdit";

import UploadList from "./components/Upload/UploadList";

const DASHBOARD = '/';

const AppRouter = (props) => {
    let container;

    useEffect(function() {
        toastr.options = {
            positionClass : 'toast-top-right',
            hideDuration: 300,
            timeOut: 5000
        }
        let isErrorDisplay = false;
        props.getSettings(() => {}, function(message) {
            isErrorDisplay = true;
            toastr.error('There is a problem with server.');
        });
        props.getCampaigns(() => {}, function(message) {
            if (!isErrorDisplay)
                toastr.error('There is a problem with server.');
        });
        props.getGroups(() => {}, function(message) {
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
    { getSettings, getCampaigns, getGroups }
)(AppRouter);