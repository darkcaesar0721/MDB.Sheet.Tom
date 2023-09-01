import React, {Fragment, useEffect} from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {
    getSettings
} from "./redux/actions/setting";
import {
    getCampaigns
} from "./redux/actions/campaign";

import Backup from "./components/Settings/Backup";
import Whatsapp from "./components/Settings/Whatsapp";
import CampaignList from "./components/Campaign/CampaignList";
import CampaignAdd from "./components/Campaign/CampaignAdd";

const DASHBOARD = '/';

const AppRouter = (props) => {

    useEffect(function() {
        props.getSettings();
        props.getCampaigns();
    }, []);

    return (
        <HashRouter>
            <Fragment>
                <main>
                    <Routes>
                        <Route path={DASHBOARD}>
                            <Route index path="/" element={<Backup />} />
                            <Route path="/backup" element={<Backup />} />
                            <Route path="/whatsapp" element={<Whatsapp />} />
                            <Route path="/campaigns" element={<CampaignList />} />
                            <Route path="/campaigns/add" element={<CampaignAdd />} />
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
    { getSettings, getCampaigns }
)(AppRouter);