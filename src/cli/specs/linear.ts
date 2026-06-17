import type { CommandSpec } from '../args'
import { GLOBAL_FLAGS } from '../args'

export const LINEAR_COMMAND_SPECS: CommandSpec[] = [
  {
    path: ['linear', 'issue'],
    summary: 'Read Linear issue context for agents',
    usage:
      'janus linear issue [<id>] [--current] [--comments] [--children] [--depth <n>] [--attachments] [--relations] [--full] [--workspace <id>] [--json]',
    allowedFlags: [
      ...GLOBAL_FLAGS,
      'current',
      'comments',
      'children',
      'depth',
      'attachments',
      'relations',
      'full',
      'workspace',
      'id'
    ],
    positionalArgs: ['id'],
    examples: [
      'janus linear issue ENG-123',
      'janus linear issue --current --comments',
      'janus linear issue https://linear.app/acme/issue/ENG-123 --full --json'
    ]
  },
  {
    path: ['linear', 'search'],
    summary: 'Search connected Linear workspaces',
    usage: 'janus linear search <query> [--limit <n>] [--workspace <id>|all] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'limit', 'workspace', 'query'],
    positionalArgs: ['query'],
    examples: ['janus linear search "auth bug"', 'janus linear search ENG --workspace all --json']
  },
  {
    path: ['linear', 'team', 'list'],
    summary: 'List connected Linear teams',
    usage: 'janus linear team list [--workspace <id>|all] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'workspace'],
    examples: ['janus linear team list --workspace all --json']
  },
  {
    path: ['linear', 'team', 'members'],
    summary: 'List Linear team members',
    usage: 'janus linear team members --team <key|id> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'team', 'workspace'],
    examples: ['janus linear team members --team ENG --json']
  },
  {
    path: ['linear', 'team', 'states'],
    summary: 'List Linear team workflow states',
    usage: 'janus linear team states --team <key|id> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'team', 'workspace'],
    examples: ['janus linear team states --team ENG --json']
  },
  {
    path: ['linear', 'team', 'labels'],
    summary: 'List Linear team labels',
    usage: 'janus linear team labels --team <key|id> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'team', 'workspace'],
    examples: ['janus linear team labels --team ENG --json']
  },
  {
    path: ['linear', 'project', 'list'],
    summary: 'List connected Linear projects',
    usage:
      'janus linear project list [--query <text>] [--limit <n>] [--workspace <id>|all] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'query', 'limit', 'workspace'],
    examples: [
      'janus linear project list --query launch --json',
      'janus linear project list --workspace all --json'
    ]
  },
  {
    path: ['linear', 'list'],
    summary: 'List Linear issues for task triage',
    usage:
      'janus linear list [--filter assigned|created|all|completed|open] [--team <key|id>] [--limit <n>] [--workspace <id>|all] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'filter', 'team', 'limit', 'workspace'],
    examples: ['janus linear list --filter assigned --limit 10 --json']
  },
  {
    path: ['linear', 'status', 'set'],
    summary: 'Set a Linear issue status',
    usage: 'janus linear status set [<id>] [--current] --to <state> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'to', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: [
      'janus linear status set ENG-123 --to "In Review"',
      'janus linear status set --current --to Done --json'
    ]
  },
  {
    path: ['linear', 'assignee', 'set'],
    summary: 'Assign a Linear issue',
    usage:
      'janus linear assignee set [<id>] [--current] (--me | --to-id <userId>) [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'me', 'to-id', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear assignee set --current --me --json']
  },
  {
    path: ['linear', 'assignee', 'clear'],
    summary: 'Clear a Linear issue assignee',
    usage: 'janus linear assignee clear [<id>] [--current] [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear assignee clear ENG-123 --json']
  },
  {
    path: ['linear', 'priority', 'set'],
    summary: 'Set a Linear issue priority',
    usage:
      'janus linear priority set [<id>] [--current] --to none|low|medium|high|urgent [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'to', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear priority set --current --to high --json']
  },
  {
    path: ['linear', 'priority', 'clear'],
    summary: 'Clear a Linear issue priority',
    usage: 'janus linear priority clear [<id>] [--current] [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear priority clear ENG-123 --json']
  },
  {
    path: ['linear', 'estimate', 'set'],
    summary: 'Set a Linear issue estimate',
    usage: 'janus linear estimate set [<id>] [--current] --to <number> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'to', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear estimate set --current --to 3 --json']
  },
  {
    path: ['linear', 'estimate', 'clear'],
    summary: 'Clear a Linear issue estimate',
    usage: 'janus linear estimate clear [<id>] [--current] [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear estimate clear ENG-123 --json']
  },
  {
    path: ['linear', 'due-date', 'set'],
    summary: 'Set a Linear issue due date',
    usage:
      'janus linear due-date set [<id>] [--current] --to <yyyy-mm-dd> [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'to', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear due-date set --current --to 2026-06-30 --json']
  },
  {
    path: ['linear', 'due-date', 'clear'],
    summary: 'Clear a Linear issue due date',
    usage: 'janus linear due-date clear [<id>] [--current] [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear due-date clear ENG-123 --json']
  },
  {
    path: ['linear', 'label', 'add'],
    summary: 'Add labels to a Linear issue',
    usage:
      'janus linear label add [<id>] [--current] --label <labelId-or-exact-name>... [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'label', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear label add --current --label Bug --json']
  },
  {
    path: ['linear', 'label', 'remove'],
    summary: 'Remove labels from a Linear issue',
    usage:
      'janus linear label remove [<id>] [--current] --label <labelId-or-exact-name>... [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'label', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear label remove --current --label Bug --json']
  },
  {
    path: ['linear', 'label', 'set'],
    summary: 'Replace labels on a Linear issue',
    usage:
      'janus linear label set [<id>] [--current] --label <labelId-or-exact-name>... [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'label', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: ['janus linear label set ENG-123 --label Bug --json']
  },
  {
    path: ['linear', 'comment', 'add'],
    summary: 'Add a comment to a Linear issue',
    usage:
      'janus linear comment add [<id>] [--current] (--body <text> | --body-file <path|->) [--reply-to <commentId>] [--write-id <uuid>] [--workspace <id>] [--json]',
    allowedFlags: [
      ...GLOBAL_FLAGS,
      'current',
      'body',
      'body-file',
      'reply-to',
      'write-id',
      'workspace',
      'id'
    ],
    positionalArgs: ['id'],
    examples: [
      'janus linear comment add ENG-123 --body "Implementation is ready for review."',
      'janus linear comment add --current --body-file - --json'
    ],
    notes: ['Use --body-file - to read multiline comment bodies from stdin.']
  },
  {
    path: ['linear', 'attach'],
    summary: 'Attach a link to a Linear issue',
    usage:
      'janus linear attach [<id>] [--current] --url <url> [--title <title>] [--write-id <uuid>] [--workspace <id>] [--json]',
    allowedFlags: [...GLOBAL_FLAGS, 'current', 'url', 'title', 'write-id', 'workspace', 'id'],
    positionalArgs: ['id'],
    examples: [
      'janus linear attach ENG-123 --url https://example.com/review/123 --title "PR/MR link"',
      'janus linear attach --current --url https://example.com/review/123 --json'
    ]
  },
  {
    path: ['linear', 'create'],
    summary: 'Create a Linear issue',
    usage:
      'janus linear create --title <title> [--body <text> | --body-file <path|->] [--team <key|id>] [--project <projectId-or-exact-name>] [--state <stateId|exact-name>] [--assignee me|<userId>] [--priority none|low|medium|high|urgent] [--estimate <number>] [--due-date <yyyy-mm-dd>] [--label <labelId-or-exact-name>]... [--parent <id> | --parent-current] [--write-id <uuid>] [--workspace <id>] [--json]',
    allowedFlags: [
      ...GLOBAL_FLAGS,
      'title',
      'body',
      'body-file',
      'team',
      'project',
      'state',
      'assignee',
      'priority',
      'estimate',
      'due-date',
      'label',
      'parent',
      'parent-current',
      'write-id',
      'workspace'
    ],
    examples: [
      'janus linear create --title "Investigate flaky login" --team ENG --project "Launch"',
      'janus linear create --title "Follow-up bug" --parent-current --body-file - --json'
    ],
    notes: ['Use --body-file - to read multiline issue bodies from stdin.']
  }
]
