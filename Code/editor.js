//Editor
const Editor = require('tui-editor');
import 'tui-editor/dist/tui-editor.css'; // editor's ui
import 'tui-editor/dist/tui-editor-contents.css'; // editor's content
import 'codemirror/lib/codemirror.css'; // codemirror
import 'highlight.js/styles/github.css'; // code block highlight

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'highlight.js/styles/github.css';

import Editor from 'tui-editor';

const instance = new Editor({
  el: document.querySelector('#editorSection'),
  initialEditType: 'markdown',
  previewStyle: 'vertical',
  height: '300px'
});


instance.getHtml();

import 'tui-editor/dist/tui-editor-contents.css';
import 'highlight.js/styles/github.css';

import Viewer from 'tui-editor/dist/tui-editor-Viewer';

const instance = new Viewer({
  el: document.querySelector('#viewerSection'),
  height: '500px',
  initialValue: '# content to be rendered'
});

instance.getHtml();
import Editor from 'tui-editor';

const instance = Editor.factory({
  el: document.querySelector('#viewerSection'),
  viewer: true,
  height: '500px',
  initialValue: '# content to be rendered'
});