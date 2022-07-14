const fs = require("fs").promises;
const { registerFont, loadImage, createCanvas } = require("canvas");

const IPCLang = require("./ipc-eng.js");
const IPCLib = require("./ipc-lib.js");
const IPCGif = require("./ipc-gif.js");

registerFont("public/fonts/alagard.ttf", { family: "alagard" });

const IPCCARD_DIR = "react/build/cards/";

async function _file_exists(ipc)
{
    let filename = ipc.token_id;

    filename = await fs.access(IPCCARD_DIR + filename + ".jpg")
        .then(res => filename).catch(err => "");

    if (filename != "")
        await fs.unlink(IPCCARD_DIR + filename + ".jpg");
}

async function _file_write(ipc, buffer)
{
    let filename = ipc.token_id;

    return await fs.writeFile(IPCCARD_DIR + filename + ".jpg", buffer)
        .then(res => filename).catch(err => "");
}

async function ipccard_store(ipc)
{
    let label_ipc =  IPCLib.ipc_create_label_ipc(ipc, IPCLang);

    let canvas = createCanvas(800, 418);
    let context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    let card = await loadImage("public/ipc-card-template.png")
        .catch(err => null);
    if (card == null) return "";

    context.fillStyle = "white";
    context.fillRect(0, 0, 800, 418);
    context.drawImage(card, 0, 0, 800, 418);

    context.fillStyle = 'black';
    context.font = "32px alagard";
    context.fillText("IPC #" + ipc.token_id + " " + label_ipc.name, 170, 80);

    context.font = "18px alagard";
    context.fillText("myipc.io", 170, 120);

    context.font = "28px alagard";
    context.fillText(label_ipc.race, 70, 190);
    context.fillText(label_ipc.subrace, 370, 190);
    context.fillText(label_ipc.gender, 70, 250);
    context.fillText(label_ipc.height, 370, 250);
    context.fillText(label_ipc.skin_color, 70, 310);
    context.fillText(label_ipc.hair_color, 370, 310);
    context.fillText(label_ipc.eye_color, 70, 370);
    context.fillText(label_ipc.handedness, 370, 370);

    let sprite = await IPCGif.ipcgif_draw_sprite(ipc);
    if (sprite == null) return "";    

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(570, 140);
    context.scale(3.5, 3.5);
    context.drawImage(sprite, 0, 0, 64, 64);

    let buffer = canvas.toBuffer("image/jpeg", {
        quality: 0.75,
        progressive: false,
        chromaSubsampling: true
    });

    await _file_exists(ipc);
    return await _file_write(ipc, buffer);
}

const IPCCard = { 
    ipccard_store: ipccard_store
}
 module.exports = IPCCard;
