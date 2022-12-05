import {enableProdMode, inject} from '@angular/core';

import {environment} from './environments/environment';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter} from '@angular/router';
import {PokemonService} from './app/detail/pokemon.service';
import {provideHttpClient} from '@angular/common/http';
import {
  provideQueryState,
  QUERY_STATE_ERROR_COMPONENT,
  QUERY_STATE_LOADING_COMPONENT,
  resolveQueryState
} from 'query-state';
import {GitHubService, GitHubUser} from './app/search/github.service';
import {DataService} from './app/crud/data.service';
import {CustomLoadingComponent} from "./app/defaults/custom-loading.component";
import {CustomErrorComponent} from "./app/defaults/custom-error.component";

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),

    {
      provide: QUERY_STATE_LOADING_COMPONENT,
      useValue: CustomLoadingComponent,
    },
    {
      provide: QUERY_STATE_ERROR_COMPONENT,
      useValue: CustomErrorComponent,
    },
    provideRouter([
      {
        path: 'search',
        loadComponent: () => import('./app/search/search.component').then((m) => m.SearchComponent),
        providers: [
          provideQueryState<GitHubUser>({
            query: () => {
              const service = inject(GitHubService);
              return (_, queryParams) => {
                return service.search(queryParams.username);
              };
            },
            cacheKey: (params, queryParams) =>
              `search-${queryParams.username?.toLowerCase()}`,
          }),
        ],
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./app/detail/detail.component').then(
            (m) => m.DetailComponent
          ),
        providers: [
          provideQueryState({
            query: () => {
              const service = inject(PokemonService);
              return (params) => service.getPokemon(params.id);
            },
            cacheKey: (params, _queryParams) => `details-${params.id}`,
          }),
        ],
        // canActivate: [activateQueryState],
      },
      {
        path: 'parent',
        loadComponent: () =>
          import('./app/crud/parent.component').then((m) => m.ParentComponent),
        providers: [
          provideQueryState({
            query: () => {
              const service = inject(DataService);
              return () => service.getAll();
            },
            cacheKey: () => `parent`,
          }),
        ],
        // canActivate: [activateQueryState],
        children: [
          {
            path: ':personId',
            loadComponent: () =>
              import('./app/crud/child.component').then(
                (m) => m.ChildComponent
              ),
            providers: [
              provideQueryState({
                query: () => {
                  const service = inject(DataService);
                  return (params) => service.get(params.personId);
                },
                cacheKey: (params, _queryParams) => `child`,
              }),
            ],
            resolve: [resolveQueryState],
          },
        ],
      },
    ]),
  ],
});
