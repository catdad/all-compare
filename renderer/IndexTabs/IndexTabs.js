const { html, css, useState, useEffect, useRef, useCallback } = require('../tools/ui.js');

const TABS = require('../../lib/tabs.js');

const Frame = require('./Frame.js');

css('./IndexTabs.css');

function Tabs({ list, onSelect, onClose }) {
  const onCloseClick = tab => ev => {
    ev.preventDefault();
    ev.stopPropagation();

    onClose(tab);
  };

  const onAuxClick = tab => ev => {
    if (ev.button === 1) {
      onCloseClick(tab)(ev);
    }
  };

  return list.map(tab => {
    return html`<span key=${tab.id} class="tab ${tab.selected ? 'selected' : ''}" onclick=${() => onSelect(tab)} onauxclick=${onAuxClick(tab)}>
      <span title=${tab.title}>${tab.title}</span>
      <button onclick=${onCloseClick(tab)}>🞩</button>
    </span>`;
  });
}

function App() {
  const [tabs, setTabs] = useState([]);
  const view = useRef(null);

  useEffect(() => {
    const onUpdate = data => {
      console.log('update tabs', data);
      setTabs(data);
    };

    TABS.events.on('update', onUpdate);

    return () => {
      TABS.events.off('update', onUpdate);
    };
  }, [/* execute once */]);

  useEffect(async () => {
    try {
      const url = `${window.location.href}?route=directory`;
      await TABS.open({ url, title: 'Main', selected: true });
    } catch (e) {
      console.error('error creating main tab', e);
    }
  }, [/* execute once */]);

  const selectTab = useCallback(TAB => {
    TABS.focus(TAB.id);
  }, [tabs, setTabs]);

  const closeTab = useCallback(TAB => {
    if (TAB === tabs[0]) {
      return;
    }

    TABS.close(TAB.id);
  }, [tabs, setTabs]);

  return html`
    <${Frame} class="tab-bar">
      <span class=tabs style="--count:${tabs.length}">
        <${Tabs} list=${tabs} onClose=${closeTab} onSelect=${selectTab} />
      </span>
    <//>
    <div ref=${view}></div>
  `;
}

module.exports = App;
