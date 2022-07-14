import fetchIPC from './fetchIPC';
import createSubscription from './SubscriptionService';

const COMMANDS_SCREEN = `
CLEAR IPC#&lt;NUMBER&gt; NAME BIRTHDAY DNA ATTRTIBUTES LIST

`;

const LIST_SCREEN = `
NAME         %1
BIRTHDAY     %2

DNA

RACE         %3
SUBRACE      %4
GENDER       %5
HEIGHT       %6
SKIN COLOR   %7
HAIR COLOR   %8
EYE COLOR    %9
HANDEDNESS   %10

ATTRIBUTES

STRENTH      %11
FORCE        %12
SUSTAIN      %13
TOLERANCE    %14

DEXTERITY    %15
SPEED        %16
PRECISION    %17
REACTION     %18

INTELLIGENCE %19
MEMORY       %20
PROCESSING   %21
REASONING    %22

CONSTITUION  %23
HEALING      %24
FORTITUDE    %25
VITALITY     %26

LUCK         %27

`;

const ATTRIBUTES_SCREEN = `
ARRTIBUTES

STRENTH      %1
FORCE        %2
SUSTAIN      %3
TOLERANCE    %4

DEXTERITY    %5
SPEED        %6
PRECISION    %7
REACTION     %8

INTELLIGENCE %9
MEMORY       %10
PROCESSING   %11
REASONING    %12

CONSTITUION  %13
HEALING      %14
FORTITUDE    %15
VITALITY     %16

LUCK         %17

`;

const DNA_SCREEN = `
DNA

RACE       %1
SUBRACE    %2
GENDER     %3
HEIGHT     %4
SKIN COLOR %5
HAIR COLOR %6
EYE COLOR  %7
HANDEDNESS %8
 
`;

class t_terminal {

  WaitPrompt;
  CharacterTable;

  waitPromptIndex;
  waitPromptSpeed;
  waitPromptInterval;

  ipc;
  label_ipc;

  state;
  cursor;
  prompt;
  input;
  output;

  lineBuffer;
  displayBuffer;
  displayBufferRows;

  subscription;
  response;
  displayCallback;

  constructor() {

    this.waitPrompt = "|/-\\|/-\\";
    this.CharacterTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789# ";

    this.waitPromptIndex = 0;
    this.waitPromptSpeed = 50;
    this.waitPromptInterval = null;

    this.ipc = null;
    this.label_ipc = null;

    this.state = "";
    this.cursor = "";
    this.prompt = ""
    this.input = "";
    this.output = "";

    this.lineBuffer = "";
    this.displayBuffer = new Array();
    this.displayBufferRows = 80;

    this.response = null;
    this.displayCallback = () => {};

    this.setCursor();
    this.setPrompt();

    this.subscription = createSubscription();
    this.subscription.createSubscription("userInput");

    this.getDefaultSubscribers();
  }

  setResponse(code, payload) {

    this.response = { code: '', payload: null };

    if (typeof code == 'undefined')
      this.response.code = "ok";
    else
      this.response.code = code;

    if (typeof payload == 'undefined')
      this.response.payload = null;
    else
      this.response.payload = payload;
  }

  addSubscriber(event_id, callback) {
    this.subscription.addSubscriber(event_id, "default", callback);
  }

  getDefaultSubscribers() {

    this.addSubscriber("userInput", async (input) => {

      const match = input.match(/^ipc#([0-9]+)$/);
      if (match == null) 
        return;

      const ipc_id = match[1];

      this.setResponse();

      this.setWaitState();
      let response = await fetchIPC(ipc_id);  
      this.clearState();    

      if (response.code != "SUCCESS") {

        this.displayBuffer.push(response.code + '\n'); 
        return;
      }

      const ipc = response.payload.ipc;
      const label_ipc = response.payload.label_ipc;

      this.ipc = ipc;
      this.label_ipc = label_ipc;
      
      this.setPrompt("IPC#" + ipc_id + "&gt;&nbsp;");
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "list") return;
      if (this.label_ipc == null) return;

      let screen = LIST_SCREEN;

      screen = screen.replace('%1', this.label_ipc.name);
      screen = screen.replace('%2', this.label_ipc.birth);
      screen = screen.replace('%3', this.label_ipc.race);
      screen = screen.replace('%4', this.label_ipc.subrace);
      screen = screen.replace('%5', this.label_ipc.gender);
      screen = screen.replace('%6', this.label_ipc.height);
      screen = screen.replace('%7', this.label_ipc.skin_color);
      screen = screen.replace('%8', this.label_ipc.hair_color);
      screen = screen.replace('%9', this.label_ipc.eye_color);
      screen = screen.replace('%10', this.label_ipc.handedness);

      screen = screen.replace('%11', this.label_ipc.strength);
      screen = screen.replace('%12', this.label_ipc.force);
      screen = screen.replace('%13', this.label_ipc.sustain);
      screen = screen.replace('%14', this.label_ipc.tolerance);
      screen = screen.replace('%15', this.label_ipc.dexterity);
      screen = screen.replace('%16', this.label_ipc.speed);
      screen = screen.replace('%17', this.label_ipc.precision);
      screen = screen.replace('%18', this.label_ipc.reaction);
      screen = screen.replace('%19', this.label_ipc.intelligence);
      screen = screen.replace('%20', this.label_ipc.memory);
      screen = screen.replace('%21', this.label_ipc.processing);
      screen = screen.replace('%22', this.label_ipc.reasoning);
      screen = screen.replace('%23', this.label_ipc.constitution);
      screen = screen.replace('%24', this.label_ipc.healing);
      screen = screen.replace('%25', this.label_ipc.fortitude);
      screen = screen.replace('%26', this.label_ipc.vitality);
      screen = screen.replace('%27', this.label_ipc.luck);

      this.displayBuffer.push(screen);

      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "dna") return;
      if (this.label_ipc == null) return;

      console.log(this.label_ipc);

      let screen = DNA_SCREEN;

      screen = screen.replace('%1', this.label_ipc.race);
      screen = screen.replace('%2', this.label_ipc.subrace);
      screen = screen.replace('%3', this.label_ipc.gender);
      screen = screen.replace('%4', this.label_ipc.height);
      screen = screen.replace('%5', this.label_ipc.skin_color);
      screen = screen.replace('%6', this.label_ipc.hair_color);
      screen = screen.replace('%7', this.label_ipc.eye_color);
      screen = screen.replace('%8', this.label_ipc.handedness);

      this.displayBuffer.push(screen);

      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "attributes") return;
      if (this.label_ipc == null) return;

      let screen = ATTRIBUTES_SCREEN;

      screen = screen.replace('%1', this.label_ipc.strength);
      screen = screen.replace('%2', this.label_ipc.force);
      screen = screen.replace('%3', this.label_ipc.sustain);
      screen = screen.replace('%4', this.label_ipc.tolerance);
      screen = screen.replace('%5', this.label_ipc.dexterity);
      screen = screen.replace('%6', this.label_ipc.speed);
      screen = screen.replace('%7', this.label_ipc.precision);
      screen = screen.replace('%8', this.label_ipc.reaction);
      screen = screen.replace('%9', this.label_ipc.intelligence);
      screen = screen.replace('%10', this.label_ipc.memory);
      screen = screen.replace('%11', this.label_ipc.processing);
      screen = screen.replace('%12', this.label_ipc.reasoning);
      screen = screen.replace('%13', this.label_ipc.constitution);
      screen = screen.replace('%14', this.label_ipc.healing);
      screen = screen.replace('%15', this.label_ipc.fortitude);
      screen = screen.replace('%16', this.label_ipc.vitality);
      screen = screen.replace('%17', this.label_ipc.luck);

      this.displayBuffer.push(screen);

      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "name") return;
      if (this.label_ipc == null) return;

      this.displayBuffer.push("\n" + this.label_ipc.name + "\n\n");

      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "birthday") return;
      if (this.label_ipc == null) return;

      this.displayBuffer.push("\n" + this.label_ipc.birth + "\n\n");

      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "clear") return;
      this.clear();
      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "ecco") return;
      this.displayBuffer.push("THE DOLPHIN\n");
      this.setResponse();
      this.resetDisplay();
    });

    this.addSubscriber("userInput", (input) => {

      if (input != "commands") return;
      this.displayBuffer.push(COMMANDS_SCREEN);
      this.setResponse();
      this.resetDisplay();
    });

  }

  setCursor(value) {

    if (typeof value == 'undefined') {
      this.cursor = "&#0232";
      return;
    }

    this.cursor = value;
  }

  setPrompt(value) {

    if (typeof value == 'undefined') {
      this.prompt = "&gt;&nbsp;";
      return;
    }

    this.prompt = value;
  }

  validKey(key) {

    if (key == ' ')
      return key;

    key = key.trim();
    key = key.toUpperCase();

    let index = 0;
    for (index = 0; index < this.CharacterTable.length; index++) {

      if (key == this.CharacterTable.charAt(index))
        return key;
    }
  
    return -1;
  }

  truncateDisplay() {

    if (this.displayBuffer.length > this.displayBufferRows)
      this.displayBuffer = this.displayBuffer.slice(-this.displayBufferRows);
  }

  async processSubscriptions() {

    this.setResponse("invalidCommand");

    this.input = this.input.trim();
    if (this.input == '') {

      this.resetDisplay();
      return;
    }

    this.input = this.input.toLowerCase();
    this.subscription.processSubscription("userInput", this.input); 

    if (this.response.code != "ok") {

      this.displayBuffer.push("INVALID COMMAND\n");
      this.resetDisplay();
    }
  }

  clearState() { this.state = ""; }

  setWaitState() {

    this.state = "wait";
    this.waitPromptIndex = 0;

    this.input = "";
    this.setPrompt('');
    this.setCursor('');

    this.waitPromptInterval = setInterval(
      () => this.wait(),
      this.waitPromptSpeed);
  }

  wait() {

    if (this.state != "wait") {

      clearInterval(this.waitPromptInterval);
      this.state = "";
      this.resetDisplay();

      return;
    }

    if (this.waitPromptIndex >= this.waitPrompt.length - 1)
      this.waitPromptIndex = 0;
    else
      this.waitPromptIndex++;

    this.setPrompt(this.waitPrompt[this.waitPromptIndex]);
    this.setCursor('');  
    this.display();
  }

  enterKeyDown(key) {

    if (this.state == "wait")
      return;

    if (key != "Enter")
      return false;

    this.setCursor('');  
    this.lineBuffer = this.prompt + this.input + this.cursor;

    this.displayBuffer.push(this.lineBuffer + "\n");
    this.truncateDisplay()

    this.processSubscriptions();

    return true;
  }

  keyDown(key) {

    if (this.state == "wait")
      return;

    if (this.enterKeyDown(key) == true)
      return;

    if (key == "Backspace")  
      this.input = this.input.slice(0, -1);
    else {

      key = this.validKey(key);
      if (key == -1)
        return;

      this.input+= key;
    }

    this.display();
  }

  extractKey(inputBuffer) {

    if (this.state == "wait")
      return;

    let key = '';

    if (inputBuffer == '')
      key = 'Backspace';
    else if (inputBuffer == "  ")
      key = ' ';
    else
      key = inputBuffer;

    this.keyDown(key);
  }

  update() {

    this.setCursor();
    this.display();
  } 

  focus() {

    if (this.state == "wait")
      return;

    this.update();
  }

  blur() {

    if (this.state == "wait")
      return;

    this.setCursor('');
    this.display();
  }

  clear() {

    this.displayBuffer = [];
    this.input = "";
    this.display();
  }

  resetDisplay() {

    this.setCursor();
    this.input = "";
    this.display();
  }

  display() {

    this.lineBuffer = this.prompt + this.input + this.cursor;
    this.output = "";

    this.displayBuffer.forEach((line) => {
      this.output+= line;
    });

    this.output+= this.lineBuffer + "\n";

    this.output = this.output.replace(/ /g, "&nbsp;");
    this.output = this.output.replace(/\n/g, "<br />");

    this.displayCallback();
  }
}

export default function createTerminal() { return new t_terminal; }
