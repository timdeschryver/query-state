import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ComponentData, provideComponentData, tapState } from 'component-data';
import { RequestStateTemplateModule } from 'request-state';
import { DataService } from './data.service';
import { Person } from './models';

@Component({
  selector: 'component-data-child',
  template: `
    <request-state-template [requestState]="data.data$">
      <ng-template
        [rsIdleRequestState]="data.data"
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
    </request-state-template>

    <a routerLink="/parent">Back</a>
  `,
  providers: provideComponentData(DataService, {
    name: ChildComponent.name,
    disableCache: true,
    revalidateTriggers: false,
  }),
})
export class ChildComponent implements OnDestroy {
  model = {
    id: '',
    firstname: '',
    lastname: '',
  };

  private sub = this.data.data$
    .pipe(
      tapState({
        onSuccess: (person) => {
          this.model.id = person.id;
          this.model.firstname = person.firstname;
          this.model.lastname = person.lastname;
        },
      })
    )
    .subscribe();

  constructor(
    public readonly data: ComponentData<Person, DataService>,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  submit(): void {
    this.data.service
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
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RequestStateTemplateModule,
  ],
})
export class ChildComponentModule {}
