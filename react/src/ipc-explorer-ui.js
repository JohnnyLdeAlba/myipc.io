const UI_IPC_MAX = 2828;

function ipc_generate_dice_image(value)
{
    let dice_image = new Image();

    if (value > 0 && value <= 6)
        dice_image.src = "dice/dice-" + value + ".svg";
    else
        dice_image.src = "dice/dice-1.svg";

    dice_image.classList.add("attrib-dice-icon");
    return dice_image;
}

function ipc_set_attribute(id, value)
{
    let dice_image = ipc_generate_dice_image(value);
    let element = document.getElementById(id);

    dom_remove_all_children(element);
    element.appendChild(dice_image);     
}

function ipcui_update_race_symbol(subrace)
{
    let table = [
        "ipc-elf-night", // FIX!
        "ipc-elf-night",
        "ipc-elf-wood",
        "ipc-elf-high",
        "ipc-elf-sun",
        "ipc-elf-dark",

        "ipc-human-mythic",
        "ipc-human-mythic",
        "ipc-human-nordic",
        "ipc-human-eastern",
        "ipc-human-coastal",
        "ipc-human-southern",

        "ipc-dwarf-quarry",
        "ipc-dwarf-quarry",
        "ipc-dwarf-mountain",
        "ipc-dwarf-lumber",
        "ipc-dwarf-hill",
        "ipc-dwarf-volcano",

        "ipc-orc-ash",
        "ipc-orc-ash",
        "ipc-orc-sand",
        "ipc-orc-plains",
        "ipc-orc-swamp",
        "ipc-orc-blood"
    ];

    let element = null;
    let index = 0;

    for (; index < table.length; index++)
    {
        element = document.getElementById(table[index]);
        if (element != null)
            element.style.display = "none";
    }

    element = document.getElementById(table[subrace]);
    if (element != null)
        element.style.display = "inline-block";
 
}

function ipcui_update_form(id, ipc)
{
    label_ipc = ipc_create_label_ipc(ipc, IPCEnglish);

    document.getElementById("ipc-name").innerHTML = "#"+id+" - "+label_ipc.name;

    document.getElementById("ipc-birth").innerHTML = label_ipc.birth;
    document.getElementById("ipc-price").innerHTML = label_ipc.price;
    document.getElementById("ipc-xp").innerHTML = label_ipc.xp;
    document.getElementById("ipc-owner").innerHTML = label_ipc.owner;

    document.getElementById("ipc-race").innerHTML = label_ipc.race;
    document.getElementById("ipc-subrace").innerHTML = label_ipc.subrace;
    document.getElementById("ipc-gender").innerHTML = label_ipc.gender;
    document.getElementById("ipc-height").innerHTML = label_ipc.height;
    document.getElementById("ipc-skin-color").innerHTML = label_ipc.skin_color;
    document.getElementById("ipc-hair-color").innerHTML = label_ipc.hair_color;
    document.getElementById("ipc-eye-color").innerHTML = label_ipc.eye_color;
    document.getElementById("ipc-handedness").innerHTML = label_ipc.handedness;

    document.getElementById("ipc-strength").innerHTML = label_ipc.strength;
    document.getElementById("ipc-dexterity").innerHTML = label_ipc.dexterity;
    document.getElementById("ipc-intelligence").innerHTML = label_ipc.intelligence;
    document.getElementById("ipc-constitution").innerHTML = label_ipc.constitution;

    document.getElementById("ipc-luck").innerHTML = label_ipc.luck;
    document.getElementById("ipc-status").innerHTML = "Last Updated: " +  label_ipc.last_updated;

    ipc_set_attribute("ipc-force", ipc.force);
    ipc_set_attribute("ipc-sustain", ipc.sustain);
    ipc_set_attribute("ipc-tolerance", ipc.tolerance);

    ipc_set_attribute("ipc-speed", ipc.speed);
    ipc_set_attribute("ipc-precision", ipc.precision);
    ipc_set_attribute("ipc-reaction", ipc.reaction);

    ipc_set_attribute("ipc-memory", ipc.memory);
    ipc_set_attribute("ipc-processing", ipc.processing);
    ipc_set_attribute("ipc-reasoning", ipc.reasoning);

    ipc_set_attribute("ipc-healing", ipc.healing);
    ipc_set_attribute("ipc-fortitude", ipc.fortitude);
    ipc_set_attribute("ipc-vitality", ipc.vitality);

    ipcui_update_race_symbol(ipc.subrace);
}

function ipc_set_sprite(ipc)
{
    let dom_sprite = document.getElementById("ipc-sprite");
    let sprite = new Image();

    if (dom_sprite.firstChild)
         dom_sprite.removeChild(dom_sprite.firstChild);

    sprite.classList.add("sprite");
    sprite.src = "sprites/" + ipc.meta.sprite + ".gif";

    dom_sprite.appendChild(sprite);
}

function ipcui_get_randomized_token_id()
{
    let random_id = Math.random() * 1000;

    random_id+= Date.now();
    random_id = parseInt(random_id);
    random_id%= UI_IPC_MAX;

    return random_id;;
}

function ipcui_set_alert(alert_class, alert_caption, alert_body, hide_explorer)
{    
    let previous_class = document.getElementById("ipc-alert").classList[0];

    document.getElementById("ipc-alert").classList.remove(previous_class);
    document.getElementById("ipc-alert").classList.add(alert_class);

    previous_class = document.getElementById("ipc-alert-icon").classList[0];

    document.getElementById("ipc-alert-icon").classList.remove(previous_class);
    document.getElementById("ipc-alert-icon").classList.add(alert_class + "-icon");

    previous_class = document.getElementById("ipc-alert-close").classList[0];

    document.getElementById("ipc-alert-close").classList.toggle(previous_class);
    document.getElementById("ipc-alert-close").classList.toggle(alert_class + "-close");

    document.getElementById("ipc-alert").style.display = "block";

    if (typeof hide_explorer == "undefined")
        document.getElementById("ipc-explorer").style.display = "block";
    else
        document.getElementById("ipc-explorer").style.display = "none";

    document.getElementById("ipc-alert-caption").innerHTML = alert_caption;
    document.getElementById("ipc-alert-body").innerHTML = alert_body;
}

async function _get_backup_database(ipc_explorer, token_id)
{
    let result = null;
    let config = ipc_explorer.config;

    if (ipc_explorer.database == null)
    {
        ipc_enable_indicator(ipc_explorer);

        result = await fetch(config.WEB_ROOT + "backup.json")
            .then(res => res.json())
            .catch(err => null);

        ipc_disable_indicator(ipc_explorer);

        if (result == null)
        {
            ipcui_set_alert(
                "alert-warning",
                "Database/Backup Error",
                "Unable to connect to database, backup file not found. " +
                "Please try again later.");

            return null;
        }

        ipcui_set_alert(
            "alert-warning",
            "Database Error",
            "Unable to connect to database, using backup file: " +
            "Warning results may be out of date.");

        ipc_explorer.database = result;
    }
        
    token_id--;
    if (token_id >= ipc_explorer.database.length)
        return;
 
    ipc = ipc_explorer.database[token_id];
    return ipc; 
}

// /^(0x)?[A-Fa-f0-9]{24,256}$/

async function ipcui_wallet_ipc_list(ipc_explorer, wallet_addr, ipc_index)
{
    let config = ipc_explorer.config;

    if (typeof ipc_index == "undefined")
        ipc_index = 0;

    if (ipc_explorer.wallet != null && ipc_explorer.ipc != null)
    {
        if (ipc_explorer.wallet.wallet_address == wallet_addr &&
            ipc_explorer.wallet.wallet_address == ipc_explorer.ipc.owner &&
            ipc_explorer.wallet.ipc_index == ipc_index)
        {
            document.getElementById("ipc-explorer").style.display = "none";
            document.getElementById("ipc-wallet").style.display = "block";
            document.getElementById("ipc-alert").style.display = "none";

            return;
        }
    }

    if (typeof ipc_index == "undefined")
        ipc_index = 0;

    ipc_enable_indicator(ipc_explorer);

    // ERROR CHECK

    let result = await fetch(config.WEB_ROOT + "wallet_addr/"+ wallet_addr +
        "/group_index/"+ipc_index+"/group_limit/24")
        .then(res => res.json())
        .catch(err => null);

    ipc_disable_indicator(ipc_explorer)

    if (result == null)
    {
        ipcui_set_alert(
            "alert-error",
            "Fatal Error",
            "Please report this to the System Administrator.", 1);

        return;
    }
    else if (result.status_label != "IPCDB_SUCCESS")
    {
        if (result.status_label == "IPCDB_WALLET_EMPTY")
        {
            ipcui_set_alert(
                "alert-info",
                "Wallet Empty",
                "Wallet Address " + wallet_addr + " has no IPCs.", 1);

            return;
        }
        else if (result.status_label == "IPCDB_WALLETADDR_BADFORMAT" ||
                 result.status_label == "IPCDB_INVALID_WALLETADDR")
        {
            ipcui_set_alert(
                "alert-error",
                "Invalid Wallet Address",
                "The wallet address entered is invalid.", 1);

            return;
        }
 
    }

    let ipc_total = result.responce.ipc_total;
    let ipc_list = result.responce.ipc_list;
    if (ipc_list == 0) return;

    ipc_wallet_destroy(ipc_explorer.wallet);
    let wallet = ipc_explorer.wallet;

    wallet.wallet_address = wallet_addr;
    wallet.ipc_index = ipc_index;
    wallet.ipc_limit = 24;
    wallet.ipc_total = ipc_total;

    ipc_wallet_add_ipc_list(wallet, ipc_list);
    ipc_wallet_update(wallet);

    document.getElementById("ipc-explorer").style.display = "none";
    document.getElementById("ipc-wallet").style.display = "block";
    document.getElementById("ipc-alert").style.display = "none";

    return;
}

async function ipcui_get_ipc(ipc_explorer, token_id)
{
    let config = ipc_explorer.config;

    if (ipc_explorer.ipc != null)
    {
        if (ipc_explorer.ipc.token_id == token_id)
        {
            document.getElementById("ipc-explorer").style.display = "block";
            document.getElementById("ipc-wallet").style.display = "none";
            document.getElementById("ipc-alert").style.display = "none";

            return 0;
        }
    }

    if (token_id == "" || typeof token_id == "undefined")
        token_id = ipcui_get_randomized_token_id();

    // FIX
    token_id = token_id.toString();
    if (token_id.match(/^(0x|0X)/) != null)
    {
        ipcui_wallet_ipc_list(ipc_explorer, token_id);
        return 0; 
    }

    if (token_id.match(/^\d+$/) == null)
    {
        ipcui_set_alert(
            "alert-error",
            "IPC Token ID Error",
            "IPC Token ID Must be a number and greater than 0.");

        return 0;
    }

    token_id = parseInt(token_id);
    if (token_id <= 0)
    {
        ipcui_set_alert(
            "alert-error",
            "IPC Token ID Error",
            "IPC Token ID must be greater than 0.");

        return 0;
    }

    ipc_enable_indicator(ipc_explorer);

    result = await fetch(config.WEB_ROOT + "token_id/"+token_id)
        .then(res => res.json())
        .catch(err => null);

    ipc_disable_indicator(ipc_explorer)

    if (result == null)
    {
        ipc = await _get_backup_database(ipc_explorer, token_id);
        if (ipc == null) return -1;
 
    }
    else if (result.status_label != "IPCDB_SUCCESS")
    {
        if (result.status_label == "IPCDB_CONNECT_ERROR")
        {
            ipc = await _get_backup_database(ipc_explorer, token_id);
            if (ipc == null) return -1;
        }
        else if (result.status_label == "IPCDB_IPC_NOTFOUND")
        {
            ipcui_set_alert(
                "alert-error",
                "IPC Error",
                "IPC "+token_id+" does not exist.",
                1);

            return -1;
        }
    }
    else ipc = result.responce;

    ipc = IPCLib.ipc_create_ipc_from_json(ipc);
    ipcui_update_form(token_id, ipc)

    ipc_set_sprite(ipc);

    ipc_explorer.wallet.ipc_index = -1; // Trigger a reload when viewing wallet and changing character.
    ipc_explorer.ipc = ipc;

    ipc_wallet_destroy(ipc_explorer.wallet);

    document.getElementById("ipc-explorer").style.display = "block";
    document.getElementById("ipc-wallet").style.display = "none";
    document.getElementById("ipc-alert").style.display = "none";

    return 0;
}

function t_ipc_explorer()
{
    this.config = null;
    this.indicator_id = 0;
    this.indicator_index = 0;

    this.ipc = null;
    this.wallet = null;
    this.database = null;
    this.sprite = null;
}

function ipc_enable_indicator(ipc_explorer)
{
    document.getElementById("ipc-explorer").style.display = "none";
    document.getElementById("ipc-wallet").style.display = "none";
    document.getElementById("ipc-qr-reader").style.display = "none";
    document.getElementById("ipc-alert").style.display = "none";
    document.getElementById("ipc-loader").style.display = "block";

    ipc_explorer.indicator_id = setInterval(() => {

        let table = [
            "Loading",
            "Loading.",
            "Loading..",
            "Loading...",
            "Loading....",
        ];

        ipc_explorer.indicator_index++;
        if (ipc_explorer.indicator_index >= table.length)
             ipc_explorer.indicator_index = 0;

        let index = ipc_explorer.indicator_index;

        document.getElementById("ipc-search-textin").value = "";
        document.getElementById("ipc-search-textin").placeholder = table[index];
    }, 500);
}

function ipc_disable_indicator(ipc_explorer)
{
    clearInterval(ipc_explorer.indicator_id);

    document.getElementById("ipc-search-textin").value = "";
    document.getElementById("ipc-search-textin").placeholder = "Search by IPC Token ID/Wallet Address";

    document.getElementById("ipc-loader").style.display = "none";
}

async function main(config)
{
    let QrScanner = await import("./qr-scanner-master/qr-scanner.min.js")
        .then(module => module.default);

    let ipc_explorer = new t_ipc_explorer();
    ipc_explorer.config = config;

    let wallet = ipc_create_wallet("wallet-body", null); 

    wallet.resource = ipc_explorer;
    wallet.handler = ipcui_get_ipc;
    wallet.wallet_ipc_list = ipcui_wallet_ipc_list;

    ipc_explorer.wallet = wallet;

    if (config.PARAMS_TOKEN_ID > 0)
        ipcui_get_ipc(ipc_explorer,
            config.PARAMS_TOKEN_ID);
    else
        ipcui_get_ipc(ipc_explorer, ipcui_get_randomized_token_id());
 

    document.getElementById("link-qr-reader")
        .addEventListener("mousedown", (event) => {

        document.getElementById("ipc-explorer").style.display = "none";
        document.getElementById("ipc-wallet").style.display = "none";
        document.getElementById("ipc-qr-reader").style.display = "block";
        document.getElementById("ipc-alert").style.display = "none";
        document.getElementById("ipc-loader").style.display = "none";

    });

    document.getElementById("ipc-search-textin")
        .addEventListener("keyup", (event) => {
        if (event.key === "Enter" || event.keyCode === 13)
            if (event.target.value == "")
                window.location = ipcui_get_randomized_token_id();
            else
                window.location = event.target.value;
    });

    document.getElementById("ipc-search-control")
        .addEventListener("mousedown", (event) => {
            let textin = document.getElementById("ipc-search-textin");

            if (textin.value == "")
                window.location = ipcui_get_randomized_token_id();
            else
                window.location = textin.value;
    });

    document.getElementById("ipc-visit-wallet")
        .addEventListener("mousedown", (event) => {

        if (ipc_explorer.ipc == null) return;
            
        let wallet_address = ipc_explorer.ipc.owner;
        ipcui_wallet_ipc_list(ipc_explorer, wallet_address);
    });


    document.getElementById("ipc-copy-address")
        .addEventListener("mousedown", (event) => {

        let wallet_address = ""
        if (ipc_explorer.ipc != null)
            wallet_address = ipc_explorer.ipc.owner;

        let value = "";
        if (!navigator.clipboard)
        {
            value = document.getElementById("ipc-search-textin").value;
            document.getElementById("ipc-search-textin").value = wallet_address;

            document.getElementById("ipc-search-textin").focus();
            document.getElementById("ipc-search-textin").select();

            document.execCommand('copy');
            document.getElementById("ipc-search-textin").value = value;
        }        
        else navigator.clipboard.writeText(wallet_address);

        ipcui_set_alert(
            "alert-info",
            "Wallet Address Copied",
            "Wallet address has been copied to the clipboard.");

    });

    document.getElementById("file-selector").addEventListener('change', async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        ipc_enable_indicator(ipc_explorer);

        let address = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
            .then(responce => responce.data)
            .catch(error => null);

        ipc_disable_indicator(ipc_explorer);

        if (address == null)
        {
            ipcui_set_alert(
                "alert-error",
                "QR Code Reader",
                "Unable to read QR Code.");

            document.getElementById("ipc-qr-reader").style.display = "block";

            return;
        }

        ipcui_wallet_ipc_list(ipc_explorer, address);        
    });

}

document.getElementById("ipc-alert-close")
    .addEventListener("click", (event) => {
    document.getElementById("ipc-alert").style.display = "none";
});

