import React, {Fragment, useEffect} from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {
    getSetting
} from "./redux/actions/setting";

import Backup from "./components/Settings/Backup";
import Whatsapp from "./components/Settings/Whatsapp";

const DASHBOARD = '/';

const AppRouter = (props) => {

    useEffect(function() {
        props.getSetting();
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
    { getSetting }
)(AppRouter);