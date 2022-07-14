const fs = require("fs").promises;

const Contract = require("web3-eth-contract");

const util = require("./util-lib");
const psql = require("./psql.js");

const IPCLib = require("./ipc-lib.js");
const IPCGif = require("./ipc-gif.js");
const IPCCard = require("./ipc-card.js");
const IPCabi = require("./ipc-contract-abi.json");

const config = require("../react/src/config.js");

let  IPCDB_LOGGING = 0;

const IPCDB_SUCCESS = 0;
const IPCDB_ERROR = -1;

const IPCDB_EXISTING_IPC = 0;
const IPCDB_NEW_IPC = 1;
const IPCDB_GROUP_LIMIT = 32;

async function _web3_get_ipc_total(contract)
{
    let ipc_total = await contract.methods
        .totalIpcs().call()
        .catch(err => 0);

    if (ipc_total == 0)
        ipcdb_error("IPCDB_W3IPCTOTAL_FAILED");

    return ipc_total;
}

async function _web3_get_ipc(contract, token_id)
{
    let result = await contract.methods.getIpc(token_id).call()
        .catch(err => null);

    if (result == null)
    {
        ipcdb_error("IPCDB_W3GETIPC_FAILED");
        return null;
    }

    let ipc = new IPCLib.t_ipc();

    ipc.token_id = token_id;
    ipc.name = result.name;
    ipc.attribute_seed = result.attributeSeed;
    ipc.dna = result.dna;
    ipc.birth = parseInt(result.timeOfBirth);
    ipc.xp = parseInt(result.experience);
    ipc.last_updated = IPCLib.ipc_timestamp();

    return ipc;
}

async function _web3_get_owner_of(contract, ipc)
{
    let owner = await contract.methods
        .ownerOf(ipc.token_id).call()
        .catch(err => null);

    if (owner == null)
    {
        ipcdb_error("IPCDB_W3OWNEROF_FAILED");
        return IPCDB_ERROR;
    }
    else if (owner.match(/^(0x)?[A-Fa-f0-9]{24,256}$/) == null)
    {
        ipcdb_error("IPCDB_W3OWNEROF_BADFORMAT");
        return IPCDB_ERROR;
    }

    ipc.owner = owner;
    return IPCDB_SUCCESS;
}

async function _web3_get_ipc_price(contract, ipc)
{
    let market_info = await contract.methods
        .ipcToMarketInfo(ipc.token_id).call()
        .catch(err => null);

    if (market_info == null)
        ipcdb_error("IPCDB_W3MARKEYINFO_FAILED");

    ipc.price = market_info.sellPrice;
    return IPCDB_SUCCESS;
}

async function _web3_get_wallet_ipc_list(contract, wallet_addr)
{
    let wallet_ipc_list = await contract.methods
        .tokensOfOwner(wallet_addr).call()
        .catch(err => null);

    if (wallet_ipc_list == null)
    {
        ipcdb_error("IPCDB_W3WALLETIPCLIST_FAILED");
        return null;
    }

    return wallet_ipc_list;
}

// NOT CHECKED! UNUSED
async function _db_select_ipc_by_wallet_address(session, wallet_address, offset, limit)
{
    let client = session.client;
    let query = "SELECT * FROM ipc_list ";

    query+= "WHERE owner = $1 ORDER BY token_id ASC " 
    query+= "OFFSET $2 LIMIT $3;";

    let rows =  await client.query(
        { text: query, values: [ wallet_address, offdet, limit ],  rowMode: "array" })
        .then(res => res.rows)
        .catch(err => null);

    if (rows == null)
    {
        ipcdb_error("IPCDB_DBWALLETIPC_ERROR");
        return null;
    }

    return rows
}

async function _db_select_ipc_list(session, list, limit)
{
    let client = session.client;
    let query = "SELECT * FROM ipc_list "
    query+= "WHERE token_id IN (";

    let index = 0;
    for (; index < list.length; index++)
    {
        query+= "$" + (index + 1);
        if (index != list.length - 1)
            query+= ", ";
    }

    query+= ") ORDER BY token_id ASC LIMIT " + limit + ";"; 

    let rows =  await client.query(
        { text: query, values: list, rowMode: "array" })
        .then(res => res.rows)
        .catch(err => null);

    if (rows == null)
    {
        ipcdb_error("IPCDB_DBIPCLIST_ERROR");
        return null;
    }

    return rows
}

function ipcdb_error(error_msg)
{
    if (IPCDB_LOGGING == 1)
        util.util_log("ipcdb.log", error_msg);
}

function ipcdb_ipc_wallet_table()
{
    let table = psql.psql_table("ipc_wallet_list");

    psql.psql_add_item(table, "id", psql.PSQL_INTEGER, "SERIAL PRIMARY KEY");
    psql.psql_add_item(table, "wallet_address", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "token_json", psql.PSQL_STRING, "TEXT NOT NULL");
}

function ipcdb_ipc_table()
{
    let table = psql.psql_table("ipc_list");

    psql.psql_add_item(table, "id", psql.PSQL_INTEGER, "SERIAL PRIMARY KEY");
    psql.psql_add_item(table, "token_id", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "name", psql.PSQL_STRING, "VARCHAR(256) NOT NULL");

    psql.psql_add_item(table, "attribute_seed", psql.PSQL_STRING, "VARCHAR(256) NOT NULL");
    psql.psql_add_item(table, "dna", psql.PSQL_STRING, "VARCHAR(256) NOT NULL");
    psql.psql_add_item(table, "birth", psql.PSQL_INTEGER, "BIGINT");

    psql.psql_add_item(table, "price", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "gold", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "xp", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "owner", psql.PSQL_STRING, "VARCHAR(256) NOT NULL");

    psql.psql_add_item(table, "race", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "subrace", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "gender", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "height", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "skin_color", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "hair_color", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "eye_color", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "handedness", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "strength", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "force", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "sustain", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "tolerance", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "dexterity", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "speed", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "precision", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "reaction", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "intelligence", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "memory", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "processing", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "reasoning", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "constitution", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "healing", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "fortitude", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "vitality", psql.PSQL_INTEGER, "INTEGER");

    psql.psql_add_item(table, "luck", psql.PSQL_INTEGER, "INTEGER");
    psql.psql_add_item(table, "accessories", psql.PSQL_INTEGER, "VARCHAR(256) NOT NULL");
    psql.psql_add_item(table, "last_updated", psql.PSQL_INTEGER, "BIGINT");
   
    psql.psql_add_item(table, "meta", psql.PSQL_STRING, "TEXT NOT NULL");

    return table; 
}

function ipcdb_ipc_to_array(ipc)
{
    let values = new Array();

    values[0] = ipc.id;
    values[1] = ipc.token_id;
    values[2] = ipc.name;

    values[3] = ipc.attribute_seed;
    values[4] = ipc.dna;
    values[5] = ipc.birth;

    values[6] = ipc.price;
    values[7] = ipc.gold;
    values[8] = ipc.xp;
    values[9] = ipc.owner;

    values[10] = ipc.race;
    values[11] = ipc.subrace;
    values[12] = ipc.gender;
    values[13] = ipc.height;

    values[14] = ipc.skin_color;
    values[15] = ipc.hair_color;
    values[16] = ipc.eye_color;
    values[17] = ipc.handedness;

    values[18] = ipc.strength;
    values[19] = ipc.force;
    values[20] = ipc.sustain;
    values[21] = ipc.tolerance;

    values[22] = ipc.dexterity;
    values[23] = ipc.speed;
    values[24] = ipc.precision;
    values[25] = ipc.reaction;

    values[26] = ipc.intelligence;
    values[27] = ipc.memory;
    values[28] = ipc.processing;
    values[29] = ipc.reasoning;

    values[30] = ipc.constitution;
    values[31] = ipc.healing;
    values[32] = ipc.fortitude;
    values[33] = ipc.vitality;

    values[34] = ipc.luck;
    values[35] = ipc.accessories;
    values[36] = ipc.last_updated;

    try { values[37] = JSON.stringify(ipc.meta); }
    catch (err) { value[37] = ""; }

    return values;
}

// HACK
function ipcdb_array_to_ipc(rows)
{
    let ipc = new IPCLib.t_ipc();
    
    ipc.id = parseInt(rows[0]);
    ipc.token_id = parseInt(rows[1]);
    ipc.name = rows[2];

    ipc.attribute_seed = rows[3];
    ipc.dna = rows[4];
    ipc.birth = parseInt(rows[5]);
    
    ipc.price = parseInt(rows[6]);
    ipc.gold = parseInt(rows[7]);
    ipc.xp = parseInt(rows[8]);
    ipc.owner = rows[9];
    // FIX
    ipc.race = rows[10];
    ipc.subrace = rows[11];
    ipc.gender = rows[12];
    ipc.height = rows[13];
    // FIX
    ipc.skin_color = rows[14];
    ipc.hair_color = rows[15];
    ipc.eye_color = rows[16];
    ipc.handedness = rows[17];
    
    ipc.strength = rows[18];
    ipc.force = rows[19];
    ipc.sustain = rows[20];
    ipc.tolerance = rows[21];
    
    ipc.dexterity = rows[22];
    ipc.speed = rows[23];
    ipc.precision = rows[24];
    ipc.reaction = rows[25];
    
    ipc.intelligence = rows[26];
    ipc.memory = rows[27];
    ipc.processing = rows[28];
    ipc.reasoning = rows[29];
    
    ipc.constitution = rows[30];
    ipc.healing = rows[31];
    ipc.fortitude = rows[32];
    ipc.vitality = rows[33];
    
    ipc.luck = rows[34];
    ipc.accessories = parseInt(rows[35]);
    ipc.last_updated = parseInt(rows[36]);

    try { ipc.meta = JSON.parse(rows[37]); }
    catch(err) { ipc.meta = ""; }

    return ipc;
}

async function ipcdb_connect()
{
    let session = psql.psql_create_session(
        config.IPCDB_USERNAME,
        config.IPCDB_PASSWORD,
        config.IPCDB_DATABASE,
        config.IPCDB_HOST,
        config.PORT
    );

    let error_id = await psql.psql_connect(session);
    if (error_id == psql.PSQL_ERROR)
        return null;

    return session;
}

async function ipcdb_select_ipc(session, token_id)
{
    if (token_id == 0) return null;

    let table = ipcdb_ipc_table();
    let row = await psql.psql_table_select(session, table, "token_id", token_id);

    if (row == null) return null;
    if (row.length == 0) return null;

    return ipcdb_array_to_ipc(row[0]);
} 

async function ipcdb_insert_ipc(session, ipc)
{
    let table = ipcdb_ipc_table();
    let values = ipcdb_ipc_to_array(ipc);

    return await psql.psql_table_insert(session, table, values);
}

async function ipcdb_update_ipc(session, ipc)
{
    let table = ipcdb_ipc_table();
    let values = ipcdb_ipc_to_array(ipc);

    return await psql.psql_table_update(
        session, table, "token_id", ipc.token_id, values);
}

async function ipc_web3_timeout()
{
    new Promise((resolve) => {
        let timeout_id = setTimeout(() => {
            clearTimeout(timeout_id);
            resolve();
        }, config.IPCDB_WEB3_TIMEOUT);
    });
}

async function ipcdb_web3_get_ipc(token_id, ipc_total)
{
    if (token_id == 0) return null;

    Contract.setProvider(config.IPCDB_WEB3_PROVIDER);
    let contract = new Contract(IPCabi, config.IPCDB_WEB3_CONTRACTADDR);

    if (ipc_total == IPCDB_NEW_IPC)
    {
        ipc_total = await _web3_get_ipc_total(contract);

        if (ipc_total == 0) return null;
        else if (token_id > ipc_total) return null;

        await ipc_web3_timeout();
    }

    let ipc = await _web3_get_ipc(contract, token_id);
    if (ipc == null) return null;

    await ipc_web3_timeout();

    let error_id = await _web3_get_owner_of(contract, ipc);
    if (error_id != IPCDB_SUCCESS) return null;

    await ipc_web3_timeout()

    error_id = await _web3_get_ipc_price(contract, ipc);
    if (error_id != IPCDB_SUCCESS) return null;

    return ipc; 
}

async function ipcdb_web3_adddb_ipc(session, token_id)
{
    let ipc = await ipcdb_web3_get_ipc(token_id, IPCDB_NEW_IPC);
    if (ipc == null) return null;

    ipc = IPCLib.ipc_create_ipc_from_json(ipc);

    // Needs error checking.
    ipc.meta.sprite = await IPCGif.ipcgif_store(ipc);
    ipc.meta.card = await IPCCard.ipccard_store(ipc);

    ipc.last_updated = IPCLib.ipc_timestamp();
    ipc.id = await ipcdb_insert_ipc(session, ipc);

    return ipc;
}

async function ipcdb_web3_updatedb_ipc(session, ipc)
{
    let next_update = ipc.last_updated + config.IPCDB_IPC_NEXTUPDATE;
    let current_date = IPCLib.ipc_timestamp();

    if (next_update < current_date)
    {
        let chain_ipc = await ipcdb_web3_get_ipc(ipc.token_id, IPCDB_EXISTING_IPC);
        if (chain_ipc == null) return IPCDB_ERROR;

        ipc.name = chain_ipc.name;
        ipc.attribute_seed = chain_ipc.attribute_seed;
        ipc.dna = chain_ipc.dna;
        ipc.birth = chain_ipc.birth;
        ipc.xp = chain_ipc.xp;
        ipc.last_updated = current_date;

        if (chain_ipc.owner != "")
            ipc.owner = chain_ipc.owner;
        if (chain_ipc.price != 0)
            ipc.price = chain_ipc.price;

        // Needs to check for blank card.
        if (ipc.dna != chain_ipc.dna ||
          ipc.sprite == "" || ipc.card == "")
        {    
            ipc.meta.sprite = await IPCGif.ipcgif_store(ipc);
            if (ipc.name != chain_ipc.name || ipc.card == "")
                ipc.meta.card = await IPCCard.ipccard_store(ipc);
        }

        await ipcdb_update_ipc(session, ipc);
 
        return IPCDB_SUCCESS;
    }

    return IPCDB_SUCCESS;
}

async function ipcdb_web3_wallet_ipc_list(session, wallet_addr, offset, limit)
{
    Contract.setProvider(config.IPCDB_WEB3_PROVIDER);
    let contract = new Contract(IPCabi, config.IPCDB_WEB3_CONTRACTADDR);

    let token_list = await _web3_get_wallet_ipc_list(contract, wallet_addr);

    if (token_list == null) return null;
    else if (token_list.length == 0) return null;
    else if (offset >= token_list.length) return null;
  
    let ipc_list = new Array();

    let token_id = 0;
    let token_total = token_list.length;

    let index = 0;  
    for (; index < token_list.length; index++)
    {
        if (index >= limit) break;

        token_id = token_list[offset + index];
        token_id = parseInt(token_id);

        if (token_id != NaN)
            if (token_id > 0) ipc_list[index] = token_id;
    }

    rows = await _db_select_ipc_list(session, ipc_list, limit);

    if (rows == null) return null;
    if (rows.length == 0) return null;

    ipc_list = new Array();

    for (index = 0; index < rows.length; index++)
        ipc_list[index] = ipcdb_array_to_ipc(rows[index]);

    return { ipc_total: token_total, ipc_list: ipc_list }; 
}

async function ipcdb_restore_database(database)
{
    let session = await ipcdb_connect();
    if (session == null)
    {
        console.log("IPCDB_RESTOREDB_FAILED_1");
        ipcdb_error("IPCDB_RESTOREDB_FAILED");

        process.exit();
        return IPCDB_ERROR;
    }

    let table = ipcdb_ipc_table();
    await psql.psql_drop_table(session, table);

    let error_id = await psql.psql_create_table(session, table);
    if (error_id != psql.PSQL_SUCCESS)
    {
        console.log("IPCDB_RESTOREDB_FAILED_2");
        ipcdb_error("IPCDB_RESTOREDB_FAILED");

        process.exit();
        return IPCDB_ERROR;
    }

    let index = 0;
    let ipc = null, id = 0;

    for (; index < database.length; index++)
    {
        ipc = new IPCLib.t_ipc();

        ipc.token_id = index + 1;
        ipc.name = database[index].name 

        ipc.attribute_seed = database[index].attribute_seed; 
        ipc.dna = database[index].dna; 
        ipc.birth = database[index].birth; 
        ipc.price = database[index].price; 
        ipc.xp = database[index].xp; 
        ipc.owner = database[index].owner; 
        ipc.accessories = database[index].accessories;
        ipc.meta = database[index].meta;

        ipc = IPCLib.ipc_create_ipc_from_json(ipc);

        ipc.meta.sprite = await IPCGif.ipcgif_store(ipc);
        ipc.meta.card = await IPCCard.ipccard_store(ipc);

        ipc.last_updated = IPCLib.ipc_timestamp();

        id = await ipcdb_insert_ipc(session, ipc);
        if (id == psql.PSQL_ERROR)
        {
            console.log("IPCDB_RESTOREDB_FAILED_3");
            ipcdb_error("IPCDB_RESTOREDB_FAILED");

            process.exit();
            return IPCDB_ERROR;
        }
    }

    console.log("IPCDB_RESTOREDB_SUCCESS");
    ipcdb_error("IPCDB_RESTOREDB_SUCCESS");

    process.exit();
    return IPCDB_SUCCESS;
}

async function ipcdb_backup_database()
{
    let session = await ipcdb_connect();
    if (session == null)
    {
        console.log("IPCDB_BACKUPDB_FAILED");
        ipcdb_error("IPCDB_BACKUPDB_FAILED");

        return IPCDB_ERROR;
    } 

    let table = ipcdb_ipc_table();

    let rows = await psql.psql_table_dump(session, table);
    if (rows == null)
    {
        console.log("IPCDB_BACKUPDB_FAILED");
        ipcdb_error("IPCDB_BACKUPDB_FAILED");

        return IPCDB_ERROR;
    }

    let backup = new Array();

    let index = 0;
    for (; index < rows.length; index++)
        backup[index] = ipcdb_array_to_ipc(rows[index]);

    let error_id = await fs.writeFile(
        "backup.json",
        JSON.stringify(backup))
            .then(res => IPCDB_SUCCESS)
            .catch(err => IPCDB_ERROR);

    if (error_id == IPCDB_ERROR)
    {
        console.log("IPCDB_BACKUPDB_FAILED");
        ipcdb_error("IPCDB_BACKUPDB_FAILED");

        return IPCDB_ERROR;
    }

    ipcdb_error("IPCDB_BACKUPDB_SUCCESS");

    session.client.end();
    process.exit();
    return IPCDB_ERROR; 
}

const IPCDBLib = {
    IPCDB_LOGGING: IPCDB_LOGGING,

    IPCDB_SUCCESS: IPCDB_SUCCESS,
    IPCDB_ERROR: IPCDB_ERROR,

    IPCDB_EXISTING_IPC: IPCDB_EXISTING_IPC,
    IPCDB_NEW_IPC: IPCDB_NEW_IPC,
    IPCDB_GROUP_LIMIT: IPCDB_GROUP_LIMIT,

    ipcdb_ipc_wallet_table: ipcdb_ipc_wallet_table,
    ipcdb_ipc_table: ipcdb_ipc_table,

    ipcdb_ipc_to_array: ipcdb_ipc_to_array,
    ipcdb_array_to_ipc: ipcdb_array_to_ipc,

    ipcdb_connect: ipcdb_connect,
    ipcdb_select_ipc: ipcdb_select_ipc,
    ipcdb_insert_ipc: ipcdb_insert_ipc,
    ipcdb_update_ipc: ipcdb_update_ipc,

    ipcdb_web3_get_ipc: ipcdb_web3_get_ipc,
    ipcdb_web3_adddb_ipc: ipcdb_web3_adddb_ipc,
    ipcdb_web3_updatedb_ipc: ipcdb_web3_updatedb_ipc,
    ipcdb_web3_wallet_ipc_list: ipcdb_web3_wallet_ipc_list,

    ipcdb_restore_database,
    ipcdb_backup_database
};

module.exports = IPCDBLib;
