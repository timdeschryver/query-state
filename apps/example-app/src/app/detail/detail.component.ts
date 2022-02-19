import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ComponentData, provideComponentData } from 'component-data';
import { RequestStateTemplateModule } from 'request-state';
import { PokemonService } from './pokemon.service';

@Component({
  selector: 'component-data-nx-detail',
  template: ` <request-state-template [requestState]="data.data$ | async">
    <ng-template rsRequestState="idle" let-data let-revalidating="revalidating">
      <pre>{{ data | json }}</pre>
    </ng-template>
  </request-state-template>`,
  providers: provideComponentData(PokemonService, {
    name: DetailComponent.name,
  }),
})
export class DetailComponent {
  constructor(public readonly data: ComponentData<{ name: string }>) {}
}

@NgModule({
  imports: [CommonModule, RequestStateTemplateModule],
  declarations: [DetailComponent],
})
export class DetailComponentModule {}
