import { Type, Provider } from '@angular/core';
import { ComponentData } from './component-data';
import { COMPONENT_DATA_CONFIG, ComponentDataConfig } from './data-config';
import { COMPONENT_DATA_SERVICE, ComponentDataService } from './data-service';

export const provideComponentData = <Data>(
  service: Type<ComponentDataService<Data>>,
  config: ComponentDataConfig
): Provider[] => [
  ComponentData,
  {
    provide: COMPONENT_DATA_SERVICE,
    useExisting: service,
  },

  {
    provide: COMPONENT_DATA_CONFIG,
    useValue: config,
  },
];
