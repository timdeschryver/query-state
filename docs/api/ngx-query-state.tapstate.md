<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ngx-query-state](./ngx-query-state.md) &gt; [tapState](./ngx-query-state.tapstate.md)

## tapState() function

<b>Signature:</b>

```typescript
export declare function tapState<Result>(callbacks: {
    onError?: (error: unknown) => void;
    onIdle?: () => void;
    onLoading?: () => void;
    onRevalidate?: () => void;
    onSuccess?: (data: Result) => void;
}): MonoTypeOperatorFunction<QueryStateData<Result>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  callbacks | { onError?: (error: unknown) =&gt; void; onIdle?: () =&gt; void; onLoading?: () =&gt; void; onRevalidate?: () =&gt; void; onSuccess?: (data: Result) =&gt; void; } |  |

<b>Returns:</b>

MonoTypeOperatorFunction&lt;[QueryStateData](./ngx-query-state.querystatedata.md)<!-- -->&lt;Result&gt;&gt;

