import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { QueryService, QueryParams } from 'query-state';

@Injectable({
  providedIn: 'root',
})
export class PokemonService implements QueryService {
  constructor(private http: HttpClient) {}
  query({ params }: QueryParams): Observable<any> {
    return this.http
      .get(`https://pokeapi.co/api/v2/pokemon/${params.id}`)
      .pipe(delay(800));
  }
}
