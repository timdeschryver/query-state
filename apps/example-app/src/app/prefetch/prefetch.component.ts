import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import {
  QueryState,
  provideQueryState,
  QueryStateTemplateModule,
} from 'query-state';
import { JsonPlaceHolderService } from './jsonplaceholder.service';

// Parent
@Component({
  selector: 'query-state-prefetch-parent',
  template: `
    <div>
      <br />
      <br />
      pre-fetch this conditional child component
      <button (click)="show = true">show</button>

      <hr />

      <div *ngIf="show">
        <query-state-prefetch-child></query-state-prefetch-child>
      </div>
    </div>
  `,
})
export class PrefetchParentComponent {
  show = false;
}

// Child
@Component({
  selector: 'query-state-prefetch-child',
  template: ` <query-state-template [queryState]="queryState.data$">
    <ng-template
      [qsIdle]="queryState.data$"
      let-users
      let-revalidating="revalidating"
    >
      <pre>{{ users | json }}</pre>
    </ng-template>
  </query-state-template>`,
  providers: provideQueryState(JsonPlaceHolderService, {
    name: PrefetchChildComponent.name,
    prefetch: true,
  }),
})
export class PrefetchChildComponent {
  constructor(public readonly queryState: QueryState<{ name: string }>) {}
}

@NgModule({
  imports: [CommonModule, QueryStateTemplateModule],
  declarations: [PrefetchParentComponent, PrefetchChildComponent],
})
export class PrefetchComponentModule {}
