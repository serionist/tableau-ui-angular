import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { LoadingGifComponent } from '../../../component-library/src/lib/loading/loading-gif/loading-gif.component';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<LoadingGifComponent> = {
    title: 'Tableau/LoadingGif',
    component: LoadingGifComponent,
    tags: ['autodocs']
};

export default meta;
type Story = StoryObj<LoadingGifComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {};
