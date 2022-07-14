const { createCanvas, loadImage } = require("canvas");

function t_sprite_sheet()
{
    this.width = 0;
    this.height = 0;

    this.total_rows = 0;
    this.total_columns = 0;
    this.total_frames = 0;

    this.frame_width = 0;
    this.frame_height = 0;

    this.canvas = null;
}

async function sprite_sheet_create(filename, width, height, total_columns, total_rows)
{
    let sprite_sheet = new t_sprite_sheet();

    let bitmap = await loadImage(filename)
        .catch(err => null);
    if (bitmap == null) return null;

    let canvas = createCanvas(width, height);
    let context = canvas.getContext("2d");

    context.drawImage(bitmap, 0, 0, width, height);
    sprite_sheet.canvas = canvas;

    sprite_sheet.width = width;
    sprite_sheet.height = height;

    sprite_sheet.total_columns = total_columns;
    sprite_sheet.total_rows = total_rows;

    sprite_sheet.frame_width = width / total_columns;
    sprite_sheet.frame_height = height / total_rows;
    sprite_sheet.frame_total = total_columns * total_rows;

    return sprite_sheet;
}

function sprite_sheet_extract_frame(sprite_sheet, index)
{
    let row = index / sprite_sheet.total_columns;
    row = parseInt(row);

    let column = index - (row * sprite_sheet.total_columns);
    let x = column * sprite_sheet.frame_width;
    let y = row * sprite_sheet.frame_height;

    let canvas = createCanvas(
        sprite_sheet.frame_width,
        sprite_sheet.frame_height);

    let context = canvas.getContext("2d");
    context.drawImage(
        sprite_sheet.canvas,
        x, y,
        sprite_sheet.frame_width,
        sprite_sheet.frame_height,
        0, 0,
        sprite_sheet.frame_width,
        sprite_sheet.frame_height);

    return canvas;
}

function sprite_sheet_extract_all_frames(sprite_sheet)
{
    let index = 0;
    let frames = new Array();

    for (index = 0; index < sprite_sheet.frame_total; index++)
        frames[index] = sprite_sheet_extract_frame(sprite_sheet, index);

    return frames;
}

async function sprite_sheet_to_canvas_array(filename, width, height, total_columns, total_rows)
{
    let sprite_sheet = await sprite_sheet_create(
        filename,
        width, height,
        total_columns, total_rows);

    if (sprite_sheet == null) return null;
    return sprite_sheet_extract_all_frames(sprite_sheet);
}

const SpriteSheet = {
    t_sprite_sheet: t_sprite_sheet,
    sprite_sheet_create: sprite_sheet_create,
    sprite_sheet_extract_frame: sprite_sheet_extract_frame,
    sprite_sheet_extract_all_frames: sprite_sheet_extract_all_frames,
    sprite_sheet_to_canvas_array: sprite_sheet_to_canvas_array
}

module.exports = SpriteSheet;
