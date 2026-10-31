# block-env-access-agent-hook

A tiny Claude Code `PreToolUse` hook that stops the agent from reading or editing `.env` files.

- Blocks `.env`, `.env.local`, `.env.production`, ... in Read / Edit / Write / Grep / Glob / Bash.
- Allows `.env.example`, `.env.sample`, `.env.template`.
- One file, no dependencies, needs only Node.js.

Limit: it matches the file name in the tool call. It cannot stop obfuscated access such as `cat $(echo .e)nv`.

## Install with an agent (for teammates)

Tell Claude Code:

> Install the hook from https://github.com/CongNguyen086/block-env-access-agent-hook at user scope. Follow the "Instructions for the agent" section of its README.

## Instructions for the agent

Install at **user scope** (all projects on this machine). Do these steps in order:

1. Check Node.js: run `node --version`. If missing, stop and tell the user.
2. Download the hook:
   ```bash
   mkdir -p ~/.claude/hooks
   curl -fsSL https://raw.githubusercontent.com/CongNguyen086/block-env-access-agent-hook/main/block-env-access.cjs -o ~/.claude/hooks/block-env-access.cjs
   ```
3. Read `~/.claude/settings.json` first (create `{}` if it does not exist). **Merge**, never overwrite:
   - Add this object to the `hooks.PreToolUse` array. Create the `hooks` / `PreToolUse` keys only if missing. Keep every existing entry.
   - Skip this step if an entry with command `node "$HOME/.claude/hooks/block-env-access.cjs"` already exists.
   ```json
   {
     "matcher": "Bash|Glob|Grep|Read|Edit|Write",
     "hooks": [
       { "type": "command", "command": "node \"$HOME/.claude/hooks/block-env-access.cjs\"" }
     ]
   }
   ```
   Keep the command path as `$HOME/...`, not a relative path.
4. Verify. Both commands must give the shown exit code:
   ```bash
   echo '{"tool_input":{"file_path":".env"}}' | node ~/.claude/hooks/block-env-access.cjs; echo "exit $?"          # exit 2
   echo '{"tool_input":{"file_path":".env.example"}}' | node ~/.claude/hooks/block-env-access.cjs; echo "exit $?"  # exit 0
   ```
5. Tell the user to restart Claude Code (or open `/hooks`) so the hook loads. Do not read any real `.env` file to test it.

## Install by hand

Do steps 2 and 3 above yourself.

## Uninstall

Delete the entry from `~/.claude/settings.json` and remove `~/.claude/hooks/block-env-access.cjs`.
