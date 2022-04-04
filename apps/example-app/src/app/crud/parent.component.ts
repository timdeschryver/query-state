import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  QueryState,
  provideQueryState,
  QueryStateTemplateModule,
} from 'query-state';
import { DataService } from './data.service';
import { Person } from './models';

@Component({
  selector: 'query-state-parent',
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdle]="queryState.data"
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
  providers: provideQueryState(DataService, {
    name: ParentComponent.name,
  }),
})
export class ParentComponent {
  constructor(public readonly queryState: QueryState<Person[]>) {}
}

@NgModule({
  declarations: [ParentComponent],
  imports: [CommonModule, RouterModule, QueryStateTemplateModule],
})
export class ParentComponentModule {}
