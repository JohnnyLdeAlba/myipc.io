const fs = require('fs').promises;
const { createCanvas } = require("canvas");

const GIFEncoder = require('gif-encoder-2');
const SpriteSheet = require("./sprite-sheet.js");
const IPCLib = require("./ipc-lib.js");

const IPCGIF_WIDTH = 64;
const IPCGIF_HEIGHT = 64;
const IPCGIF_TOTAL_COLUMNS = 9;

const IPCGIF_DIR = "react/build/sprites/";
const IPCGIF_SPRITESHEET = "public/sprite-sheet.png";

function ipcgif_color_filter(canvas, color)
{
    let context = canvas.getContext("2d");
    let ImageData = context.getImageData(0, 0, canvas.width, canvas.height); 

    let index = 0;
    for (index = 0; index < ImageData.data.length / 4; index++)
    {
        r = ImageData.data[index * 4];
        g = ImageData.data[index * 4 + 1];
        b = ImageData.data[index * 4 + 2];
        a = ImageData.data[index * 4 + 3];
    
        r = r * color.red;
        g = g * color.green;
        b = b * color.blue;
        a = a * color.alpha

        ImageData.data[index * 4] = parseInt(r);        
        ImageData.data[index * 4 + 1] = parseInt(g);        
        ImageData.data[index * 4 + 2] = parseInt(b);
        ImageData.data[index * 4 + 3] = parseInt(a);
    }

    context.putImageData(ImageData, 0, 0);
    return canvas;
}

function t_ipcgif()
{
    this.handedness = 0;

    this.body_offset = 0;
    this.hair_offset = 0;
    this.eyes_offset = 0;
    this.accessories_offset = 0;

    this.skin_color = null;
    this.hair_color = null;
    this.eye_color = null;
}

function _female_elf()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 0 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 11 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 13 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 4 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _male_elf()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 1 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 12 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 14 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 8 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _female_human()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 0 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 11 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 13 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 5 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _male_human()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 1 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 12 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 14 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 9 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _female_dwarf()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 0 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 11 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 13 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 6 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _male_dwarf()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 1 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = 12 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.eyes_offset = 14 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 10 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _female_orc()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 2 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = -1;
    ipcgif.eyes_offset = 15 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = 7 * IPCGIF_TOTAL_COLUMNS;

    return ipcgif; 
}

function _male_orc()
{
    let ipcgif = new t_ipcgif();

    ipcgif.body_offset = 3 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.hair_offset = -1;
    ipcgif.eyes_offset = 16 * IPCGIF_TOTAL_COLUMNS;
    ipcgif.clothes_offset = -1;

    return ipcgif; 
}

function ipcgif_create_from_ipc(ipc)
{
    let ipcgif = new t_ipcgif();

    switch (ipc.race)
    {
        case IPCLib.IPC_ELF:
        {
            if (ipc.gender == IPCLib.IPC_FEMALE)
                ipcgif = _female_elf();
            else ipcgif = _male_elf();

            break;
        }

        case IPCLib.IPC_HUMAN:
        {
            if (ipc.gender == IPCLib.IPC_FEMALE)
                ipcgif = _female_human();
            else ipcgif = _male_human();

            break;
        }

        case IPCLib.IPC_DWARF:
        {
            if (ipc.gender == IPCLib.IPC_FEMALE)
                ipcgif = _female_dwarf();
            else ipcgif = _male_dwarf();

            break;
        }

        default:
        {
            if (ipc.gender == IPCLib.IPC_FEMALE)
                ipcgif = _female_orc();
            else ipcgif = _male_orc();

            break;
        }
    }

    if (ipc.accessories > 0)
    {
        ipcgif.hair_offset = -1;
        ipcgif.eyes_offset = -1;

        if (ipc.accessories == 1)
            ipcgif.accessories_offset = 17 * IPCGIF_TOTAL_COLUMNS;
        else ipcgif.accessories_offset = 18 * IPCGIF_TOTAL_COLUMNS;
    }
    else ipcgif.accessories_offset = -1;
   
    ipcgif.handedness = ipc.handedness; 
    ipcgif.skin_color = IPCLib.IPCRGBA[ipc.skin_color]; 
    ipcgif.hair_color = IPCLib.IPCRGBA[ipc.hair_color];
    ipcgif.eye_color = IPCLib.IPCRGBA[ipc.eye_color];

    return ipcgif;
}

function _draw_canvas(canvas_array, offset, color)
{
    let canvas = createCanvas(IPCGIF_WIDTH, IPCGIF_HEIGHT);
    let context = canvas.getContext("2d");

    context.drawImage(
       canvas_array[offset],
       0, 0,
       IPCGIF_WIDTH, IPCGIF_HEIGHT);

    if (color != null)
        canvas = ipcgif_color_filter(canvas, color); 

    return canvas;
}

function ipcgif_draw_frame(canvas_array, ipcgif, frame_index)
{
    let layer = new Array();
    let canvas = null;

    // Draw body and set skin color.
    canvas = _draw_canvas(
        canvas_array,
        ipcgif.body_offset + frame_index,
        ipcgif.skin_color);

    layer.push(canvas);

    // Draw clothes.
    if (ipcgif.clothes_offset != -1)
    {
        canvas = _draw_canvas(
            canvas_array,
            ipcgif.clothes_offset + frame_index,
            null);

        layer.push(canvas);
    }

    if (ipcgif.accessories_offset != -1)
    {
        canvas = _draw_canvas(
            canvas_array,
            ipcgif.accessories_offset + frame_index,
            null);

        layer.push(canvas);
    }
    else
    {
        // Draw hair and hair color.
        if (ipcgif.hair_offset != -1)
        {
            canvas = _draw_canvas(
                canvas_array,
                ipcgif.hair_offset + frame_index,
                ipcgif.hair_color);

            layer.push(canvas);
        }

        // Draw eyes and eye color.
        canvas = _draw_canvas(
            canvas_array,
            ipcgif.eyes_offset + frame_index,
            ipcgif.eye_color);

        layer.push(canvas);
    }

    // Combine all layers: body, clothes, accessories, hair, eyes.
    let frame = createCanvas(IPCGIF_WIDTH, IPCGIF_HEIGHT);
    context = frame.getContext("2d");

    if (ipcgif.handedness == IPCLib.IPC_LEFT_HANDED)
    {
        context.translate(IPCGIF_WIDTH/2, 0);
        context.scale(-1, 1);
        context.translate(-IPCGIF_WIDTH/2, 0);
    }

    let index = 0;
    for (index = 0; index < layer.length; index++)
        context.drawImage(
            layer[index],
            0, 0,
            IPCGIF_WIDTH, IPCGIF_HEIGHT);

    return frame;   
}

function zero_pad(value)
{
    if (value <= 9) return "0" + value;
    return value;
}

async function ipcgif_draw_sprite(ipc)
{
    let canvas_array = await SpriteSheet
        .sprite_sheet_to_canvas_array(
            IPCGIF_SPRITESHEET,
            576, 1280,
            9, 20);   
    if (canvas_array == null) return null;

    let ipcgif = ipcgif_create_from_ipc(ipc);
    return ipcgif_draw_frame(canvas_array, ipcgif, 0);
}

async function _file_exists(ipc)
{
    let filename = ipc.token_id;

    filename = await fs.access(IPCGIF_DIR + filename + ".jpg")
        .then(res => filename).catch(err => "");

    if (filename != "")
        await fs.unlink(IPCGIF_DIR + filename + ".jpg");
}

async function ipcgif_store(ipc)
{
    let filename = ipc.token_id;

    _file_exists(ipc);

    let canvas_array = await SpriteSheet
        .sprite_sheet_to_canvas_array(
            IPCGIF_SPRITESHEET,
            576, 1280,
            9, 20);   
    if (canvas_array == null) return "";

    let ipcgif = ipcgif_create_from_ipc(ipc);
    let canvas = null;
    let encoder = new GIFEncoder(64, 64, 'octree', true);

    encoder.setTransparent(true);
    encoder.setThreshold(0);
    encoder.setDelay(100);
    encoder.start();

    let index = 0;
    for (index = 0; index < 8; index++)
    {
         canvas = ipcgif_draw_frame(canvas_array, ipcgif, index + 1);
         encoder.addFrame(canvas.getContext("2d"));
    }

    encoder.finish();

    let buffer = encoder.out.getData();
    result = await fs.writeFile(IPCGIF_DIR + filename + ".gif", buffer)
        .then(res => 0)
        .catch(err => -1);

    if (result == -1) return "";
    return filename;
}

const IPCGif = {
    ipcgif_draw_sprite: ipcgif_draw_sprite,
    ipcgif_store: ipcgif_store
}

module.exports = IPCGif;
