import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  QUERY_STATE_ERROR_COMPONENT,
  QUERY_STATE_LOADING_COMPONENT,
} from 'query-state';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponentModule } from './search/search.component';
import { DetailComponentModule } from './detail/detail.component';
import {
  CustomLoadingComponent,
  CustomLoadingComponentModule,
} from './defaults/custom-loading.component';
import {
  CustomErrorComponent,
  CustomErrorComponentModule,
} from './defaults/custom-error.component';
import { ParentComponentModule } from './crud/parent.component';
import { ChildComponentModule } from './crud/child.component';
import { PrefetchComponentModule } from './prefetch/prefetch.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,

    CustomLoadingComponentModule,
    CustomErrorComponentModule,

    SearchComponentModule,
    DetailComponentModule,
    PrefetchComponentModule,

    ParentComponentModule,
    ChildComponentModule,
  ],
  providers: [
    {
      provide: QUERY_STATE_LOADING_COMPONENT,
      useValue: CustomLoadingComponent,
    },
    {
      provide: QUERY_STATE_ERROR_COMPONENT,
      useValue: CustomErrorComponent,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
