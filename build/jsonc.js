// Read JSON with // and /* */ comments while preserving comment-like text inside strings.
function parseJsonc(source, fileName = 'JSONC') {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (inString) {
      output += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      output += ch;
      continue;
    }

    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      output += '\n';
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') output += '\n';
        i += 1;
      }
      i += 1;
      continue;
    }

    output += ch;
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error('Некорректный JSONC в ' + fileName + ': ' + error.message);
  }
}

module.exports = { parseJsonc };
