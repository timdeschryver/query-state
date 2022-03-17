import { Component } from '@angular/core';

@Component({
  selector: 'query-state-root',
  template: `
    <a routerLink="">Home</a> |
    <a routerLink="search" [queryParams]="{ username: 'timdeschryver' }">
      Search</a
    >
    | <a routerLink="/detail/1">Detail 1</a> |
    <a routerLink="/detail/2">Detail 2</a> |
    <a routerLink="/detail/3">Detail 3</a> |
    <a routerLink="/detail/4">Detail 4</a> |
    <a routerLink="/parent">Parent - Detail</a> |

    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
