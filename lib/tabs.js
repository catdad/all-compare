const EventEmitter = require('events');

const is = require('./is.js');
const name = 'tabs';
const { info, error } = require('./log.js')(name);
const isomorphic = require('./isomorphic.js');

const TABS_SIZE = 34;

const implementation = {
  open: () => {},
  focus: () => {},
  close: () => {}
};

const events = new EventEmitter();

const tabs = {};

if (is.main) {
  const { app, BrowserView, BrowserWindow } = require('electron');

  const update = () => {
    const tabData = Object.values(tabs)
      .map(({ title, url, id, selected }) => ({ title, url, id, selected: !!selected }));

    events.emit('update', tabData);
  };

  implementation.open = ({ url, title, selected }) => {
    info(`creating new tab for "${url}"`, selected);

    const id = Math.random().toString(36).slice(2);
    const [main] = BrowserWindow.getAllWindows();
    const size = main.getBounds();

    const tab = new BrowserView({
      backgroundColor: '#121212',
      darkTheme: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webviewTag: true,
      }
    });
    main.addBrowserView(tab);
    tab.setBounds({
      width: size.width / 2,
      height: size.height - TABS_SIZE,
      x: 0,
      y: TABS_SIZE
    });
    tab.webContents.loadURL(url);

    tab.setAutoResize({
      horizontal: true,
      vertical: true
    });

    tabs[id] = { id, title, url, tab };

    if (selected) {
      implementation.focus(id);
    } else {
      update();
    }

    return id;
  };

  implementation.focus = id => {
    const tab = tabs[id];

    if (!id) {
      throw new Error(`tab "${id}" cannot be found`);
    }

    for (const tab of Object.values(tabs)) {
      tab.selected = false;
    }

    tab.selected = true;

    // TODO this is in a newer version of Electron
    // main.setTopBrowserView(tab);

    update();
  };

  implementation.close = id => {
    const tab = tabs[id];

    if (tab) {
      const tabsArray = Object.values(tabs);

      tabsArray.forEach((t, idx) => {
        if (tabsArray[idx + 1] === tab) {
          t.selected = true;
        } else {
          t.selected = false;
        }
      });

      delete tabs[id];

      const [main] = BrowserWindow.getAllWindows();
      main.removeBrowserView(tab.tab);
    }

    update();
  };

  const hookBrowserWindow = (window) => {
    const ev = 'did-start-loading';

    window.webContents.on(ev, () => {
      // TODO we should probably only close BrowserViews associated
      // with the BrowserWindow that changed, but in this app, we
      // only have one window right now, so...
      for (const key in tabs) {
        implementation.close(tabs[key].id);
      }
    });
  };

  for (const window of BrowserWindow.getAllWindows()) {
    hookBrowserWindow(window);
  }

  app.on('browser-window-created', (ev, window) => hookBrowserWindow(window));
}

module.exports = isomorphic({ name, implementation, events });