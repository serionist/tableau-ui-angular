import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { LoaderComponent } from './loader.component';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<LoaderComponent> = {
    title: 'Tableau/Loader',
    component: LoaderComponent,
    tags: ['autodocs']
};

export default meta;
type Story = StoryObj<LoaderComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};
