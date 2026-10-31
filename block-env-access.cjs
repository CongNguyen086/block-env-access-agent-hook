#!/usr/bin/env node
/**
 * block-env-access.cjs - simple PreToolUse hook: stop the agent from touching .env files.
 *
 * Reads the tool call JSON from stdin. If any path/command mentions .env, .env.local,
 * .env.production, ... it exits with code 2 (= block) and tells the agent why.
 * .env.example / .env.sample / .env.template are allowed.
 */

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // bad input: never break the session
  }

  const args = input.tool_input || {};
  // Every field that can name a file: Read/Edit/Write, Grep/Glob, Bash
  const text = [args.file_path, args.path, args.pattern, args.glob, args.command]
    .filter(Boolean)
    .join('\n');

  // ".env" optionally followed by ".something" (not preceded by a word char: skips "dotenv")
  const matches = text.match(/(?<![\w])\.env(?:\.[\w-]+)*/g) || [];
  const blocked = matches.find((m) => !/\.(example|sample|template)$/.test(m));

  if (blocked) {
    console.error(
      `Blocked: access to "${blocked}" is not allowed (may contain secrets). ` +
        'Ask the user to paste the values you need, or use .env.example.'
    );
    process.exit(2);
  }
  process.exit(0);
});
