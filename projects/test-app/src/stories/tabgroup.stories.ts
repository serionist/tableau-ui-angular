import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { TabComponent, TabGroupComponent } from '../../../component-library/src/public-api';



const meta: Meta<TabGroupComponent> = {
    title: 'Components/TabGroup',
    component: TabGroupComponent,
    tags: ['autodocs'],
    decorators: [
      moduleMetadata({
        imports: [CommonModule, TabGroupComponent, TabComponent],
      }),
    ]
  };
  
  export default meta;
  type Story = StoryObj<TabGroupComponent>;
  
  export const Default: Story = {
    render: (args) => ({
      template: `
        <tab-group>
          <tab [disabled]="true">
            <div tab-header>
              <i class="icon-example"></i> Tab 1
            </div>
            <div>
              Content for Tab 1
            </div>
          </tab>
          <tab>
            <div tab-header>
              <i class="icon-example"></i> Tab 2
            </div>
            <div>
              Content for Tab 2
            </div>
          </tab>
          <tab [disabled]="true">
            <div tab-header>
              <i class="icon-example"></i> Tab 3
            </div>
            <div>
              Content for Tab 3
            </div>
          </tab>
            <tab>
            <div tab-header>
              <i class="icon-example"></i> Tab 4
            </div>
            <div>
              Content for Tab 2
            </div>
          </tab>
            <tab>
            <div tab-header>
              <i class="icon-example"></i> Tab 5
            </div>
            <div>
              Content for Tab 2
            </div>
          </tab>
        </tab-group>
      `,
    })
  };
  