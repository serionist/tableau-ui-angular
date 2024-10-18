import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { LoaderComponent } from '../../../component-library/src/lib/loading/loader/loader.component';
import { CheckboxControlValueAccessor, SelectControlValueAccessor } from '@angular/forms';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<LoaderComponent> = {
    title: 'Tableau/Loader',
    component: LoaderComponent,
    tags: ['autodocs'],
    argTypes: {
        message: {
            control: {
                options: ['Loading...', 'Please wait...', 'Fetching data...'],
            },
            description: 'The message to display in the loader.',
        }
    },
    args: {
        message: "Loading..."
    }
};

export default meta;
type Story = StoryObj<LoaderComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};

export const A: Story = {
    args: {
        message: "asddsadsad"
    }
};
