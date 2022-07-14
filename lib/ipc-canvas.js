const IXP_STATUS_NONE = 0;
const IXP_STATUS_DISABLED = 1;

const IXP_SHEET_COLUMNS = 9;
const IXP_SHEET_ROWS = 20;
const IXP_SHEET_CELLTOTAL = IXP_SHEET_COLUMNS * IXP_SHEET_ROWS;

const IXP_FEMALE_ELF = 0;
const IXP_MALE_ELF = 6;
const IXP_FEMALE_HUMAN = 12;
const IXP_MALE_HUMAN = 18;
const IXP_FEMALE_DWARF = 24;
const IXP_MALE_DWARF = 30;
const IXP_FEMALE_ORC = 36;
const IXP_MALE_ORC = 42;

function ipc_color_filter(bitmap, color)
{
    let canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    let context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0);

    let ImageData = context.getImageData(0, 0, bitmap.width, bitmap.height); 

    let index = 0;
    for (index = 0; index < ImageData.data.length/4; index++)
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

function ixp_create_sequence(row, priority)
{
    let sequence = new t_sequence();
    let r_plot_state = new Array();

    let offset = row * IXP_SHEET_COLUMNS;

    r_plot_state[0] = bd_create_plot_state(offset + 1, 0, 0);
    r_plot_state[1] = bd_create_plot_state(offset + 2, 0, 0);
    r_plot_state[2] = bd_create_plot_state(offset + 3, 0, 0);
    r_plot_state[3] = bd_create_plot_state(offset + 4, 0, 0);
    r_plot_state[4] = bd_create_plot_state(offset + 5, 0, 0);
    r_plot_state[5] = bd_create_plot_state(offset + 6, 0, 0);
    r_plot_state[6] = bd_create_plot_state(offset + 7, 0, 0);
    r_plot_state[7] = bd_create_plot_state(offset + 8, 0, 0);

    let index = 0;
    for (index = 0; index < r_plot_state.length; index++)
    {
        r_plot_state[index].y = -16;

        r_plot_state[index].priority = priority;
        r_plot_state[index].delay = 4;
        r_plot_state[index].scale = 2;
    }

    sequence.r_plot_state = r_plot_state;
    return sequence;
}

function ixp_create_sequence_array()
{
    let r_sequence = new Array();

    // Female Elf
    r_sequence[0] = ixp_create_sequence(0, 1); // Body
    r_sequence[1] = ixp_create_sequence(4, 2); // Clothes
    r_sequence[2] = ixp_create_sequence(11, 2); // Hair
    r_sequence[3] = ixp_create_sequence(13, 2); // Eyes
    r_sequence[4] = ixp_create_sequence(13, 3); // Accessory
    r_sequence[5] = ixp_create_sequence(13, 3); // Accessory

    // Male Elf
    r_sequence[6] = ixp_create_sequence(1, 1);
    r_sequence[7] = ixp_create_sequence(8, 2);
    r_sequence[8] = ixp_create_sequence(12, 2);
    r_sequence[9] = ixp_create_sequence(14, 2);
    r_sequence[10] = ixp_create_sequence(19, 3);
    r_sequence[11] = ixp_create_sequence(19, 3);

    // Female Human
    r_sequence[12] = ixp_create_sequence(0, 1);
    r_sequence[13] = ixp_create_sequence(5, 2);
    r_sequence[14] = ixp_create_sequence(11, 2);
    r_sequence[15] = ixp_create_sequence(13, 2);
    r_sequence[16] = ixp_create_sequence(19, 3);
    r_sequence[17] = ixp_create_sequence(19, 3);

    // Male Human
    r_sequence[18] = ixp_create_sequence(1, 1);
    r_sequence[19] = ixp_create_sequence(9, 2);
    r_sequence[20] = ixp_create_sequence(12, 2);
    r_sequence[21] = ixp_create_sequence(14, 2);
    r_sequence[22] = ixp_create_sequence(19, 3);
    r_sequence[23] = ixp_create_sequence(19, 3);

    // Female Dwarf
    r_sequence[24] = ixp_create_sequence(0, 1);
    r_sequence[25] = ixp_create_sequence(6, 2);
    r_sequence[26] = ixp_create_sequence(11, 2);
    r_sequence[27] = ixp_create_sequence(13, 2);
    r_sequence[28] = ixp_create_sequence(19, 3);
    r_sequence[29] = ixp_create_sequence(19, 3);

    // Male Dwarf
    r_sequence[30] = ixp_create_sequence(1, 1);
    r_sequence[31] = ixp_create_sequence(10, 2);
    r_sequence[32] = ixp_create_sequence(12, 2);
    r_sequence[33] = ixp_create_sequence(14, 2);
    r_sequence[34] = ixp_create_sequence(19, 3);
    r_sequence[35] = ixp_create_sequence(19, 3);

    // Female Orc
    r_sequence[36] = ixp_create_sequence(2, 1);
    r_sequence[37] = ixp_create_sequence(7, 2);
    r_sequence[38] = ixp_create_sequence(19, BD_PRIORITY_NONE);
    r_sequence[39] = ixp_create_sequence(15, 2);
    r_sequence[40] = ixp_create_sequence(19, 3);
    r_sequence[41] = ixp_create_sequence(19, 3);

    // Male Orc
    r_sequence[42] = ixp_create_sequence(3, 1);
    r_sequence[43] = ixp_create_sequence(19, BD_PRIORITY_NONE);
    r_sequence[44] = ixp_create_sequence(19, BD_PRIORITY_NONE);
    r_sequence[45] = ixp_create_sequence(16, 2);
    r_sequence[46] = ixp_create_sequence(19, 3);
    r_sequence[47] = ixp_create_sequence(19, 3);

    return r_sequence; 
}

function t_exhibit()
{
    this.status = 0;

    this.viewport_id = null;
    this.r_sequence = null;
}

function ixp_get_ipc_type(ipc)
{
    if (ipc == null) return IXP_MALE_ORC;
    switch(ipc.race)
    {
        case IPCLib.IPC_ELF: return (ipc.gender == IPCLib.IPC_FEMALE) ? IXP_FEMALE_ELF : IXP_MALE_ELF;
        case IPCLib.IPC_HUMAN: return (ipc.gender == IPCLib.IPC_FEMALE) ? IXP_FEMALE_HUMAN : IXP_MALE_HUMAN;
        case IPCLib.IPC_DWARF: return (ipc.gender == IPCLib.IPC_FEMALE) ? IXP_FEMALE_DWARF : IXP_MALE_DWARF;
        case IPCLib.IPC_ORC: return (ipc.gender == IPCLib.IPC_FEMALE) ? IXP_FEMALE_ORC : IXP_MALE_ORC;
    }

    return (ipc.gender == IPCLib.IPC_FEMALE) ? IXP_FEMALE_ORC : IXP_MALE_ORC;
}

function ixp_set_exhibit(exhibit, ipc)
{
    let sequence = new Array();
    let offset = ixp_get_ipc_type(ipc);

    sequence[0] = bd_copy_sequence(exhibit.r_sequence[offset + 0]); // Body
    sequence[1] = bd_copy_sequence(exhibit.r_sequence[offset + 1]); // Clothes
    sequence[2] = bd_copy_sequence(exhibit.r_sequence[offset + 2]); // Hair
    sequence[3] = bd_copy_sequence(exhibit.r_sequence[offset + 3]); // Eyes
    sequence[4] = bd_copy_sequence(exhibit.r_sequence[offset + 4]); // Accessory
    sequence[5] = bd_copy_sequence(exhibit.r_sequence[offset + 5]); // Accessory

    exhibit.sequence = sequence;
    if (ipc == null) return;

    if (ipc.handedness == IPCLib.IPC_LEFT_HANDED)
    {
        for (index = 0; index < IXP_SHEET_COLUMNS - 1; index++)
        {
            sequence[0].r_plot_state[index].flip = BD_HFLIP;
            sequence[1].r_plot_state[index].flip = BD_HFLIP;
            sequence[2].r_plot_state[index].flip = BD_HFLIP;
            sequence[3].r_plot_state[index].flip = BD_HFLIP;
            sequence[4].r_plot_state[index].flip = BD_HFLIP;
            sequence[5].r_plot_state[index].flip = BD_HFLIP;
        }
    }

    for (index = 0; index < IXP_SHEET_COLUMNS - 1; index++)
    {
        sequence[4].r_plot_state[index].index = IXP_SHEET_COLUMNS * 19 + 1 + index;
        sequence[5].r_plot_state[index].index = IXP_SHEET_COLUMNS * 19 + 1 + index;

        if (ipc.accessories > 0)
        {
            if (ipc.accessories == 1)
            {
                sequence[2].r_plot_state[index].priority = BD_PRIORITY_NONE; // Remove hair for helmet.
                sequence[4].r_plot_state[index].index = IXP_SHEET_COLUMNS * 17 + 1 + index; // Index 0 is standing pose.
            }
            else if (ipc.accessories == 2)
            {
                sequence[2].r_plot_state[index].priority = BD_PRIORITY_NONE;
                sequence[4].r_plot_state[index].index = IXP_SHEET_COLUMNS * 18 + 1 + index; 
            }
        }

        sequence[0].r_plot_state[index].handler = ipc_color_filter;
        sequence[0].r_plot_state[index].resource = IPCLib.IPCRGBA[ipc.skin_color];

        sequence[2].r_plot_state[index].handler = ipc_color_filter;
        sequence[2].r_plot_state[index].resource = IPCLib.IPCRGBA[ipc.hair_color];

        sequence[3].r_plot_state[index].handler = ipc_color_filter;
        sequence[3].r_plot_state[index].resource = IPCLib.IPCRGBA[ipc.eye_color];
    }
}

function ixp_process_exhibit(bd, exhibit)
{
    if (exhibit.status == IXP_STATUS_DISABLED) return;

    let index = 0;
    let sequence = exhibit.sequence;

    for (index = 0; index < sequence.length; index++)
    {
        bd_update_sequence(sequence[index]);
        bd_add_plot_state(
            bd,
            exhibit.viewport_id,
            bd_current_sequence_ps(sequence[index]));
    }

    ps_clear(bd.r_viewport[exhibit.viewport_id]);
    bd_process_plot_state(bd, bd.r_bitmap);
}

function ixp_process(bd, id, ipc_explorer)
{
    if (bd.status == BD_STATUS_LOCKED) return;

    let index = 0;
    let r_exhibit = ipc_explorer.r_exhibit;
    for (index = 0; index < r_exhibit.length; index++)
        ixp_process_exhibit(bd, r_exhibit[index]);
}

function ixp_main()
{
    let bd = bd_initialize();
    let ipc_explorer = new Object();

    let r_exhibit = new Array();
    let r_sequence = ixp_create_sequence_array();

    r_exhibit[0] = new t_exhibit;
    r_exhibit[0].viewport_id = 0;
    r_exhibit[0].r_sequence = r_sequence;

    ixp_set_exhibit(r_exhibit[0], null)

    ipc_explorer.r_exhibit = r_exhibit;

    bd_add_viewport(bd, 64*2, 64*2);
    bd.r_viewport[0].classList.add("avatar-canvas");

    document.getElementById("ipc-exhibit").append(bd.r_viewport[0]);

    bd_add_sprite_sheet(bd, 0, 576, 1280, IXP_SHEET_COLUMNS, IXP_SHEET_ROWS, "sprite-sheet.png");

    bd_add_object(bd, null, bd_wait_sprite_sheets);
    bd_add_object(bd, ipc_explorer, ixp_process);

    bd_update_frame(bd);
    return ipc_explorer;
}
