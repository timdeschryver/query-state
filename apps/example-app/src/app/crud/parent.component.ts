import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentData, provideComponentData } from 'component-data';
import { RequestStateTemplateModule } from 'request-state';
import { DataService } from './data.service';
import { Person } from './models';

@Component({
  selector: 'component-data-parent',
  template: `
    <request-state-template [requestState]="data.data$">
      <ng-template
        [rsIdleRequestState]="data.data"
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
    </request-state-template>

    <router-outlet (deactivate)="data.revalidate()"></router-outlet>
  `,
  providers: provideComponentData(DataService, {
    name: ParentComponent.name,
  }),
})
export class ParentComponent {
  constructor(public readonly data: ComponentData<Person[]>) {}
}

@NgModule({
  declarations: [ParentComponent],
  imports: [CommonModule, RouterModule, RequestStateTemplateModule],
})
export class ParentComponentModule {}
