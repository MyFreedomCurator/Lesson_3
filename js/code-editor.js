let cmEditor = null; // единственный экземпляр на всю страницу

/**
 * Создаёт редактор один раз. При повторных вызовах просто сбрасывает код.
 */
function initEditor(textareaId, initialCode) {
  if (!cmEditor) {
    cmEditor = CodeMirror.fromTextArea(document.getElementById(textareaId), {
      lineNumbers: true,
      mode: 'python',
      theme: 'dracula',
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 4
    });
  }

  // При повторном открытии задачи просто ставим нужный код
  cmEditor.setValue(initialCode || '');

  // Небольшой фикс: CodeMirror иногда неправильно считает размеры,
  // когда создан внутри скрытого контейнера
  setTimeout(() => cmEditor.refresh(), 0);

  return cmEditor;
}

function getEditorCode() {
  return cmEditor ? cmEditor.getValue() : '';
}

/**
 * Очищает редактор (например, при выходе)
 */
function destroyEditor() {
  if (cmEditor) {
    cmEditor.toTextArea();   // возвращает исходный <textarea>
    cmEditor = null;
  }
}

/* ---------- Запуск Python через Skulpt ---------- */
function runPython(code, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let finished = false;
    let output = '';

    const done = (payload) => {
      if (finished) return;
      finished = true;
      resolve(payload);
    };

    const timer = setTimeout(() => {
      done({
        success: false,
        error: { type: 'Timeout', message: 'Превышено время выполнения' },
        output
      });
    }, timeoutMs);

    try {
      Sk.configure({
        output: (t) => { output += t; },
        read: (f) => Sk.builtinFiles.files[f],
        inputfun: () => '',
        inputfunTakesPrompt: true,
        __future__: Sk.python3
      });

      Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true))
        .then(() => { clearTimeout(timer); done({ success: true, output }); })
        .catch((err) => { clearTimeout(timer); done({ success: false, error: err, output }); });
    } catch (e) {
      clearTimeout(timer);
      done({ success: false, error: { type: 'SetupError', message: e.message }, output });
    }
  });
}
