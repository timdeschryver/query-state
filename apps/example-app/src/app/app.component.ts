import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PokemonService } from './detail/pokemon.service';

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
  standalone: true,
  providers: [PokemonService],
  imports: [RouterModule, JsonPipe, AsyncPipe, HttpClientModule],
})
export class AppComponent {}
