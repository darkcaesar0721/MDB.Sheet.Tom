import React, {Fragment} from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import MDBPath from "./components/Path/MDBPath";
import SchedulePath from "./components/Path/SchedulePath";
import Campaigns from "./components/Campaigns";
import CampaignAdd from "./components/CampaignAdd";
import CampaignEdit from "./components/CampaignEdit";
import GroupAdd from "./components/GroupAdd";
import GroupAddSetting from "./components/GroupAddSetting";
import GroupEdit from "./components/GroupEdit";
import GroupEditSetting from "./components/GroupEditSetting";
import Groups from "./components/Groups";
import Upload from "./components/Upload";
import UploadPreview from "./components/CampaignUploadPreview";
import GroupCampaignUpload from "./components/GroupCampaignUpload";
import GroupCampaignSetting from "./components/GroupCampaignSetting";
import Backup from "./components/Backup";
import WhatsApp from "./components/WhatsApp";

export const DASHBOARD = '/';

export const AppRouter = () => {
    return (
        <HashRouter>
            <Fragment>
                <main>
                    <Routes>
                        <Route path={DASHBOARD}>
                            <Route index path="/" element={<Upload />} />
                            <Route path="/backup" element={<Backup />} />
                            <Route path="/whatsapp" element={<WhatsApp />} />
                            <Route path="/mdb" element={<MDBPath />} />
                            <Route path="/schedule" element={<SchedulePath />} />
                            <Route path="/campaigns" element={<Campaigns />} />
                            <Route path="/campaigns/add" element={<CampaignAdd />} />
                            <Route path="/campaigns/:index" element={<CampaignEdit />} />
                            <Route path="/groups" element={<Groups />} />
                            <Route path="/groups/add" element={<GroupAdd />} />
                            <Route path="/groups/add/:index" element={<GroupAddSetting />} />
                            <Route path="/groups/:index" element={<GroupEdit />} />
                            <Route path="/groups/:index/status/:status" element={<GroupEdit />} />
                            <Route path="/groups/:groupIndex/:campaignIndex" element={<GroupEditSetting />} />
                            <Route path="/groups/:groupIndex/:groupCampaignIndex/:campaignIndex" element={<GroupCampaignSetting />} />
                            <Route path="/upload/:groupIndex/:groupCampaignIndex/:campaignIndex" element={<GroupCampaignUpload />} />
                            <Route path="/preview/:groupIndex/:groupCampaignIndex/:campaignIndex" element={<UploadPreview />} />
                        </Route>
                    </Routes>
                </main>
            </Fragment>
        </HashRouter>
    )
}