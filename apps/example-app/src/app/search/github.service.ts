import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { delay, Observable } from 'rxjs';
import { ComponentDataService } from 'component-data';

@Injectable({
  providedIn: 'root',
})
export class GitHubService
  implements ComponentDataService<{ username: string }>
{
  constructor(private http: HttpClient) {}

  query(
    _params: Params,
    queryParams: Params
  ): Observable<{ username: string }> {
    return this.http
      .get<{ username: string }>(
        `https://api.github.com/users/${queryParams['username']}`
      )
      .pipe(delay(800));
  }
}
