import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChildComponent } from './crud/child.component';
import { ParentComponent } from './crud/parent.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { PrefetchParentComponent } from './prefetch/prefetch.component';

const routes: Routes = [
  {
    path: 'search',
    component: SearchComponent,
  },
  {
    path: 'detail/:id',
    component: DetailComponent,
    // resolve: { pageData: JsonPlaceHolderResolver },
  },
  {
    path: 'prefetch',
    component: PrefetchParentComponent,
  },
  {
    path: 'parent',
    component: ParentComponent,
    children: [
      {
        path: ':personId',
        component: ChildComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
