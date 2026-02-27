// ---------------------------------------------------------------------------
// sprintf — printf-style string formatting
//
// Design patterns used:
//   - Pure Function : no side effects, deterministic output
// ---------------------------------------------------------------------------

interface FormatMatch {
  match: string;
  left: boolean;
  sign: string;
  pad: string;
  min: number;
  precision: number | undefined;
  code: string;
  negative: boolean;
  argument: string;
}

function convert(m: FormatMatch, nosign = false): string {
  const sign = nosign ? '' : m.negative ? '-' : m.sign;
  const padLen = m.min - m.argument.length + 1 - sign.length;
  const pad = padLen > 0 ? m.pad.repeat(padLen) : '';

  if (!m.left) {
    return m.pad === '0' || nosign
      ? sign + pad + m.argument
      : pad + sign + m.argument;
  }
  return m.pad === '0' || nosign
    ? sign + m.argument + pad.replace(/0/g, ' ')
    : sign + m.argument + pad;
}

/**
 * C-style `sprintf` implementation.
 *
 * Supported format specifiers: `%b` `%c` `%d` `%f` `%o` `%s` `%x` `%X` `%%`
 *
 * @example
 * ```ts
 * sprintf("Hello %s, you are %d years old", "Alice", 30)
 * // → "Hello Alice, you are 30 years old"
 *
 * sprintf("%05d", 42)
 * // → "00042"
 * ```
 */
export function sprintf(format: string, ...args: unknown[]): string {
  const exp =
    /(%([%]|(-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g;
  const matches: FormatMatch[] = [];
  const strings: string[] = [];
  let convCount = 0;
  let matchPosEnd = 0;
  let result: RegExpExecArray | null;

  while ((result = exp.exec(format)) !== null) {
    if (result[9]) convCount++;

    const stringPosStart = matchPosEnd;
    const stringPosEnd = exp.lastIndex - result[0].length;
    strings.push(format.substring(stringPosStart, stringPosEnd));
    matchPosEnd = exp.lastIndex;

    const argValue = args[convCount - 1];

    matches.push({
      match: result[0],
      left: !!result[3],
      sign: result[4] || '',
      pad: result[5] || ' ',
      min: result[6] ? parseInt(result[6]) : 0,
      precision: result[8] !== undefined ? parseInt(result[8]) : undefined,
      code: result[9] || '%',
      negative: Number(argValue) < 0,
      argument: String(argValue),
    });
  }

  strings.push(format.substring(matchPosEnd));

  if (matches.length === 0) return format;
  if (args.length < convCount) return format;

  let output = '';

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    let substitution: string;

    switch (m.code) {
      case '%':
        substitution = '%';
        break;
      case 'b':
        m.argument = Math.abs(parseInt(m.argument)).toString(2);
        substitution = convert(m, true);
        break;
      case 'c':
        m.argument = String.fromCharCode(Math.abs(parseInt(m.argument)));
        substitution = convert(m, true);
        break;
      case 'd':
        m.argument = String(Math.abs(parseInt(m.argument)));
        substitution = convert(m);
        break;
      case 'f':
        m.argument = Math.abs(parseFloat(m.argument)).toFixed(
          m.precision ?? 6,
        );
        substitution = convert(m);
        break;
      case 'o':
        m.argument = Math.abs(parseInt(m.argument)).toString(8);
        substitution = convert(m);
        break;
      case 's':
        m.argument = m.precision
          ? m.argument.substring(0, m.precision)
          : m.argument;
        substitution = convert(m, true);
        break;
      case 'x':
        m.argument = Math.abs(parseInt(m.argument)).toString(16);
        substitution = convert(m);
        break;
      case 'X':
        m.argument = Math.abs(parseInt(m.argument)).toString(16);
        substitution = convert(m).toUpperCase();
        break;
      default:
        substitution = m.match;
    }

    output += strings[i] + substitution;
  }

  output += strings[matches.length];
  return output;
}
