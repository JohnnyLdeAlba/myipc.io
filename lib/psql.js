
const { Pool, Client } = require("pg");
const util = require("./util-lib.js");

let PSQL_LOGGING = 0;

const PSQL_DESCENDING = 0;
const PSQL_ASCENDING = 1;

const PSQL_INTEGER = 0;
const PSQL_STRING = 1;

const PSQL_SUCCESS = 0;
const PSQL_ERROR = -1;

function t_psql_item()
{
    this.label = "";
    this.type = 0;
    this.format = "";
}

function t_psql_table()
{
    this.id = "";
    this.total = 0;
    this.last_item = 0;
    this.items = null;
}

function t_psql_session()
{
    this.pool = null;
    this.client = null;
}

function psql_error(error_msg)
{
    if (PSQL_LOGGING == 1)
        util.util_log("psql.log", error_msg);
}

function psql_table(id)
{
    let psql_table = new t_psql_table();

    psql_table.id = id;
    psql_table.items = new Array();

    return psql_table;
}

function psql_add_item(psql_table, label, type, format)
{
    let psql_item = new t_psql_item();

    psql_item.label = label;
    psql_item.type = type;
    psql_item.format = format;

    psql_table.items.push(psql_item);

    psql_table.last_item = psql_table.total;
    psql_table.total++;

    return psql_item;
}

function psql_create_session(
    username,
    password,
    database,
    host,
    port)
{
   let session = new t_psql_session();

   session.pool = new Pool({
        user: username,
        password: password,
        database: database,
        host: host,
        port: port
    });

    return session;
}

async function psql_connect(session)
{        
    let client = await session.pool.connect()
        .catch(err => null)

    if (client == null)
    {
        psql_error("PSQL_CONNECT_ERROR");        
        return PSQL_ERROR;
    }

    session.client = client;
    return PSQL_SUCCESS;
}

async function psql_create_table(session, table)
{
    let client = session.client;
    let query = "CREATE TABLE " + table.id + " ( ";

    let index = 0, item = null;
    for (; index < table.total; index++)
    {
        item = table.items[index];

        query+= item.label + " " + item.format;
        if (index != table.last_item)
            query+= ", ";
    }

    query+= " );";

    let error_id =  await client.query({ text: query })
        .then(res => PSQL_SUCCESS)
        .catch(err => PSQL_ERROR);

    if (error_id == PSQL_ERROR)
        psql_error("PSQL_CREATE_ERROR");

    return error_id;
}

async function psql_drop_table(session, table)
{
    let client = session.client;
    let query = "DROP TABLE " + table.id + ";";

    let error_id = await client.query({ text: query })
        .then(res => PSQL_SUCCESS)
        .catch(err => PSQL_ERROR);

    if (error_id == PSQL_ERROR)
        psql_error("PSQL_DROP_ERROR");

    return error_id;
}

async function psql_table_insert(session, table, values)
{
    let client = session.client;
    let query = "INSERT INTO " + table.id + " ( ";

    let index = 1, item = null;
    for (; index < table.total; index++)
    {
        item = table.items[index];

        query+= item.label;
        if (index != table.last_item)
            query+= ", ";
    }

    query+= " ) VALUES ( ";

    for (index = 1; index < table.total; index++)
    {
        query+= "$" + index;
        if (index != table.last_item)
            query+= ", ";
    }

    item = table.items[0];
    query+= " ) RETURNING "+item.label+";";

    let result = new Array();
    for (index = 0; index < table.total - 1; index++)
        result[index] = values[index + 1];

    let id = await client.query({ text: query, values: result, rowMode: "array"  })
        .then(res => res.rows[0][0])
        .catch(err => PSQL_ERROR);
    
    if (id == PSQL_ERROR)
        psql_error("PSQL_INSERT_ERROR");

    return id;
}

async function psql_table_update(session, table, label, id, values)
{
    let client = session.client;
    let query = "UPDATE " + table.id + " SET ";

    let index = 1, item = null;
    for (; index < table.total; index++)
    {
        item = table.items[index];
        query+= item.label + " = $" + index;
        if (index != table.last_item)
            query+= ", ";
    }

    query+= " WHERE " + label + " = $"+ values.length +";";

    let result = new Array();
    for (index = 0; index < table.total - 1; index++)
        result[index] = values[index + 1];
    result[index] = id;

    let error_id =  await client.query({ text: query, values: result })
        .then(res => PSQL_SUCCESS)
        .catch(err => PSQL_ERROR);

    if (error_id == PSQL_ERROR)
        psql_error("PSQL_UPDATE_ERROR");

    return error_id;
}

async function psql_table_select(session, table, label, id)
{
    let client = session.client;
    let query = "SELECT * FROM " + table.id + " WHERE " + label + " = $1;";

    let rows =  await client.query(
        { text: query, values: [ id ], rowMode: "array" })
        .then(res => res.rows)
        .catch(err => null);

    if (rows == null)
        psql_error("PSQL_SELECT_ERROR");

    return rows
}

async function psql_table_select_all(session, table, label, limit, order)
{
    let client = session.client;

    let query = "SELECT * FROM " + table.id;
    query+= " ORDER BY " + label;
  
    if (order == PSQL_DESCENDING)
        query+= " DESC ";
    else
        query+= " ASC ";

    query+= " LIMIT " + limit + ";";

    let rows =  await client.query(
        { text: query, rowMode: "array" })
        .then(res => res.rows)
        .catch(err => null);

    if (rows == null)
        psql_error("PSQL_SELECT_ERROR");

    return rows
}

async function psql_table_dump(session, table)
{
    let client = session.client;

    let query = "SELECT * FROM " + table.id;
    query+= " ORDER BY token_id ASC;";

    return await client.query(
        { text: query, rowMode: "array" })
        .then(res => res.rows)
        .catch(err => null);

    if (rows == null)
        psql_error("PSQL_SELECT_ERROR");

    return rows
}

async function psql_table_delete(session, table, label, id)
{
    let client = session.client;
    let query = "DELETE FROM " + table.id + " WHERE " + label + " = $1;";

    let error_id =  await client.query(
        { text: query, values: [ id ]})
        .then(res => PSQL_SUCCESS)
        .catch(err => PSQL_ERROR);

    if (error_id == PSQL_ERROR)
        psql_error("PSQL_DELETE_ERROR");

    return error_id;
}

const PSQLLib = {

    PSQL_LOGGING: PSQL_LOGGING,
    PSQL_DESCENDING: PSQL_DESCENDING,
    PSQL_ASCENDING: PSQL_ASCENDING,

    PSQL_INTEGER: PSQL_INTEGER,
    PSQL_STRING: PSQL_STRING,

    PSQL_SUCCESS: PSQL_SUCCESS,
    PSQL_ERROR: PSQL_ERROR,

    t_psql_item: t_psql_item,
    t_psql_table: t_psql_table,

    psql_table: psql_table,
    psql_add_item: psql_add_item,
    psql_create_session: psql_create_session,
    psql_connect: psql_connect,
    psql_create_table: psql_create_table,
    psql_drop_table: psql_drop_table,
    psql_table_insert: psql_table_insert,
    psql_table_update: psql_table_update,
    psql_table_select: psql_table_select,
    psql_table_select_all: psql_table_select_all,
    psql_table_dump: psql_table_dump,
    psql_table_delete: psql_table_delete
};

module.exports = PSQLLib;
