const Groups = require("../models/group.model");
const moment = require("moment");

const updateCampaignPauseStatus = async function () {
    const groups = await Groups.find();
    const today = new Date(moment().format("M/D/Y"));

    for (const group of groups) {
        const campaigns = [...group.campaigns];

        let updatedCampaigns = [];
        for (const campaign of campaigns) {
            let updatedCampaign = {...campaign};
            // console.log(updatedCampaign);

            if (campaign.pause.status) {
                if (campaign.pause.type === 'TOTALLY') {
                    updatedCampaign = Object.assign(campaign, {color: 'red', is_manually_upload: false});
                } else { //pause type is PERIOD
                    const startDate = new Date(moment(campaign.pause.period.start).format('M/D/Y'));
                    const endDate = new Date(moment(campaign.pause.period.end).format('M/D/Y'));

                    if (today < startDate) {
                        updatedCampaign = Object.assign(campaign, {color: campaign.color !== 'purple' ? campaign.color : 'green', is_manually_upload: true});
                    } else if (startDate <= today && endDate >= today) {
                        updatedCampaign = Object.assign(campaign, {color: 'purple', is_manually_upload: false});
                    } else {
                        updatedCampaign = Object.assign(campaign, {color: 'green', pause: {status: false, type: 'TOTALLY'}, is_manually_upload: true});
                    }
                }
            }
            updatedCampaigns = [...updatedCampaigns, updatedCampaign];
        }

        const updatedGroup = Object.assign({...group}, {campaigns: updatedCampaigns});
        await Groups.findByIdAndUpdate(group._id, updatedGroup);
    }
}

module.exports = {
    updateCampaignPauseStatus
}