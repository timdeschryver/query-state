import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { QueryService, QueryParams } from 'query-state';

@Injectable({
  providedIn: 'root',
})
export class JsonPlaceHolderService implements QueryService {
  constructor(private http: HttpClient) {}

  query({ params }: QueryParams): Observable<any> {
    return this.http
      .get(`https://jsonplaceholder.typicode.com/users`, params)
      .pipe(delay(800));
  }
}

// @Injectable({
//   providedIn: 'root',
// })
// export class JsonPlaceHolderResolver implements Resolve<any> {
//   constructor(
//     private jsonPlaceHolderService: JsonPlaceHolderService // private readonly queryState: QueryState<{ name: string }>
//   ) {
//     console.log('in resolver');
//   }

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//     // console.log('???', route, state);
//     return this.jsonPlaceHolderService.query({
//       params: {},
//       queryParams: {},
//     });
//   }
// }
