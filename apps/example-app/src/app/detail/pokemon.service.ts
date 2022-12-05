import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService  {
  constructor(private http: HttpClient) {}
  getPokemon(pokemonId: number): Observable<any> {
    return this.http
      .get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      .pipe(delay(800));
  }
}
