//Editor
const Editor = require('tui-editor');

import Editor from 'tui-editor';

const instance = new Editor({
  el: document.querySelector('#editorSection'),
  initialEditType: 'markdown',
  previewStyle: 'vertical',
  height: '300px'
});


instance.getHtml();

import Viewer from 'tui-editor/dist/tui-editor-Viewer';

const instance = new Viewer({
  el: document.querySelector('#viewerSection'),
  height: '500px',
  initialValue: '# content to be rendered'
});

