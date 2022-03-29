type Edge = [string, string];
function dfs(
  edges: Edge[],
  visited: Record<string, boolean>,
  current: string,
  options: { enter?: (node: string) => void; leave?: (node: string) => void },
) {
  const { enter, leave } = options;
  if (visited[current]) return;
  visited[current] = true;
  enter?.(current);
  for (const [from, to] of edges) {
    if (from === current) {
      dfs(edges, visited, to, { enter, leave });
    }
  }
  leave?.(current);
}

export function sortDag(edges: Edge[]): string[] {
  const visited: Record<string, boolean> = {};
  const order: Record<string, number> = {};
  let time = 0;
  const leave = (node: string) => (order[node] = time++);
  for (const [from] of edges) {
    if (!visited[from]) {
      dfs(edges, visited, from, { leave });
    }
  }
  return Object.keys(order).sort((a, b) => order[a] - order[b]);
}
