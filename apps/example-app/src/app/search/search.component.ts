import {AsyncPipe, JsonPipe} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, map} from 'rxjs';
import {
  QueryStateTemplateComponent,
  IdleQueryStateTemplateDirective,
  injectQueryState, LoadingQueryStateTemplateDirective, ErrorQueryStateTemplateDirective,
} from 'query-state';
import {GitHubUser} from "./github.service";

@Component({
  selector: 'query-state-search',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    QueryStateTemplateComponent,
    IdleQueryStateTemplateDirective,
    LoadingQueryStateTemplateDirective,
    ErrorQueryStateTemplateDirective,
    ReactiveFormsModule
  ],
  template: `
    <form>
      <input type="text" name="username" [formControl]="search"/>
    </form>

    <button (click)="queryState.revalidate()">Refresh</button>
    <query-state-template [queryState]="queryState.data">
      <ng-template qsLoading let-retries>
        🔎 Searching for GitHub users
        {{ retries ? '( retrying ' + retries + ' )' : '' }}
      </ng-template>

      <ng-template qsError let-error let-retries="retries">
        👀 Something is broken - call for help
        {{ retries ? '( retrying ' + retries + ' )' : '' }}
        <pre>{{ error | json }}</pre>
      </ng-template>

      <ng-template
        [qsIdle]="queryState.data$"
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
})
export class SearchComponent implements OnInit {
  queryState = injectQueryState<GitHubUser>();
  search = new FormControl<string>(this.queryState.queryParams.username ?? '');

  ngOnInit(): void {
    this.queryState.updateQueryParams(
      this.search.valueChanges.pipe(
        debounceTime(500),
        map(username => ({username})),
      ));
  }
}
