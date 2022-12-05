import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GitHubService  {
  constructor(private http: HttpClient) {}

  search(username:string): Observable<GitHubUser> {
    return this.http
      .get<{ username: string }>(
        `https://api.github.com/users/${username}`
      )
      .pipe(delay(800));
  }
}

export interface GitHubUser {
  username: string;
}
