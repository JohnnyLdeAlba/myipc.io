/*
 *  MIT License
 *
 *  By Johnny L. de Alba (Arkonviox), 2020
 *  Copyright (c) 2020. Novotrade International and Sega Games Co., Ltd.
 *
 *  Permission is hereby granted, free of charge, to any person 
 *  obtaining a copy of this software and associated documentation 
 *  files (the "Software"), to deal in the Software without 
 *  restriction, including without limitation the rights to use, 
 *  copy, modify, merge, publish, distribute, sublicense, and/or 
 *  sell copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following 
 *  conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the 
 *  Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
 *  KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 *  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 *  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 *  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 *  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *  Blue Dream JS 
 *  Version: 1.0
 *  Summary: A custom game engine inspired from Ecco 2: The Tides of Time for Sega Genesis/Mega Drive.
 *
 */

const BD_VIEWPORT1_WIDTH = 1280;
const BD_VIEWPORT1_HEIGHT = 720;

const BD_HFLIP = 1;
const BD_VFLIP = 2;
const BD_VHFLIP = 3;

const BD_PRIORITY_TOTAL = 8;
const BD_PRIORITY_NONE = -1; // Disable.
const BD_PRIORITY_0 = 0; // Reserved for Preprocessing.
const BD_PRIORITY_1 = 1;
const BD_PRIORITY_2 = 2;
const BD_PRIORITY_3 = 3;
const BD_PRIORITY_4 = 4;
const BD_PRIORITY_5 = 5;
const BD_PRIORITY_6 = 6;
const BD_PRIORITY_7 = 7;

const BD_INPUT1_UP = 0;
const BD_INPUT1_DOWN = 1;
const BD_INPUT1_LEFT = 2;
const BD_INPUT1_RIGHT = 3;
const BD_INPUT1_A = 4;
const BD_INPUT1_B = 5;
const BD_INPUT1_C = 6;
const BD_INPUT1_X = 7;
const BD_INPUT1_Y = 8;
const BD_INPUT1_Z = 9;

const BD_INPUT2_UP = 8;
const BD_INPUT2_DOWN = 9;
const BD_INPUT2_LEFT = 10;
const BD_INPUT2_RIGHT = 11;
const BD_INPUT2_A = 12;
const BD_INPUT2_B = 13;
const BD_INPUT2_C = 14;
const BD_INPUT2_X = 15;
const BD_INPUT2_Y = 16;
const BD_INPUT2_Z = 17;

const BD_STATUS_NONE = 0;
const BD_STATUS_LOCKED = 1;

const BD_VIEWPORT1 = 0;
const BD_VIEWPORT2 = 1;
const BD_CAMERA_NOTARGET = -1;

const BD_STAGE = 1000;
const BD_CAMERA = 1001;
const BD_POSITION = 1002;

const BD_CAMERA_SETTARGET = 2000;

const BD_CLIENT_PENDING = 3000;
const BD_CLIENT = 3001;
const BD_REQUEST_CLIENTID = 4000;

function t_region()
{
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

function bd_create_region(x, y, width, height)
{
    let region = new t_region();

    region.x = x;
    region.y = y;
    region.width = width;
    region.height = height;

    return region;
}

function t_plot_state()
{
    this.status = 0;

    this.priority = BD_PRIORITY_4;
    this.flip = 0;
    this.rotate = 0;
    this.scale = 1;
    this.delay = 0;
    this.transform = null;

    this.index = 0;
    this.x = 0;
    this.y = 0;

    this.plot_state = null;
    this.resource = null;
    this.handler = null;
}

function bd_create_plot_state(index, x, y)
{
    let ps = new t_plot_state();

    ps.index = index;
    ps.x = x;
    ps.y = y;

    return ps;
}

function bd_copy_plot_state(ps)
{
    let x = bd_create_plot_state(0,0,0);

    x.status = ps.status;
    x.priority = ps.priority;
    x.flip = ps.flip;
    x.rotate = ps.rotate;
    x.scale = ps.scale;
    x.delay = ps.delay;
    x.transform = ps.transform;
    x.index = ps.index;
    x.x = ps.x;
    x.y = ps.y;
    x.plot_state = ps.plot_state;
    x.resource = ps.resource;
    x.handler = ps.handler;

    return x;
}

function bd_add_plot_state(bd, viewport_id, ps)
{
    if (ps.priority == BD_PRIORITY_NONE) return 1;
    if (ps.priority >= bd.priority_total) return 1;
    if (viewport_id >= bd.viewport_total) return 1;

    bd.r_plot_state[viewport_id][ps.priority]
        .push(bd_copy_plot_state(ps));

    return 0;
}

function t_map()
{
    this.x = 0;
    this.y = 0;

    this.cell_width = 0;
    this.cell_height = 0;

    this.row_total = 0;
    this.column_total = 0;

    this.r_plot_state = null;
    this.plot_state = null;
}

function t_map_clip()
{
    this.x_offset = 0;
    this.y_offset = 0;

    this.row_offset = 0;
    this.column_offset = 0;

    this.row_total = 0;
    this.column_total = 0;
}

function bd_get_map_hclip(map, region)
{
    let clip = new t_map_clip();

    clip.x_offset = map.x - region.x;

    let region_column_total = region.width/map.cell_width;
    region_column_total = Math.floor(region_column_total);
    region_column_total+=2;

    clip.column_offset = clip.x_offset/map.cell_width;
    clip.column_offset = Math.ceil(clip.column_offset);

    if (clip.x_offset < 0)
    {
        clip.column_offset = -clip.column_offset;
        clip.column_total = map.column_total - clip.column_offset;

        if (clip.column_total > region_column_total)
            clip.column_total = region_column_total;
    }
    else
    {
        clip.column_total = region_column_total - clip.column_offset;
        if (clip.column_total > map.column_total)
            clip.column_total = map.column_total;
 
        clip.column_offset = 0;
    }

    if (clip.column_offset >= map.column_total)
        clip.column_offset = map.column_total - 1;

    return clip;
}

function bd_get_map_vclip(map, region)
{
    let clip = new t_map_clip();

    clip.y_offset = map.y - region.y;

    let region_row_total = region.height/map.cell_height;
    region_row_total = Math.floor(region_row_total);
    region_row_total+=2;

    clip.row_offset = clip.y_offset/map.cell_height;
    clip.row_offset = Math.ceil(clip.row_offset);

    if (clip.y_offset < 0)
    {
        clip.row_offset = -clip.row_offset;
        clip.row_total = map.row_total - clip.row_offset;

        if (clip.row_total > region_row_total)
            clip.row_total = region_row_total;
    }
    else
    {
        clip.row_total = region_row_total - clip.row_offset; 
        if (clip.row_total > map.row_total)
            clip.row_total = map.row_total;
 
        clip.row_offset = 0;
    }

    if (clip.row_offset >= map.row_total)
        clip.row_offset = map.row_total - 1;

    return clip;
}

function bd_get_map_clip(map, region)
{
    let clip_x = bd_get_map_hclip(map, region);
    if (clip_x == null) return null;

    let clip_y = bd_get_map_vclip(map, region);
    if (clip_y == null) return null;

    clip_y.x_offset = clip_x.x_offset;
    clip_y.column_offset = clip_x.column_offset;
    clip_y.column_total = clip_x.column_total;

    return clip_y;
}

function bd_update_map(bd, map, viewport_id)
{
    let clip = bd_get_map_clip(map, bd.r_viewport_region[viewport_id]);
    if (clip == null) return null;

    let ps = null;

    let column = 0, row = 0;
    let map_index = 0;

    for (row = clip.row_offset; row < clip.row_offset + clip.row_total; row++)
    {
        for (column = clip.column_offset; column < clip.column_offset + clip.column_total; column++)
        {
            map_index = (row * map.column_total) + column;

            ps = bd_copy_plot_state(map.r_plot_state[map_index]);
            ps.x+= clip.x_offset + (column * map.cell_width);
            ps.y+= clip.y_offset + (row * map.cell_height);

            bd_add_plot_state(bd, viewport_id, ps)
        }
    }
}

function t_sequence()
{
    this.index = 0;
    this.delay = 0;

    this.r_plot_state = null;
}

function bd_copy_sequence(sequence)
{
    let x = new t_sequence();
    x.r_plot_state = new Array();

    let index = 0;
    for (index = 0; index < sequence.r_plot_state.length; index++)
        x.r_plot_state[index] = bd_copy_plot_state(sequence.r_plot_state[index]);

    return x;
}

function bd_update_sequence(sequence)
{
    if (sequence.delay >= sequence.r_plot_state[sequence.index].delay + 1)
    {
        sequence.delay = 0;
        if (sequence.index >= sequence.r_plot_state.length - 1)
            sequence.index = 0;
        else sequence.index++;
    }
    else sequence.delay++;
}

function bd_current_sequence_ps(sequence)
{
    return sequence.r_plot_state[sequence.index];
}

function t_frame_control()
{
    this.refresh = 1;
    this.program_counter = 0;
    this.frame_counter = 0;
    this.frames_per_second = 60;
    this.delay = 0;
}


// FIX
function ps_fill(canvas)
{
    let context = canvas.getContext("2d");

    context.imageSmoothingEnabled = false;
    context.fillStyle = "#080820";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function ps_clear(canvas)
{
    let context = canvas.getContext("2d");

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function ps_plot(r_bitmap, ps, viewport)
{
    if (ps.priority == BD_PRIORITY_NONE) return;

    let context = viewport.getContext("2d");
    let bitmap = r_bitmap[ps.index];

    let width = bitmap.width;
    let height = bitmap.height;

    context.translate(ps.x, ps.y);

    switch (ps.flip)
    {
        case BD_HFLIP:
            context.translate(ps.scale*width/2, 0);
            context.scale(-1, 1);
            context.translate(-ps.scale*width/2, 0);
            break;

        case BD_VFLIP: 
            context.translate(0, ps.scale*height/2);
            context.scale(1, -1);
            context.translate(0, -ps.scale*height/2);
            break;

        case BD_VHFLIP:
            context.translate(ps.scale*width/2, ps.scale*height/2);
            context.scale(-1, -1);
            context.translate(-ps.scale*width/2, -ps.scale*height/2);
            break;
    }

    if (ps.scale != 0)
        context.scale(ps.scale, ps.scale);

    if (ps.rotate != 0)
    {
        context.translate(width/2, height/2);
        context.rotate(ps.rotate*(Math.PI/180));
        context.translate(-width/2, -height/2);
    }

    // DBEUG
    let canvas = null;
    if (ps.handler != null)
    {
        canvas = ps.handler(bitmap, ps.resource);
        context.drawImage(
            canvas,
            0,
            0,
            width,
            height);
    }
    else
    {
        context.drawImage(
            bitmap,
            0,
            0,
            width,
            height);
    }

    context.setTransform(1,0,0,1,0,0);
}

function bd_process_plot_state(bd, r_bitmap)
{
    let ps = null;
    let x = 0, y = 0;

    for (x = 0; x < bd.viewport_total; x++)
    {
        for (y = 0; y < bd.priority_total; y++)
        {
           while (ps = bd.r_plot_state[x][y].pop())
               ps_plot(r_bitmap, ps, bd.r_viewport[x]);
        }
    }
}

function t_object()
{
    this.id = 0;
    this.resource = null;
    this.process = null;
}

function bd_create_object(id, resource, process)
{
    let object = new t_object();

    object.id = id;
    object.resource = resource;
    object.process = process;

   return object;
}

function bd_generate_parent_id(bd)
{
    let index = 0;
    for (index = 0; index < bd.r_object.length; index++)
    {
        if (bd.r_object[index] != null)
        {
            if (bd.r_object[index].id == bd.parent_id)
            {
                bd.parent_id++;
                bd.parent_id = bd_generate_parent_id(bd, bd.parent_id);
            }
        }
    }

   return bd.parent_id;
}

function bd_add_object(bd, resource, process)
{
    let id = bd_generate_parent_id(bd);
 
    let object = bd_create_object(id, resource, process);
    bd.r_object.push(object);

    return id;
}

function bd_remove_object(bd, id)
{
    let index = 0;
    for (index = 0; index < bd.r_object.length; index++)
    {
        if (bd.r_object[index] != null)
        {
            if (bd.r_object[index].id == id)
            {
                bd.r_object.splice(index, 1);
                break;
            }
        }
    }
}

function bd_process_object(bd)
{
    let object = null;
    let index = 0;

    for (index = 0; index < bd.r_object.length; index++)
    {
        object = bd.r_object[index]
        if (object != null)
            object.process(bd, object.id, object.resource);
    }
}

function t_signal()
{
    this.id = 0;
    this.domain_id = 0;
    this.client_id = 0;
    this.viewport_id = 0;

    this.parent_id = 0;
    this.parent_type = 0;
    this.child_id = 0;

    this.type = 0;
    this.direction_x = 0;
    this.direction_y = 0;
    this.x = 0;
    this.y = 0;

    this.velocity_x = 0;
    this.velocity_y = 0;

    this.width = 0;
    this.height = 0;
    this.ws = null;
}

function bd_create_signal(parent_id, type, x, y, width, height)
{
    let signal = new t_signal();

    signal.parent_id = parent_id;
    signal.type = type;

    signal.x = x;
    signal.y = y;

    signal.width = width;
    signal.height = height;

    return signal;
}

function bd_copy_signal(signal) // fix
{
    let signal_z = new t_signal();

    signal_z.id = signal.id;
    signal_z.domain_id = signal.domain_id;
    signal_z.client_id = signal.client_id;
    signal_z.viewport_id = signal.viewport_id;

    signal_z.parent_id = signal.parent_id;
    signal_z.parent_type = signal.parent_type;
    signal_z.child_id = signal.child_id;

    signal_z.type = signal.type;
    signal_z.x = signal.x;
    signal_z.y = signal.y;

    signal_z.width = signal.width;
    signal_z.heigth = signal.height;
    signal_z.ws = signal.ws;

    return signal_z;
}

function bd_generate_signal_id(bd) // needs to be fixed!!!
{
    let index = 0;
    for (index = 0; index < bd.r_signal.length; index++)
    {
        if (bd.r_signal[index] != null)
        {
            if (bd.r_signal[index].id == bd.signal_id)
            {
                bd.signal_id++;
                bd.signal_id = bd_generate_signal_id(bd);
            }
        }
    }

   return bd.signal_id;
}

function bd_add_signal(bd, signal)
{
    bd.r_signal_pending.push(signal);
}

function bd_remove_signal(bd, id)
{
    let index = 0;
    for (index = 0; index < bd.r_signal.length; index++)
    {
        if (bd.r_signal[index] != null)
        {
            if (bd.r_signal[index].id == id)
            {
                bd.r_signal.splice(index, 1);
                break;
            }
        }
    }
}

function bd_swap_signal(bd)
{
    bd.r_signal = bd.r_signal_pending;
    bd.r_signal_pending = new Array();
}

function bd_create_client_psignal(
    bd, 
    direction_x,
    direction_y,
    x,
    y,
    velocity_x,
    velocity_y)
{
    let signal = new t_signal();
    let client_id = bd_generate_psignal_client_id(bd);

    signal.client_id = client_id;
    signal.type = BD_CLIENT;

    signal.direction_x = direction_x;
    signal.direction_y = direction_y;

    signal.x = x;
    signal.y = y;

    signal.velocity_x = velocity_x;
    signal.velocity_y = velocity_y;

    return signal;
}

function bd_generate_psignal_id(bd)
{
    let index = 0;
    for (index = 0; index < bd.r_psignal.length; index++)
    {
        if (bd.r_psignal[index] != null)
        {
            if (bd.r_psignal[index].id == bd.psignal_id)
            {
                bd.psignal_id++;
                bd.psignal_id = bd_generate_psignal_id(bd);
            }
        }
    }

   return bd.psignal_id;
}

function bd_generate_psignal_client_id(bd) 
{
    let index = 0;
    for (index = 0; index < bd.r_psignal.length; index++)
    {
        if (bd.r_psignal[index] != null)
        {
            if (bd.r_psignal[index].client_id == bd.client_id)
            {
                bd.client_id++;
                bd.client_id = bd_generate_psignal_client_id(bd);
            }
        }
    }

   return bd.client_id;
}

function bd_get_psignal_parent_id(bd, parent_id)
{
    let index = 0;
    for (index = 0; index < bd.r_psignal.length; index++)
    {
        if (bd.r_psignal[index] != null)
        {
            if (bd.r_psignal[index].parent_id == bd.parent_id)
                return bd.r_psignal[index];
        }
    }

   return null;
}

function bd_get_pending_client(bd)
{
    let index = 0;
    for (index = 0; index < bd.r_psignal.length; index++)
    {
        if (bd.r_psignal[index] != null)
        {
            if (bd.r_psignal[index].type == BD_CLIENT_PENDING)
                return bd.r_psignal[index];
        }
    }

   return null;
}

function bd_add_psignal(bd, psignal)
{
    let id = bd_generate_psignal_id(bd);
    psignal.id = id;

    bd.r_psignal.push(psignal);
    return psignal;
}

function bd_remove_psignal(bd, id)
{
    let index = 0;
    for (index = 0; index < bd.r_psignal.length; index++)
    {
        if (bd.r_psignal[index] != null)
        {
            if (bd.r_psignal[index].id == id)
            {
                bd.r_psignal.splice(index, 1);
                break;
            }
        }
    }
}

function bd_update_viewport(bd)
{
    let r_plot_state = new Array();

    let x = 0, y = 0;
    for (x = 0; x < bd.viewport_total; x++)
    {
        r_plot_state[x] = new Array();
        for (y = 0; y < bd.priority_total; y++)
            r_plot_state[x][y] = new Array();
    }

    bd.r_plot_state = null;
    bd.r_plot_state = r_plot_state;
}

function bd_add_viewport(bd, width, height)
{
    let canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    let region = bd_create_region(0, 0, width, height);

    bd.r_viewport.push(canvas);
    bd.r_viewport_region.push(region);

    bd.viewport_total++;
    bd_update_viewport(bd);
}

function bd_input_keyboard(instance, key, key_status)
{
    key = key.toUpperCase();
    switch (key)
    {
        case 'W': instance.input[BD_INPUT1_UP] = key_status; break;
        case 'A': instance.input[BD_INPUT1_LEFT] = key_status; break;
        case 'S': instance.input[BD_INPUT1_DOWN] = key_status; break;
        case 'D': instance.input[BD_INPUT1_RIGHT] = key_status; break;

        case 'I': instance.input[BD_INPUT1_A] = key_status; break;
        case 'J': instance.input[BD_INPUT1_B] = key_status; break;
        case 'K': instance.input[BD_INPUT1_C] = key_status; break;
        case 'L': instance.input[BD_INPUT1_X] = key_status; break;
        case 'O': instance.input[BD_INPUT1_Y] = key_status; break;
        case 'P': instance.input[BD_INPUT1_Z] = key_status; break;

        case 'Z': instance.input[BD_INPUT2_UP] = key_status; break;
        case 'X': instance.input[BD_INPUT2_LEFT] = key_status; break;
        case 'N': instance.input[BD_INPUT2_DOWN] = key_status; break;
        case 'M': instance.input[BD_INPUT2_RIGHT] = key_status; break;

        case 'C': instance.input[BD_INPUT2_A] = key_status; break;
        case 'F': instance.input[BD_INPUT2_B] = key_status; break;
        case 'T': instance.input[BD_INPUT2_C] = key_status; break;
        case 'B': instance.input[BD_INPUT2_X] = key_status; break;
        case 'H': instance.input[BD_INPUT2_Y] = key_status; break;
        case 'U': instance.input[BD_INPUT2_Z] = key_status; break;
    }
}

function bd_process(bd)
{
    bd_process_object(bd);
}

function bd_update_frame(bd)
{
    if (bd.resource_index != bd.resource_total)
    {
        requestAnimationFrame(() => { bd_update_frame(bd); });
        return;
    }

    let fc = bd.frame_control;
    if (fc.refresh == 1)
    {
        fc.refresh = 0;

        // console.log(fc.program_counter);
        // console.log(fc.frame_counter);

        if (fc.frame_counter != 60)
            fc.delay = fc.program_counter/fc.frames_per_second;

        fc.program_counter = 0;
        fc.frame_counter = 0;

        setTimeout(() => { fc.refresh = 1; }, 1000);
    }

    fc.program_counter++;

    if (fc.program_counter >= (fc.frame_counter * fc.delay))
    {
        bd_process(bd);;
        fc.frame_counter++;
 
        requestAnimationFrame(() => { bd_update_frame(bd); });
        return;
    }
    
    requestAnimationFrame(() => { bd_update_frame(bd); });
}

function bd_add_bitmap(bd, url)
{
    bd.status = BD_STATUS_LOCKED;

    let bitmap = new Image();

    bitmap.src = url;
    bitmap.addEventListener("load", () => {
        bd.resource_index++;
    });

    bd.r_bitmap.push(bitmap);
    bd.resource_total++;
}

function bd_add_all_bitmap(bd, list)
{
    let bitmap_index = bd.bitmap_total;

    let index = 0;
    for (index = 0; index < list.length; index++)
        bd_add_bitmap(bd, list[index]);

    return bitmap_index;
}

function bd_reset_resource_tracker(bd)
{
    bd.status = BD_STATUS_NONE;
    bd.resource_index = 0;
    bd.resource_total = 0;
}

function bd_wait_bitmaps(bd, id, process)
{
    if (bd.resource_index != bd.resource_total)
        return;

    bd_reset_resource_tracker(bd);
    bd_remove_object(bd, id);
}

function t_sprite_sheet()
{
    this.width = 0;
    this.height = 0;

    this.row_total = 0;
    this.column_total = 0;

    this.cell_width = 0;
    this.cell_height = 0;
    this.cell_total = 0;

    this.bitmap = null;
}

function bd_add_sprite_sheet_cell(bd, sprite_sheet, index)
{
    bd.status = BD_STATUS_LOCKED;

    let row = index/sprite_sheet.column_total;
    row = parseInt(row);

    let column = index - (row*sprite_sheet.column_total);
    let x = column*sprite_sheet.cell_width;
    let y = row*sprite_sheet.cell_height;

    let canvas = document.createElement("canvas");
    canvas.width = sprite_sheet.cell_width;
    canvas.height = sprite_sheet.cell_height;

    let context = canvas.getContext("2d");
    context.drawImage(
        sprite_sheet.bitmap,
        x, y,
        sprite_sheet.cell_width,
        sprite_sheet.cell_height,
        0, 0,
        sprite_sheet.cell_width,
        sprite_sheet.cell_height);

    let bitmap = new Image();

    bitmap.src = canvas.toDataURL();
    bitmap.addEventListener("load", () => {
        bd.resource_index++;
    });

    bd.r_bitmap.push(bitmap);  
    bd.resource_total++;
}

function bd_add_all_sprite_sheet_cells(bd, sprite_sheet)
{
    let index = 0;
    for (index = 0; index < sprite_sheet.cell_total; index++)
        bd_add_sprite_sheet_cell(bd, sprite_sheet, index);

    sprite_sheet.bitmap = null;
    sprite_sheet = null;
}

function bd_add_sprite_sheet(bd, order, width, height, column_total, row_total, url)
{
    let sprite_sheet = new t_sprite_sheet();
    let bitmap = new Image();

    sprite_sheet.width = width;
    sprite_sheet.height = height;

    sprite_sheet.column_total = column_total;
    sprite_sheet.row_total = row_total;

    sprite_sheet.cell_width = width/column_total;
    sprite_sheet.cell_height = height/row_total;
    sprite_sheet.cell_total = column_total*row_total;

    bitmap.src = url;
    bitmap.addEventListener("load", () => {
        bd.resource_index++;
    });

    sprite_sheet.bitmap = bitmap;
    bd.r_sprite_sheet[order] = sprite_sheet;

    bd.resource_total++;
}

function bd_wait_sprite_sheets(bd, id, process)
{
    if (bd.resource_index != bd.resource_total)
        return;

    bd_reset_resource_tracker(bd);
    bd_remove_object(bd, id);

    let index  = 0;
    for (index = 0; index < bd.r_sprite_sheet.length; index++)
        bd_add_all_sprite_sheet_cells(bd, bd.r_sprite_sheet[index]); 

    bd_add_object(bd, null, bd_wait_bitmaps);
}

function t_blue_dream()
{
    this.status = 0;

    this.client = null;
    this.viewport_total = 0;
    this.priority_total = BD_PRIORITY_TOTAL;
    this.parent_id = 0;

    this.input = null;
    this.frame_control = null;

    this.r_sprite_sheet = null;
    this.r_bitmap = null
    this.r_viewport = null;

    this.r_viewport_region = null;
    this.r_plot_state = null;
    this.r_object = null;
    this.r_pending_signal = null;
    this.r_signal = null;

    this.resource_index = 0;
    this.resource_total = 0;

    this.process = null;
}

function bd_create_blue_dream()
{
    let bd = new t_blue_dream();

    bd.input = new Array();
    bd.frame_control = new t_frame_control();

    bd.r_sprite_sheet = new Array();
    bd.r_bitmap = new Array();
    bd.r_viewport = new Array();

    bd.r_viewport_region = new Array();
    bd.r_plot_state = new Array();
    bd.r_object = new Array();
    bd.r_signal_pending = new Array();
    bd.r_signal = new Array();

    return bd;
}

function bd_initialize()
{
    let bd = bd_create_blue_dream();

    window.addEventListener("keydown", (event) => {
        bd_input_keyboard(bd, event.key, 1); });

    window.addEventListener("keyup", (event) => {
        bd_input_keyboard(bd, event.key, 0); });

    return bd;
}

function t_camera()
{
    this.viewport_id = 0;
    this.target_id = 0;

    this.range_width = 0;
    this.range_height = 0;

    this.stage = null;
    this.target = null;
}

function bd_create_camera(viewport_id, target_id, range_width, range_height)
{
    let camera = new t_camera();

    camera.viewport_id = viewport_id;
    camera.target_id = target_id;

    camera.range_width = range_width;
    camera.range_height = range_height;

    return camera;
}

function bd_update_camera(bd, id, camera)
{
    camera.stage = null;
    camera.target = null;

    let index = 0;
    for (index = 0; index < bd.r_signal.length; index++)
    { 
        if (bd.r_signal[index].child_id == id)
        {
            if (bd.r_signal[index].type == BD_CAMERA_SETTARGET)
            {
                camera.viewport_id = bd.r_signal[index].viewport_id;
                camera.target_id = bd.r_signal[index].parent_id;
            }
        }

        if (bd.r_signal[index].type == BD_STAGE)
            camera.stage = bd.r_signal[index];

        if (bd.r_signal[index].parent_id == camera.target_id)
        {
            if (bd.r_signal[index].type == BD_POSITION)
                camera.target = bd.r_signal[index];
        }
    }

    let signal = bd_create_signal(id,BD_CAMERA,0,0,0,0);

    signal.viewport_id = camera.viewport_id;
    signal.parent_type = BD_CAMERA;
    signal.child_id = camera.target_id;

    bd_add_signal(bd, signal);

    if (camera.target_id == -1) return 1;
    if (camera.stage == null || camera.target == null) return 1;

    return 0;
}

function bd_process_default_camera(bd, id, camera)
{
    if (bd_update_camera(bd, id, camera) == 1) return 1;

    let viewport = bd.r_viewport_region[camera.viewport_id];
    let range = bd_create_region(
        viewport.x + (viewport.width - camera.range_width)/2,
        viewport.y + (viewport.height - camera.range_height)/2,
        camera.range_width,
        camera.range_height);

    let difference_x = 0;
    let difference_y = 0;

    if (camera.target.x > range.x)
    {
        difference_x = camera.target.x - (range.x + range.width);
        if (camera.target.x > range.x + range.width)
        {
            if (difference_x > 20) // dead zone
                viewport.x+= 8; // camera catchup
            else viewport.x+= difference_x;
        }
    }
    else
    {
        difference_x = range.x - camera.target.x;
        if (difference_x > 20)
            viewport.x-= 8;
        else viewport.x-= difference_x;
    }

    if (camera.target.y > range.y)
    {
        difference_y = camera.target.y - (range.y + range.height);
        if (camera.target.y > range.y + range.height)
        {
            if (difference_y > 20)
                viewport.y+= 8; // camera catchup
            else viewport.y+= difference_y;
        }
    }
    else
    {
        difference_y = range.y - camera.target.y;

        if (difference_y > 20)
            viewport.y-= 8;
        else viewport.y-= difference_y;
    }

    if (viewport.x < camera.stage.x) viewport.x = camera.stage.x;
    else if (viewport.x > camera.stage.x + camera.stage.width) viewport.x = camera.stage.x + camera.stage.width;

    if (viewport.y < camera.stage.y) viewport.y = camera.stage.y;
    else if (viewport.y > camera.stage.y + camera.stage.height) viewport.y = camera.stage.y + camera.stage.height;

    signal = bd_create_signal(
        id,
        BD_POSITION,
        range.x,
        range.y,
        range.width,
        range.height);

    signal.viewport_id = camera.viewport_id;
    signal.stage_id = camera.stage.stage_id;
    signal.parent_type = BD_CAMERA;
    signal.child_id = camera.target_id;

    bd_add_signal(bd, signal);
    return 0;
}
