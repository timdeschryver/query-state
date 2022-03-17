# Query State

Simple and configurable query helpers.

```ts
@Component({
  selector: 'app-detail',
  template: `<query-state-template [queryState]="queryState.data$">
    <ng-template [qsIdleQueryState]="queryState.data" let-detail>
      <h2>Hello {{ detail.name }}</h2>
    </ng-template>
  </query-state-template>`,
  providers: provideQueryState(DetailService, {
    name: DetailComponent.name,
  }),
})
export class DetailComponent {
  constructor(public readonly queryState: QueryState<{ name: string }>) {}
}
```

## query-state

> Helpers to automatically fetch and revalidate query data.

## query-state-template

> Template helper to show the query state and response.
