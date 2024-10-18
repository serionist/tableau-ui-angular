import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { ButtonComponent } from './button.component';
import { ComponentLibraryComponent } from '../public-api';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<ComponentLibraryComponent> = {
    title: 'Tableau/Test',
    component: ComponentLibraryComponent,
    tags: ['autodocs']
};

export default meta;
type Story = StoryObj<ButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};
