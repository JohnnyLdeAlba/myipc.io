const controllerList = new Array();

export function getController(id, controller) {

  if (typeof controller != 'undefined')
    controllerList[id] = controller;

  else if (typeof controllerList[id] == 'undefined')
    return null;

  return controllerList[id]();
}

