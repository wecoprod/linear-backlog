import { describe, it, expect } from 'vitest';
import { buildKanbanColumns } from './linear';
import type { WorkflowState, Issue } from './linear';

describe('buildKanbanColumns', () => {
  const states: WorkflowState[] = [
    { id: 's1', name: 'Todo', color: '#eee', position: 1, type: 'unstarted' },
    { id: 's2', name: 'In Progress', color: '#f2c', position: 2, type: 'started' },
    { id: 's3', name: 'Done', color: '#5e6', position: 3, type: 'completed' },
  ];

  const issues: Issue[] = [
    { id: 'i1', title: 'Fix bug', url: 'https://linear.app/i1', dueDate: null, completedAt: null, project: null, updatedAt: '2026-06-01T10:00:00Z', state: { id: 's1' } },
    { id: 'i2', title: 'Add feature', url: 'https://linear.app/i2', dueDate: null, completedAt: null, project: null, updatedAt: '2026-06-02T10:00:00Z', state: { id: 's1' } },
    { id: 'i3', title: 'Deploy', url: 'https://linear.app/i3', dueDate: null, completedAt: null, project: null, updatedAt: '2026-06-01T10:00:00Z', state: { id: 's2' } },
  ];

  it('groups issues by state', () => {
    const columns = buildKanbanColumns(states, issues);
    const todoColumn = columns.find(c => c.state.id === 's1');
    expect(todoColumn?.issues).toHaveLength(2);
  });

  it('sorts columns by position', () => {
    const columns = buildKanbanColumns(states, issues);
    expect(columns[0].state.id).toBe('s1');
    expect(columns[1].state.id).toBe('s2');
  });

  it('sorts issues within column by updatedAt desc', () => {
    const columns = buildKanbanColumns(states, issues);
    const todo = columns.find(c => c.state.id === 's1')!;
    expect(todo.issues[0].id).toBe('i2'); // newer first
    expect(todo.issues[1].id).toBe('i1');
  });

  it('excludes states with no issues', () => {
    const columns = buildKanbanColumns(states, issues);
    expect(columns.find(c => c.state.id === 's3')).toBeUndefined();
  });

  it('returns empty array when no issues', () => {
    const columns = buildKanbanColumns(states, []);
    expect(columns).toHaveLength(0);
  });
});
