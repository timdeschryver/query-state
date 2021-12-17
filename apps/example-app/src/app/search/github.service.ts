import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ComponentDataService, QueryParams } from 'component-data';

@Injectable({
  providedIn: 'root',
})
export class GitHubService
  implements ComponentDataService<{ username: string }>
{
  constructor(private http: HttpClient) {}

  query({ queryParams }: QueryParams): Observable<{ username: string }> {
    return this.http
      .get<{ username: string }>(
        `https://api.github.com/users/${queryParams['username']}`
      )
      .pipe(delay(800));
  }
}
