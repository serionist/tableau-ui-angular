// What the specs share; never published, since no entry point imports it.
import axe from 'axe-core';

// Rules about a whole page (landmarks, a main heading), which a component's test fixture can't meet.
const PAGE_RULES = ['region', 'landmark-one-main', 'page-has-heading-one'];

/**
 * The axe violations in `context`, one line each, so `expect(...).toEqual([])` names every rule and node that failed.
 * `skip` turns a rule off for the open issue that will fix it, `{ 'rule-id': '#52' }`, and only shrinks.
 */
export async function axeViolations(context: Element, skip: Record<string, `#${number}`> = {}): Promise<string[]> {
  const rules = Object.fromEntries([...PAGE_RULES, ...Object.keys(skip)].map(id => [id, { enabled: false }]));
  const { violations } = await axe.run(context, { rules });
  return violations.map(violation => `${violation.id}: ${violation.help} (${violation.nodes.map(node => node.target.join(' ')).join(', ')})`);
}
