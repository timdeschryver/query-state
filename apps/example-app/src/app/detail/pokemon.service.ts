import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ComponentDataService, QueryParams } from 'component-data';

@Injectable({
  providedIn: 'root',
})
export class PokemonService implements ComponentDataService {
  constructor(private http: HttpClient) {}
  query({ params }: QueryParams): Observable<any> {
    return this.http
      .get(`https://pokeapi.co/api/v2/pokemon/${params.id}`)
      .pipe(delay(800));
  }
}
