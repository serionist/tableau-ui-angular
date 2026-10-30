import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { injectSnackData, injectSnackRef, SnackService } from 'tableau-ui-angular/snack';

interface Invite {
  team: string;
}

// The snack's content: any component, which gets its data and its snack through inject
@Component({
  selector: 'app-invite-snack',
  imports: [TableauUiButtonModule],
  template: `
    <p>You are invited to {{ invite.team }}.</p>
    <button color="primary" (click)="snack.close('Joined')">Join</button>
  `,
  styles: `
    :host {
      display: block;
      padding: 0.5rem 1rem;
    }

    p {
      margin: 0 0 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteSnackComponent {
  protected readonly snack = injectSnackRef<string>();
  protected readonly invite = injectSnackData<Invite>();
}

@Component({
  selector: 'app-snack-component-example',
  imports: [TableauUiButtonModule],
  templateUrl: './snack-component.example.html',
  styleUrl: './snack-component.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackComponentExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $result = signal('No snack closed yet');

  // closed$ gives the result the component closed with, or undefined when the time ran out
  protected open(type: 'error' | 'info' | 'success') {
    const snack = this.snacks.openSnackComponent<InviteSnackComponent, Invite, string>(InviteSnackComponent, { team: 'Sales' }, 5000, type);
    snack.closed$.subscribe(result => {
      this.$result.set(`The last snack closed with: ${result ?? 'no result'}`);
    });
  }
}
