import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  QueryState,
  provideQueryState,
  tapState,
  QueryStateTemplateModule,
} from 'query-state';
import { DataService } from './data.service';
import { Person } from './models';

@Component({
  selector: 'query-state-child',
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdleQueryState]="queryState.data"
        let-person
        let-revalidating="revalidating"
      >
        <ng-container *ngIf="person">
          <form>
            <input
              type="text"
              [(ngModel)]="model.firstname"
              name="firstname"
              required
            />
            <input
              type="text"
              [(ngModel)]="model.lastname"
              name="lastname"
              required
            />
            <button type="button" (click)="submit()">Save</button>
          </form>
        </ng-container>
      </ng-template>
    </query-state-template>

    <a routerLink="/parent">Back</a>
  `,
  providers: provideQueryState(DataService, {
    name: ChildComponent.name,
    query: 'queryOne',
    disableCache: true,
    revalidateTriggers: false,
  }),
})
export class ChildComponent implements OnInit {
  model = {
    id: '',
    firstname: '',
    lastname: '',
  };

  constructor(
    public readonly queryState: QueryState<Person, DataService>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.queryState.effect(
      this.queryState.data$.pipe(
        tapState({
          onSuccess: (person) => {
            this.model.id = person.id;
            this.model.firstname = person.firstname;
            this.model.lastname = person.lastname;
          },
        })
      )
    );
  }

  submit(): void {
    this.queryState.service
      .update({
        firstname: this.model.firstname,
        id: this.model.id,
        lastname: this.model.lastname,
      })
      .subscribe(() => {
        this.router.navigate(['/parent']);
      });
  }
}

@NgModule({
  declarations: [ChildComponent],
  imports: [CommonModule, FormsModule, RouterModule, QueryStateTemplateModule],
})
export class ChildComponentModule {}
