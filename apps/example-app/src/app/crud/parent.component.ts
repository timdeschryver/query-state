import { Component } from '@angular/core';
import {
  IdleQueryStateTemplateDirective,
  injectQueryState,
  QueryStateTemplateComponent,
} from 'query-state';
import { RouterModule } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { Person } from './models';

@Component({
  selector: 'query-state-parent',
  standalone: true,
  imports: [
    QueryStateTemplateComponent,
    IdleQueryStateTemplateDirective,
    RouterModule,
    NgForOf,
    NgIf,
  ],
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdle]="queryState.data$"
        let-persons
        let-revalidating="revalidating"
      >
        <div *ngFor="let person of persons">
          <a [routerLink]="[person.id]"
            >{{ person.firstname }} {{ person.lastname }}</a
          >
        </div>

        {{ revalidating ? '...' : '' }}
      </ng-template>
    </query-state-template>

    <router-outlet (deactivate)="queryState.revalidate()"></router-outlet>
  `,
})
export class ParentComponent {
  queryState = injectQueryState<Person[]>();
}
