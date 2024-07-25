const Groups = require("../models/group.model");

const addAnotherPhones = async function() {
    const groups = await Groups.find();

    for (const group of groups) {
        const campaigns = [...group.campaigns];

        let updatedCampaigns = [];
        for (const campaign of campaigns) {
            let updatedCampaign = {};

            if (campaign.columns.filter(c => c.mdb_name === 'conCellPhone').length === 0) {
                let updatedColumns = [];
                campaign.columns.forEach(c => {
                    updatedColumns.push(c);
                    if (c.sheet_name === 'Phone') {
                        updatedColumns.push({mdb_name: 'conCellPhone', sheet_name: 'Phone 2', is_display: false});
                        updatedColumns.push({mdb_name: 'conEveningPhone', sheet_name: 'Phone 3', is_display: false});
                    }
                })
                updatedCampaign = Object.assign(campaign, {columns: updatedColumns});
            }
            updatedCampaigns = [...updatedCampaigns, updatedCampaign];
        }

        const updatedGroup = Object.assign({...group}, {campaigns: updatedCampaigns});
        await Groups.findByIdAndUpdate(group._id, updatedGroup);
    }
}

module.exports = {
    addAnotherPhones: addAnotherPhones
}