import { AfterContentInit, Component, ContentChild, input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: 'tab',
    template: `
    <ng-template #headerTemplate>
      <ng-content select="[tab-header]"></ng-content>
    </ng-template>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
    `,
  })
  export class TabComponent {
    @ViewChild('headerTemplate', { static: false, read: TemplateRef }) headerTemplate!: TemplateRef<any>;
    @ViewChild('contentTemplate', { static: false, read: TemplateRef }) contentTemplate!: TemplateRef<any>;
  
    disabled = input<boolean>(false);
    
  }

