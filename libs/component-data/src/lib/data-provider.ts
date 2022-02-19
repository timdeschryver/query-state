import { Type, Provider } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentData } from './component-data';
import { ComponentRoute } from './component-route';
import { ComponentDataConfig, COMPONENT_DATA_CONFIG } from './data-config';
import { ComponentDataService, COMPONENT_DATA_SERVICE } from './data-service';

export function componentRoute(route: ActivatedRoute, router: Router) {
  return new ComponentRoute(route, router);
}

export const provideComponentData = <Data>(
  service: Type<ComponentDataService<Data>>,
  config: ComponentDataConfig
): Provider[] => [
  ComponentData,
  {
    provide: ComponentRoute,
    useFactory: componentRoute,
    deps: [ActivatedRoute, Router],
  },
  {
    provide: COMPONENT_DATA_SERVICE,
    useExisting: service,
  },
  {
    provide: COMPONENT_DATA_CONFIG,
    useValue: config,
  },
];
