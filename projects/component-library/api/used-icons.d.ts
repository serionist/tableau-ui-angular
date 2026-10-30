// The public API of tableau-ui-angular/used-icons, from its built typings. npm run api:update writes it; a change to it is named in the PR.

export declare abstract class UsedIcons {
  fonts: ('Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp')[];
  weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[];
  grades: (-25 | 0 | 200)[];
  opticalSizes: (20 | 24 | 40 | 48)[];
  fills: boolean[];
  abstract usedIcons: string[];
  builtInIcons: string[];
  getAllIcons(): string[];
}
