import { UsedIcons } from '../../component-library/used-icons/src/used-icons';
export class Icons extends UsedIcons {
    override fonts: ('Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp')[] = ['Material Symbols Outlined', 'Material Symbols Rounded', 'Material Symbols Sharp'];
    override weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[] = [100, 700];
    override grades: (-25 | 0 | 200)[] = [-25, 0, 200];
    override opticalSizes: (20 | 24 | 40 | 48)[] = [20, 48];
    override fills: boolean[] = [false, true];

    override usedIcons: string[] = [
        'add_circle',
        'do_not_disturb_on',
        'home',
        'search',
        'css',
        'trackpad_input',
        'check_box',
        'edit_square',
        'radio_button_checked',
        'dropdown',
        'list',
        'dialogs',
        'toast',
        'tooltip',
        'tabs',
        'side_navigation',
        'content_paste',
        'format_list_bulleted',
        'developer_guide',
        'flowchart',
        'more_vert',
        'calendar_clock',
        'top_panel_open',
        'unfold_more_double',
        'format_align_left',
        'format_align_right',
        'format_align_center',
        'format_align_justify',
        'palette',
        'light_mode',
        'dark_mode',
        'night_sight_auto',
        'table',
    ];
}
