import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { ComponentDataService } from 'component-data';

@Injectable({
  providedIn: 'root',
})
export class PokemonService implements ComponentDataService<any> {
  constructor(private http: HttpClient) {}

  query({ id }: { id: number }): Observable<any> {
    return this.http
      .get(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .pipe(delay(800));
  }
}
