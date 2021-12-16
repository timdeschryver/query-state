import { Component } from '@angular/core';
import { ComponentData, provideComponentData } from 'component-data';

import { PokemonService } from './pokemon.service';

@Component({
  selector: 'component-data-nx-detail',
  template: ` <pre>{{ data.data$ | async | json }}</pre> `,
  providers: provideComponentData(PokemonService, {
    name: DetailComponent.name,
  }),
})
export class DetailComponent {
  constructor(public readonly data: ComponentData<{ name: string }>) {}
}
