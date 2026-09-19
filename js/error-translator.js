// ---------- Правила перевода ----------
const RULES = [
  {
    pattern: /bad input on line (\d+)/i,
    translate: (m) =>
      `Строка ${m[1]}: синтаксическая ошибка. Возможно, забыли двоеточие ` +
      `после if/for/while/def или неправильно расставлены скобки.`
  },
  {
    pattern: /expected an indented block/i,
    translate: () =>
      `Проблема с отступами. Тело блока после if/for/while/def должно быть ` +
      `сдвинуто вправо (обычно 4 пробела).`
  },
  {
    pattern: /unexpected indent/i,
    translate: () =>
      `Лишний отступ. Строка сдвинута вправо, хотя не должна быть — ` +
      `проверьте её относительно предыдущей.`
  },
  {
    pattern: /unindent does not match/i,
    translate: () =>
      `Отступы не совпадают. Все строки одного блока должны быть сдвинуты ` +
      `ровно на одинаковое число пробелов.`
  },
  {
    pattern: /name '([^']+)' is not defined/i,
    translate: (m) =>
      `Переменная «${m[1]}» не определена. Возможно, забыли её создать ` +
      `или опечатались в имени.`
  },
  {
    pattern: /unsupported operand type\(s\)/i,
    translate: () =>
      `Несовместимые типы данных. Например, складываете число со строкой — ` +
      `нужен int() или str().`
  },
  {
    pattern: /cannot concatenate/i,
    translate: () =>
      `Попытка склеить строку с числом. Оберните число в str().`
  },
  {
    pattern: /division by zero|ZeroDivisionError/i,
    translate: () => `Деление на ноль. Проверьте, не равен ли делитель 0.`
  },
  {
    pattern: /invalid literal for int\(\)/i,
    translate: () =>
      `В int() попало не число. Проверьте, что пользователь вводит цифры.`
  },
  {
    pattern: /index out of range|IndexError/i,
    translate: () => `Выход за границы списка/строки. Проверьте индексы.`
  },
  {
    pattern: /keyerror/i,
    translate: () => `Ключ не найден в словаре. Проверьте имя ключа.`
  },
  {
    pattern: /taberror|inconsistent use of tabs/i,
    translate: () => `Смешаны табы и пробелы. Используйте только пробелы.`
  },
  {
    pattern: /eoferror/i,
    translate: () => `Программа ожидала ввод, но данных не было.`
  },
  {
    pattern: /maximum recursion depth/i,
    translate: () =>
      `Слишком глубокая рекурсия. Функция вызывает саму себя без условия выхода.`
  },
  {
    pattern: /takes (\d+) positional argument/i,
    translate: (m) =>
      `Функция ожидает ${m[1]} аргумент(а/ов), а передано другое число.`
  },
  {
    pattern: /unexpected eof while parsing/i,
    translate: () =>
      `Код обрывается на середине — вероятно, не закрыта скобка или кавычка.`
  },
  {
    pattern: /is not defined as a function/i,
    translate: () => `Вы вызываете что-то, что не является функцией.`
  },
  {
    pattern: /object is not subscriptable/i,
    translate: () => `Попытка взять индекс у объекта, который его не поддерживает.`
  },
  {
    pattern: /object is not callable/i,
    translate: () => `Вы пытаетесь вызвать как функцию то, что функцией не является.`
  }
];

// ---------- Извлечение текста ошибки ----------
/**
 * Принимает что угодно: строку, JS-Error, Python-объект Skulpt —
 * и возвращает человекочитаемый текст.
 */
function extractErrorText(err) {
  if (err == null) return '';

  // У объектов Skulpt переопределён toString() → "TypeName: msg on line N"
  // Поэтому пробуем его ПЕРВЫМ делом.
  let text = '';
  try {
    text = String(err);
  } catch (_) { /* ignore */ }

  // Иногда String() даёт "[object Object]" — тогда ищем дальше
  if (!text || text === '[object Object]') {
    try {
      if (typeof err.message === 'string' && err.message) {
        text = err.message;
      } else if (err.tp$name) {
        text = err.tp$name;
      }
    } catch (_) { /* ignore */ }
  }

  return text.trim();
}

// ---------- Публичная функция ----------
function translateError(err) {
  const raw = extractErrorText(err);

  // Отладка — уберите потом, если не нужна
  console.log('[translateError] raw =', JSON.stringify(raw));

  if (!raw) {
    return 'Произошла ошибка, но компилятор не сообщил деталей.';
  }

  for (const rule of RULES) {
    const m = raw.match(rule.pattern);
    if (m) return rule.translate(m);
  }

  return `Компилятор сообщил: «${raw}». Проверьте код внимательно.`;
}
