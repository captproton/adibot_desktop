(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * IPC keys.
 * @type {Object}
 */
const IPCKeys = exports.IPCKeys = {
  RequestShowMessage: 'RequestShowMessage',
  FinishShowMessage: 'FinishShowMessage',

  RequestShowOpenDialog: 'RequestShowOpenDialog',
  FinishShowOpenDialog: 'FinishShowOpenDialog',

  RequestCreateNewWindow: 'RequestCreateNewWindow',
  FinishCreateNewWindow: 'FinishCreateNewWindow',

  RequestSendMessage: 'RequestSendMessage',
  FinishSendMessage: 'FinishSendMessage',

  RequestGetWindowIDs: 'RequestGetWindowIDs',
  FinishGetWindowIDs: 'FinishGetWindowIDs',

  UpdateWindowIDs: 'UpdateWindowIDs',
  UpdateMessage: 'UpdateMessage'
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Provide a utility method.
 */
class Util {
  /**
   * Converts the value of the Date object to its equivalent string representation using the specified format.
   *
   * @param {Date}   date   Date and time. Default is current date and time.
   * @param {String} format Date and time format string. Default is "YYYY-MM-DD hh:mm:ss.SSS".
   *
   * @return {String} Formatted string.
   *
   * @see http://qiita.com/osakanafish/items/c64fe8a34e7221e811d0
   */
  static formatDate(date, format) {
    date = date === undefined ? new Date() : date;
    format = format === undefined ? 'YYYY-MM-DD hh:mm:ss.SSS' : format;

    // Zero padding
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));

    // Single digit
    format = format.replace(/M/g, date.getMonth() + 1);
    format = format.replace(/D/g, date.getDate());
    format = format.replace(/h/g, date.getHours());
    format = format.replace(/m/g, date.getMinutes());
    format = format.replace(/s/g, date.getSeconds());

    if (format.match(/S/g)) {
      const milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
      for (let i = 0, max = format.match(/S/g).length; i < max; ++i) {
        format = format.replace(/S/, milliSeconds.substring(i, i + 1));
      }
    }

    return format;
  }

  /**
   * Output console log with datetime.
   *
   * @param {String} message Message.
   */
  static log(message) {
    console.log('[' + Util.formatDate() + ']', message);
  }
}
exports.default = Util;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _Constants = require('../common/Constants.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manage the dialog.
 */
class DialogManager {
  /**
   * Initialize instance.
   *
   * @param {Main} context Application context.
   */
  constructor(context) {
    context.ipc.on(_Constants.IPCKeys.RequestShowMessage, this._onRequestShowMessage.bind(this));
    context.ipc.on(_Constants.IPCKeys.RequestShowOpenDialog, this._onRequestShowOpenDialog.bind(this));
  }

  /**
   * Shows a message box.
   *
   * @param {BrowserWindow} ownerWindow BrowserWindow, Not required if null.
   * @param {Object}        options     Dialog options.
   *
   * @return {Number} Index of the selected button on dialog.
   */
  showMessage(ownerWindow, options) {
    if (ownerWindow) {
      return _electron2.default.dialog.showMessageBox(ownerWindow, options);
    }

    return _electron2.default.dialog.showMessageBox(options);
  }

  /**
   * Shows an open file/folder dialog.
   *
   * @param {BrowserWindow} ownerWindow BrowserWindow, Not required if null.
   * @param {Object}        options     Dialog options.
   *
   * @return {Array.<String>} On success this method returns an array of file paths chosen by the user, otherwise it returns undefined.
   */
  showOpenDialog(ownerWindow, options) {
    if (ownerWindow) {
      return _electron2.default.dialog.showOpenDialog(ownerWindow, options);
    }

    return _electron2.default.dialog.showOpenDialog(options);
  }

  /**
   * Occurs when the show message dialog has been requested.
   *
   * @param {Event}  ev      Event data.
   * @param {Object} options Options of a dialog.
   */
  _onRequestShowMessage(ev, options) {
    if (!options) {
      ev.sender.send(_Constants.IPCKeys.FinishShowMessage, new Error('Invalid arguments.'), null);
      return;
    }

    const button = this.showMessage(ev.sender.getOwnerBrowserWindow(), options);
    ev.sender.send(_Constants.IPCKeys.FinishShowMessage, button, null);
  }

  /**
   * Occurs when the show file/folder open dialog has been requested.
   *
   * @param {Event}  ev      Event data.
   * @param {Object} options Options of a dialog.
   */
  _onRequestShowOpenDialog(ev, options) {
    if (!options) {
      ev.sender.send(_Constants.IPCKeys.FinishShowOpenDialog, new Error('Invalid arguments.'), null);
      return;
    }

    const paths = this.showOpenDialog(ev.sender.getOwnerBrowserWindow(), options);
    ev.sender.send(_Constants.IPCKeys.FinishShowOpenDialog, paths, null);
  }
}
exports.default = DialogManager;

},{"../common/Constants.js":1,"electron":undefined}],4:[function(require,module,exports){
'use strict';

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _Util = require('../common/Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _MainMenu = require('./MainMenu.js');

var _MainMenu2 = _interopRequireDefault(_MainMenu);

var _DialogManager = require('./DialogManager.js');

var _DialogManager2 = _interopRequireDefault(_DialogManager);

var _WindowManager = require('./WindowManager.js');

var _WindowManager2 = _interopRequireDefault(_WindowManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Application entry point.
 */
class Main {
  /**
   * Initialize instance.
   */
  constructor() {
    // Compile switch
    global.DEBUG = true;
    if (DEBUG) {
      _Util2.default.log('Initialize Application');
    }

    /**
     * IPC module for main process.
     * @type {ipcMain}
     */
    this._ipc = require('electron').ipcMain;

    /**
     * The shell module provides functions related to desktop integration.
     * @type {shell}
     */
    this._shell = require('electron').shell;

    /**
     * Manage the window.
     * @type {WindowManager}
     */
    this._windowManager = new _WindowManager2.default(this);

    /**
     * Manage the native dialog.
     * @type {DialogManager}
     */
    this._dialogManager = new _DialogManager2.default(this);
  }

  /**
   * Get the IPC module.
   * @return {ipcMain} IPC module.
   */
  get ipc() {
    return this._ipc;
  }

  /**
   * Get the shell module.
   * @return {shell} IPC module.
   */
  get shell() {
    return this._shell;
  }

  /**
   * Get the window manager.
   *
   * @return {WindowManager} Instance of the window manager.
   */
  get windowManager() {
    return this._windowManager;
  }

  /**
   * Occurs when a application launched.
   */
  onReady() {
    this._windowManager.createNewWindow();

    const menu = _electron2.default.Menu.buildFromTemplate(_MainMenu2.default.menu(this));
    _electron2.default.Menu.setApplicationMenu(menu);
  }

  /**
   * Occurs when a window all closed.
   */
  onWindowAllClosed() {
    if (DEBUG) {
      _Util2.default.log('Quit');
    }

    _electron2.default.app.quit();
  }
}

const main = new Main();
_electron2.default.app.on('ready', () => {
  if (DEBUG) {
    _Util2.default.log('Application is ready');
  }

  main.onReady();
});

_electron2.default.app.on('quit', () => {
  if (DEBUG) {
    _Util2.default.log('Application is quit');
  }
});

_electron2.default.app.on('window-all-closed', () => {
  if (DEBUG) {
    _Util2.default.log('All of the window was closed.');
  }

  main.onWindowAllClosed();
});

},{"../common/Util.js":2,"./DialogManager.js":3,"./MainMenu.js":5,"./WindowManager.js":6,"electron":undefined}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AppName = 'Adibot Desktop';
const HelpURL = 'https://adibot-production.herokuapp.com/users/sign_in';
const SettingsURL = 'https://adibot-production.herokuapp.com/';

/**
 * Main menu.
 */
class MainMenu {
  /**
   * Create menu.
   *
   * @param {Main} context Application instance.
   *
   * @return {Array.<Object>} Menu.
   */
  static menu(context) {
    const templates = [MainMenu._menuView(), MainMenu._menuWindow(), MainMenu._menuHelp()];

    if (process.platform === 'darwin') {
      templates.unshift(MainMenu._menuApp(context));
    }

    return templates;
  }

  /**
   * Create a menu of Application ( OS X only ).
   *
   * @return {Object} Menu data.
   */
  static _menuApp(context) {
    return {
      label: AppName,
      submenu: [{
        label: 'About ' + AppName,
        click: () => {
          context.windowManager.createAboutWindow();
        }
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ' + AppName,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      }, {
        label: 'Show All',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          _electron2.default.app.quit();
        }
      }]
    };
  }

  /**
   * Create a menu of View.
   *
   * @return {Object} Menu data.
   */
  static _menuView() {
    const templates = {
      label: 'View',
      submenu: [{
        label: 'Toggle Full Screen',
        accelerator: (() => {
          return process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      }]
    };

    if (DEBUG) {
      templates.submenu.unshift({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      });

      templates.submenu.push({
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          return process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      });
    }

    return templates;
  }

  /**
   * Create a menu of Window.
   *
   * @return {Object} Menu data.
   */
  static _menuWindow() {
    const templates = {
      label: 'Window',
      role: 'window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }]
    };

    if (process.platform === 'darwin') {
      templates.submenu.push({
        type: 'separator'
      });

      templates.submenu.push({
        label: 'Bring All to Front',
        role: 'front'
      });
    }

    return templates;
  }

  /**
   * Create a menu of Help.
   *
   * @return {Object} Menu data.
   */
  static _menuHelp() {
    return {
      label: 'Help',
      role: 'help',
      submenu: [{
        label: 'Learn More',
        click: () => {
          _electron2.default.shell.openExternal(HelpURL);
        }
      },
      {
        label: 'Settings',
        click: () => {
          _electron2.default.shell.openExternal(SettingsURL);
        }
      }]
    };
  }
}
exports.default = MainMenu;

},{"electron":undefined}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Util = require('../common/Util.js');

var _Util2 = _interopRequireDefault(_Util);

var _Constants = require('../common/Constants.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manage the window.
 */
class WindowManager {
  /**
   * Initialize instance.
   *
   * @param {Main} context Application context.
   */
  constructor(context) {
    /**
     * Application context.
     * @type {Main}
     */
    this._context = context;

    /**
     * Collection of a managed window.
     * @type {Map.<String, BrowserWindow>}
     */
    this._windows = new Map();

    /**
     * About dialog.
     * @type {BrowserWindow}
     */
    this._aboutDialog = null;

    context.ipc.on(_Constants.IPCKeys.RequestCreateNewWindow, this._onRequestCreateNewWindow.bind(this));
    context.ipc.on(_Constants.IPCKeys.RequestSendMessage, this._onRequestSendMessage.bind(this));
    context.ipc.on(_Constants.IPCKeys.RequestGetWindowIDs, this._onRequestGetWindowIDs.bind(this));
  }

  /**
   * Reload the focused window, For debug.
   */
  reload() {
    const w = _electron2.default.BrowserWindow.getFocusedWindow();
    if (w) {
      w.reload();
    }
  }

  /**
   * Switch the display of the developer tools window at focused window, For debug.
   */
  toggleDevTools() {
    const w = _electron2.default.BrowserWindow.getFocusedWindow();
    if (w) {
      w.toggleDevTools();
    }
  }

  /**
   * Create a new window.
   *
   * @return {BrowserWindow} Created window.
   */
  createNewWindow() {
    const w = new _electron2.default.BrowserWindow({
      width: 400,
      height: 400,
      minWidth: 400,
      minHeight: 400,
      resizable: true
    });

    const id = w.id;

    w.on('closed', () => {
      if (DEBUG) {
        _Util2.default.log('Window was closed, id = ' + id);
      }

      // Unregister
      this._windows.delete(id);
      this._notifyUpdateWindowIDs(id);

      if (this._windows.size === 0 && this._aboutDialog) {
        this._aboutDialog.close();
      }
    });

    const filePath = _path2.default.join(__dirname, 'index.html');
    w.loadURL('file://' + filePath + '#' + w.id);
    this._windows.set(id, w);

    return w;
  }

  /**
   * Show the about application window.
   */
  createAboutWindow() {
    if (this._aboutDialog) {
      return;
    }

    const w = new _electron2.default.BrowserWindow({
      width: 400,
      height: 256,
      resizable: false,
      alwaysOnTop: true
    });

    w.setMenu(null);

    w.on('closed', () => {
      if (DEBUG) {
        _Util2.default.log('The about application window was closed.');
      }

      this._aboutDialog = null;
    });

    const filePath = _path2.default.join(__dirname, 'about.html');
    w.loadURL('file://' + filePath);

    this._aboutDialog = w;
  }

  /**
   * Notify that the window ID list has been updated.
   *
   * @param {Number} excludeID Exclude ID.
   */
  _notifyUpdateWindowIDs(excludeID) {
    const windowIDs = [];
    for (let key of this._windows.keys()) {
      windowIDs.push(key);
    }

    this._windows.forEach(w => {
      if (w.id === excludeID) {
        return;
      }

      w.webContents.send(_Constants.IPCKeys.UpdateWindowIDs, windowIDs);
    });
  }

  /**
   * Occurs when a show new window requested.
   *
   * @param {IPCEvent} ev Event data.
   */
  _onRequestCreateNewWindow(ev) {
    const createdWindow = this.createNewWindow();
    ev.sender.send(_Constants.IPCKeys.FinishCreateNewWindow);

    this._notifyUpdateWindowIDs(createdWindow.id);
  }

  /**
   * Occurs when a send message requested.
   *
   * @param {IPCEvent} ev      Event data.
   * @param {Number}   id      Target window's identifier.
   * @param {String}   message Message.
   */
  _onRequestSendMessage(ev, id, message) {
    const w = this._windows.get(id);
    if (w) {
      w.webContents.send(_Constants.IPCKeys.UpdateMessage, message);
    }

    ev.sender.send(_Constants.IPCKeys.FinishSendMessage);
  }

  /**
   * Occurs when a get window identifiers requested.
   *
   * @param {IPCEvent} ev Event data.
   */
  _onRequestGetWindowIDs(ev) {
    const windowIDs = Array.from(this._windows.keys());
    ev.sender.send(_Constants.IPCKeys.FinishGetWindowIDs, windowIDs);
  }
}
exports.default = WindowManager;

},{"../common/Constants.js":1,"../common/Util.js":2,"electron":undefined,"path":undefined}]},{},[4])
//# sourceMappingURL=main.js.map
