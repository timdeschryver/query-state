import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgModule, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { QueryState, provideQueryState } from 'query-state';
import { QueryStateTemplateModule } from 'query-state-template';
import { GitHubService } from './github.service';

@Component({
  selector: 'query-state-search',
  template: `
    <form>
      <input type="text" name="username" [ngModel]="username" required />
    </form>
    <button (click)="refreshTrigger.next()">Refresh</button>
    <query-state-template [queryState]="queryState.data">
      <ng-template qsLoadingQueryState let-retries>
        🔎 Searching for GitHub users
        {{ retries ? '( retrying ' + retries + ' )' : '' }}
      </ng-template>

      <ng-template qsErrorQueryState let-error>
        👀 Something is broken - call for help
        <pre>{{ error | json }}</pre>
      </ng-template>

      <ng-template
        [qsIdleQueryState]="queryState.data"
        let-user
        let-revalidating="revalidating"
      >
        <div [hidden]="!revalidating">
          Refreshing results in the background...
        </div>
        <pre>{{ user | json }}</pre>
      </ng-template>
    </query-state-template>
  `,
  providers: provideQueryState(GitHubService, {
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
  username = this.queryState.queryParams.username || '';
  refreshTrigger = new Subject<void>();

  constructor(readonly queryState: QueryState<{ username: string }>) {}

  ngAfterViewInit() {
    if (this.form.valueChanges) {
      this.queryState.update(this.form.valueChanges.pipe(debounceTime(500)));
      this.queryState.revalidate(this.refreshTrigger);
    }
  }
}

@NgModule({
  imports: [CommonModule, FormsModule, QueryStateTemplateModule],
  declarations: [SearchComponent],
})
export class SearchComponentModule {}
