import { UsedIcons } from 'tableau-ui-angular/used-icons';

// The icons the app uses, by their Material Symbols name, and the styles it shows them in
export class Icons extends UsedIcons {
  // Each list is optional: without it, the script downloads the style tab-icon shows by default
  override fonts: ('Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp')[] = ['Material Symbols Rounded', 'Material Symbols Outlined'];
  // Several numbers download the range from the lowest to the highest: here every weight from 100 to 700
  override weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[] = [100, 700];
  override grades: (-25 | 0 | 200)[] = [0, 200];
  override opticalSizes: (20 | 24 | 40 | 48)[] = [24, 48];
  override fills: boolean[] = [false, true];

  override usedIcons: string[] = ['add_circle', 'do_not_disturb_on', 'home', 'search'];
}
