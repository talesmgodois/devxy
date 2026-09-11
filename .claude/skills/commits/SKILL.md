---
name: commits
description: Reads unstaged/staged code changes across the repo, proposes them grouped into Conventional Commits, and only executes after explicit user approval. Use when the user runs /commits, asks to create commits, or wants help organizing pending changes into commits.
---

# /commits

Read the current code changes (unstaged + staged), group related file changes into
meaningful commits following the [Conventional Commits](https://www.conventionalcommits.org/)
pattern, present the proposal to the user, and only execute after explicit approval.

Never skip the approval step, even if the grouping seems obvious.

## Workflow

### 1. Read code changes

Run, from the repo root:

```bash
git status
echo "=== UNSTAGED ==="
git diff
echo "=== STAGED ==="
git diff --cached
```

Analyze the diff to understand what changed and why. Pay attention to:
- Which files changed and in what way (added, modified, deleted, renamed)
- The logical groupings of changes (e.g., "new visual tool component + its registration in the
  index" is one group, "unrelated bug fix in another component" is another)
- File paths to infer the affected area (a component, a page, config, CI/deploy tooling, etc.)

### 2. Group into commit proposals

Organize the changes into logical commit groups. Each group becomes one commit following:

```
<type>(<scope>): <description>
```

**Types:**
| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Maintenance, tooling, deps, config |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `style` | Formatting only, no production change |
| `perf` | Performance improvement |

**Scope** is inferred from the changed paths, not picked from a fixed list — e.g. a component or
page name (`terminal`, `raffle`, `visual-tools`), `config`, `docker`, `ci`, `seo`.

**Commit body:** 1-2 sentences focused on *why* the change was made, not a restatement of the
diff — matches how commit messages should read in this project already. Only add a body when it
adds real context; a self-explanatory one-liner doesn't need one.

**Rules:**
- Each proposed commit lists the files it includes (bullet list).
- Don't create a commit for a single trivial change — batch closely related changes together.
- If only one logical group exists, propose a single commit.
- If changes are unrelated (e.g., a new feature + an unrelated bug fix), propose separate commits.
- Never bundle a change that looks like it might contain secrets (`.env`, credentials, tokens)
  without flagging it to the user first — see Safety below.

### 3. Present proposal to user

Show the proposal like this:

```
Branch: <current branch>

Proposed commits (X groups):

1. feat(raffle): add v.raffle visual tool
   Files:
     - src/components/visual-tools/RaffleGenerator.tsx
     - src/components/visual-tools/index.ts
   Body: "Exposes the raffle number generator as a standalone visual tool,
   matching the pattern used by the other v.* tools."

2. fix(terminal): correct off-by-one in history pagination
   Files:
     - src/components/Terminal.tsx
   Body: (none needed, self-explanatory)

---
Is this proposal good? Reply with 'y' to proceed or describe changes needed.
```

### 4. Wait for approval

**Do not execute any commits until the user explicitly approves.** The user can:
- Say "y", "yes", "proceed", "approve" → execute all proposed commits in order
- Describe changes (e.g., "merge 1 and 2", "split 3 into two", "drop the body on #2") → revise the
  proposal and show it again
- Say "n", "no", "cancel", "stop" → abort, make no changes

### 5. Execute commits

On approval, execute each commit one at a time, staging only the files listed for that commit
(never `git add -A` or `git add .`):

```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<body, if any>
EOF
)"
```

If the active session has attribution instructions for commits (for example a `Co-Authored-By`
trailer), append them to every commit message here exactly as instructed — this file doesn't
hardcode them since they vary by model/session.

Run all commits in sequence. After the last commit, run `git status` to confirm a clean tree and
show a short summary of what was committed.

### 6. Handle edge cases

- **No changes at all**: Report that there's nothing to commit and stop.
- **Only staged changes**: Use `git diff --cached` only; skip the unstaged section.
- **Both staged and unstaged changes exist**: Give separate proposal sections, noting that staged
  changes are already prepared and unstaged ones still need review.
- **Untracked files**: Run `git status` to see them and include relevant ones in a proposed
  commit's file list; they get picked up by the `git add` in step 5.
- **Pre-commit hook fails**: Fix the underlying issue, re-stage, and create a **new** commit —
  never amend, since a failed hook means the commit never happened.

## Safety

Follow the repo's standard git safety rules:
- Only commit when the user explicitly asked for it (invoking this skill counts).
- Never use `--no-verify`, `--no-gpg-sign`, or force flags.
- Always create new commits; never amend unless the user explicitly asks to amend.
- Before staging, check that nothing suspicious (credentials, `.env` contents, tokens) is being
  swept into a commit — if a file's name or diff looks sensitive, call it out to the user instead
  of silently including it.
