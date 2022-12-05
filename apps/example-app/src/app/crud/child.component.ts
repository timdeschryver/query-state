import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IdleQueryStateTemplateDirective,
  injectQueryState,
  QueryStateTemplateComponent,
  tapState,
} from 'query-state';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Person } from './models';
import { DataService } from './data.service';

@Component({
  selector: 'query-state-child',
  standalone: true,
  imports: [
    AsyncPipe,
    QueryStateTemplateComponent,
    IdleQueryStateTemplateDirective,
    FormsModule,
    NgIf,
  ],
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdle]="queryState.data$"
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
})
export class ChildComponent implements OnInit {
  service = inject(DataService);
  queryState = injectQueryState<Person>();

  model = {
    id: '',
    firstname: '',
    lastname: '',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.queryState.effect(
      this.queryState.data$.pipe(
        tapState({
          onSuccess: (person: any) => {
            this.model.id = person.id;
            this.model.firstname = person.firstname;
            this.model.lastname = person.lastname;
          },
        })
      )
    );
  }

  submit(): void {
    this.queryState.effect(
      this.service.update({
        firstname: this.model.firstname,
        id: this.model.id,
        lastname: this.model.lastname,
      }),
      () => this.router.navigate(['/parent'])
    );
  }
}
