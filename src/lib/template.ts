/** Replace {{var}} placeholders in a template body with provided values. */
export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) =>
    vars[key] !== undefined ? vars[key] : `{{${key}}}`,
  );
}
