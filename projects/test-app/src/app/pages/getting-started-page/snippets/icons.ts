import { UsedIcons } from 'tableau-ui-angular/used-icons';

// The icons the app uses, by their Material Symbols name; the script adds the library's own
export class Icons extends UsedIcons {
  override usedIcons: string[] = ['home', 'search', 'palette'];
}
