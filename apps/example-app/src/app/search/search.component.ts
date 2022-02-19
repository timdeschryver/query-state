import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgModule, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ComponentData, provideComponentData } from 'component-data';
import { RequestStateTemplateModule } from 'request-state';
import { GitHubService } from './github.service';

@Component({
  selector: 'component-data-nx-search',
  template: `
    <form>
      <input type="text" name="username" [ngModel]="username" required />
    </form>
    <button (click)="refreshTrigger.next()">Refresh</button>
    <request-state-template [requestState]="data.data">
      <ng-template rsRequestState="loading">
        🔎 Searching for GitHub users...
      </ng-template>

      <ng-template
        rsRequestState="idle"
        let-data
        let-revalidating="revalidating"
      >
        <div [hidden]="!revalidating">
          Refreshing results in the background...
        </div>
        <pre>{{ data | json }}</pre>
      </ng-template>
    </request-state-template>
  `,
  providers: provideComponentData(GitHubService, {
    name: SearchComponent.name,
    disableInitialLoad: true,
    // only execute when username is not empty
    ignore: ({ queryParams }) => queryParams['username'] === '',
    cacheKey: ({ params: dataParams, queryParams }) =>
      JSON.stringify([dataParams, queryParams]).toLowerCase(),
  }),
})
export class SearchComponent implements AfterViewInit {
  @ViewChild(NgForm) form!: NgForm;
  username = this.data.queryParams.username || '';
  refreshTrigger = new Subject<void>();

  constructor(readonly data: ComponentData<{ username: string }>) {}

  ngAfterViewInit() {
    if (this.form.valueChanges) {
      this.data.update(this.form.valueChanges.pipe(debounceTime(500)));
      this.data.refresh(this.refreshTrigger);
    }
  }
}

@NgModule({
  imports: [CommonModule, FormsModule, RequestStateTemplateModule],
  declarations: [SearchComponent],
})
export class SearchComponentModule {}
