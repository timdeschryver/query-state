import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ComponentData, provideComponentData } from 'component-data';

import { GitHubService } from './github.service';

@Component({
  selector: 'component-data-nx-search',
  template: `
    <form>
      <input type="text" name="username" [ngModel]="username" required />
    </form>
    <button (click)="refreshTrigger.next()">Refresh</button>
    <pre>{{ data.data | json }}</pre>
  `,
  providers: provideComponentData(GitHubService, {
    name: SearchComponent.name,
    disableInitialLoad: true,
    // only execute when username is not empty
    ignore: ({ queryParams }) => queryParams['username'] === '',
  }),
})
export class SearchComponent implements AfterViewInit {
  @ViewChild(NgForm) form!: NgForm;
  username = this.data.queryParams.username || '';
  refreshTrigger = new Subject<void>();

  constructor(readonly data: ComponentData<{ username: string }>) {}

  ngAfterViewInit() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.data.update(this.form.valueChanges!.pipe(debounceTime(500)));
    this.data.refresh(this.refreshTrigger);
  }
}
