# Component Data

Simple and configurable request helpers.

```ts
@Component({
  selector: 'app-detail',
  template: `<request-state-template [requestState]="data.data$">
    <ng-template [rsIdleRequestState]="data.data" let-detail>
      <h2>Hello {{ detail.name }}</h2>
    </ng-template>
  </request-state-template>`,
  providers: provideComponentData(DetailService, {
    name: DetailComponent.name,
  }),
})
export class DetailComponent {
  constructor(public readonly data: ComponentData<{ name: string }>) {}
}
```

## component-data

> Helpers to automatically fetch and revalidate data.

## request-state

> Template helper to show the request state and response.
