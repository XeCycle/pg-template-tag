interface SqlLiteral {
  text: string;
  values: any[];
}

export default function SQLTag(
  parts: TemplateStringsArray,
  ...values: any[]
): SqlLiteral;

export function sqlLiteral(value: string): SqlLiteral;

export function join(
  array: SqlLiteral[],
  separator: SqlLiteral | string
): SqlLiteral;
