export abstract class UsedIcons {
  fonts: ('Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp')[] = ['Material Symbols Rounded'];
  weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[] = [400];
  grades: (-25 | 0 | 200)[] = [0];
  opticalSizes: (20 | 24 | 40 | 48)[] = [24];
  fills: boolean[] = [false];

  abstract usedIcons: string[];

  // these icons are used by the library itself
  builtInIcons: string[] = [
    'check',
    'clear',
    'close',
    'info',
    'error',
    'keyboard_arrow_up',
    'keyboard_arrow_right',
    'keyboard_arrow_down',
    'keyboard_arrow_left',
    'swap_vert',
    'arrow_downward',
    'arrow_upward',
  ];

  public getAllIcons(): string[] {
    // combine usedIcons + builtInIcons, distinct them and sort them
    return Array.from(new Set([...this.usedIcons, ...this.builtInIcons])).sort();
  }
}
