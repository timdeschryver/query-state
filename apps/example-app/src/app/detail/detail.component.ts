import { Component } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  IdleQueryStateTemplateDirective,
  injectQueryState,
  QUERY_STATE_ERROR_COMPONENT,
  QUERY_STATE_LOADING_COMPONENT,
  QueryStateTemplateComponent,
} from 'query-state';
import { CustomLoadingComponent } from '../defaults/custom-loading.component';
import { CustomErrorComponent } from '../defaults/custom-error.component';

@Component({
  selector: 'query-state-detail',
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdle]="queryState.data$"
        let-detail
        let-revalidating="revalidating"
      >
        <pre>{{ detail | json }}</pre>
      </ng-template>
    </query-state-template>
  `,
  imports: [
    JsonPipe,
    AsyncPipe,
    QueryStateTemplateComponent,
    IdleQueryStateTemplateDirective,
  ],
  providers: [
    {
      provide: QUERY_STATE_LOADING_COMPONENT,
      useValue: CustomLoadingComponent,
    },
    {
      provide: QUERY_STATE_ERROR_COMPONENT,
      useValue: CustomErrorComponent,
    },
  ],
  standalone: true,
})
export class DetailComponent {
  queryState = injectQueryState();
}
