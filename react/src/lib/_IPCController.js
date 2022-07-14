export class t_controller {

  constructor() {

    this.instance = null;

    this.state = {

      refresh: null,
      setRefresh: null
    };

    this.signal = {
    
      mounted: false,
      updated: false
    };
    
    this.effect = {
      
      mounted: null,
      updated: null,
    };

    this.visible = false; 
  }

  unmount() { this.signal.mounted = false; }

  update() {

    if (this.signal.updated == true)
      return;

    let refresh = 0;
    
    if (typeof this.state.setRefresh == 'function') {

      refresh = parseInt(Math.random() * 1000);
      this.state.setRefresh(refresh);
    }

    this.signal.updated = true;
  }

  hide() {

    if (this.visible == true) {
      this.visible = false;
      this.update();
    }
  }

  show() {

    if (this.visible == false) {
      this.visible = true;
      this.update();
    }
  }

  display() { return this.visible ? 'block' : 'none'; }
}

export function getEffectListener(controller, payload) {

  return async () => {

    if (controller == null) return

    const signal = controller.signal;
    const effect = controller.effect;

    if (signal.mounted == false) {

      if (typeof effect.mounted == 'function')
        await effect.mounted(controller, payload);

      signal.mounted = true;
    }

    else if (signal.updated == true) {

      if (typeof effect.updated == 'function')
        await effect.updated(controller, payload);

      signal.updated = false;
    }

    return () => { controller.unmount(); };
  };
}

const IPCController = {

  t_controller: t_controller,
  getEffectListener: getEffectListener
}

export default IPCController;
