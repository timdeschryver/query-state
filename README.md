# Query State

Simple and configurable query helpers.

```ts
@Component({
  selector: 'query-state-detail',
  template: `
    <query-state-template [queryState]="queryState.data$">
      <ng-template
        [qsIdle]="queryState.data$"
        let-detail
        let-revalidating="revalidating"
      >
        <pre>{{ detail | json }}</pre>
      </ng-template>
    </query-state-template>
  `,
  imports: [JsonPipe, AsyncPipe, QueryStateTemplateComponent],
  standalone: true,
})
export class DetailComponent {
  queryState = injectQueryState();
}
```

## query-state

> Helpers to automatically fetch and revalidate query data.
> Template helpers to show the query state and response.

### Includes

- [x] Caching
- [x] Request state
- [x] Retries (with configuration)
- [x] Revalidate on interval, focus, online detection
- [x] Configurable default templates

### Docs

- [Examples](./apps/example-app/src/app)
- [API Docs](./docs/api/index.md)

### Todo

- [ ] Prefetch
- [ ] BroadcastChannel
