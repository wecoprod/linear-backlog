import { TTLCache } from './cache';

export interface WorkflowState {
  id: string;
  name: string;
  color: string;
  position: number;
  type: string;
}

export interface Issue {
  id: string;
  title: string;
  url: string;
  dueDate: string | null;
  completedAt: string | null;
  updatedAt: string;
  state: { id: string };
}

export interface KanbanColumn {
  state: WorkflowState;
  issues: Issue[];
}

export type BacklogData = KanbanColumn[];

const cache = new TTLCache<BacklogData>();

async function linearQuery<T>(query: string, variables: Record<string, string>, token: string): Promise<T> {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Linear API HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) throw new Error(`Linear GraphQL: ${json.errors[0].message}`);

  return json.data as T;
}

export function buildKanbanColumns(states: WorkflowState[], issues: Issue[]): BacklogData {
  const byState = new Map<string, Issue[]>();

  for (const issue of issues) {
    const bucket = byState.get(issue.state.id) ?? [];
    bucket.push(issue);
    byState.set(issue.state.id, bucket);
  }

  for (const [key, bucket] of byState) {
    byState.set(key, bucket.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  return states
    .sort((a, b) => a.position - b.position)
    .map(s => ({ state: s, issues: byState.get(s.id) ?? [] }));
}

export async function getBacklog(): Promise<BacklogData> {
  const token = import.meta.env.LINEAR_API_TOKEN as string;
  const teamId = import.meta.env.LINEAR_TEAM_ID as string;
  const label = import.meta.env.LINEAR_LABEL as string;
  const ttl = Math.max(1, parseInt(import.meta.env.CACHE_TTL ?? '60', 10) || 60);

  if (!token || !teamId || !label) {
    throw new Error('Missing env vars: LINEAR_API_TOKEN, LINEAR_TEAM_ID, LINEAR_LABEL');
  }

  const cached = cache.get('backlog');
  if (cached && !cached.isStale) return cached.data;

  try {
    const [statesData, issuesData] = await Promise.all([
      linearQuery<{ workflowStates: { nodes: WorkflowState[] } }>(
        `query($teamId: ID!) {
          workflowStates(filter: { team: { id: { eq: $teamId } } }) {
            nodes { id name color position type }
          }
        }`,
        { teamId },
        token
      ),
      linearQuery<{ issues: { nodes: Issue[] } }>(
        `query($teamId: ID!, $label: String!) {
          issues(filter: { team: { id: { eq: $teamId } }, labels: { name: { eq: $label } } }) {
            nodes { id title url dueDate completedAt updatedAt state { id } }
          }
        }`,
        { teamId, label },
        token
      ),
    ]);

    const columns = buildKanbanColumns(statesData.workflowStates.nodes, issuesData.issues.nodes);
    cache.set('backlog', columns, ttl);
    return columns;

  } catch (err) {
    if (cached?.data) {
      console.warn('[linear-backlog] API error, serving stale cache:', err);
      return cached.data;
    }
    throw err;
  }
}
