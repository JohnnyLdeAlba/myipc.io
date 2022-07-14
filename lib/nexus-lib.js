const fs = require('fs').promises;

class t_nexus
{
    WEB_NAME = "";
    WEB_URL = "";
    WEB_PATH = "";
    WEB_AUTH = "";
    WEB_SERIAL = "";
 
    PAGE_TITLE = "";
    PAGE_DESCRIPTION = ""; 
    PAGE_LOCAL_PATH = "";
    PAGE_CARD = ""; 
    PAGE_STYLE = "";
    PAGE_REFRESH = "";

    template = null; 
}

function nx_nexus_create()
{
    nexus = new t_nexus();

    nexus.WEB_NAME = "";
    nexus.WEB_URL = "";
    nexus.WEB_PATH = "";
    nexus.WEB_AUTH = "";
    nexus.WEB_SERIAL = "";

    nexus.PAGE_TITLE = "";
    nexus.PAGE_DESCRIPTION = "";
    nexus.PAGE_LOCAL_PATH = "";
    nexus.PAGE_CARD = "card.png";
    nexus.PAGE_STYLE = "default.css";
    nexus.PAGE_REFRESH = "";

    nexus.template = new Array();  
 
    return nexus; 
}

async function nx_load_template(nexus, template, slot)
{
    let data = await fs.readFile(
        nexus.WEB_PATH + "templates/" + template + ".htm")
        .catch(err => "NEXUS_LOADTEMPLATE_FAILED");

    return data.toString();
}

function nx_insert_template(search, replace, output)
{
    return output.replace(search, replace);
}

function nx_update_template(nexus, output)
{
    output = output.replace(/{WEB_NAME}/g, nexus.WEB_NAME);
    output = output.replace(/{WEB_URL}/g, nexus.WEB_URL);
    output = output.replace(/{WEB_PATH}/g, nexus.WEB_PATH);
    output = output.replace(/{WEB_SERIAL}/g, nexus.WEB_SERIAL);
 
    output = output.replace(/{PAGE_TITLE}/g, nexus.PAGE_TITLE);
    output = output.replace(/{PAGE_DESCRIPTION}/g, nexus.PAGE_DESCRIPTION);
    output = output.replace(/{PAGE_LOCAL_PATH}/g, nexus.PAGE_LOCAL_PATH);
    output = output.replace(/{PAGE_CARD}/g, nexus.PAGE_CARD);
    output = output.replace(/{PAGE_STYLE}/g, nexus.PAGE_STYLE);
    output = output.replace(/{PAGE_REFRESH}/g, nexus.PAGE_REFRESH);

    return output;
}

module.exports = {
    nx_nexus_create,
    nx_load_template,
    nx_insert_template,
    nx_update_template
};
