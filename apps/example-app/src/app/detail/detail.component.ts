import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import {
  QueryState,
  provideQueryState,
  QueryStateTemplateModule,
} from 'query-state';
import { PokemonService } from './pokemon.service';

@Component({
  selector: 'query-state-detail',
  template: ` <query-state-template [queryState]="queryState.data$">
    <ng-template
      [qsIdle]="queryState.data$"
      let-detail
      let-revalidating="revalidating"
    >
      <pre>{{ detail | json }}</pre>
    </ng-template>
  </query-state-template>`,
  providers: provideQueryState(PokemonService, {
    name: DetailComponent.name,
    cacheTime: 5_000,
  }),
})
export class DetailComponent {
  constructor(public readonly queryState: QueryState<{ name: string }>) {}
}

@NgModule({
  imports: [CommonModule, QueryStateTemplateModule],
  declarations: [DetailComponent],
})
export class DetailComponentModule {}
