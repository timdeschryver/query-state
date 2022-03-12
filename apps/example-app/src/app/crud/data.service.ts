import { Injectable } from '@angular/core';
import { ComponentDataService, QueryParams } from 'component-data';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import { Person } from './models';

@Injectable({
  providedIn: 'root',
})
export class DataService implements ComponentDataService {
  private persons = new BehaviorSubject<Person[]>([
    { id: 'er', firstname: 'Ellen', lastname: 'Riley' },
    { id: 'jb', firstname: 'Jaxon', lastname: 'Brigstocke' },
    { id: 'bs', firstname: 'Bethany', lastname: 'Stuart' },
    { id: 'mr', firstname: 'Mikayla', lastname: 'Rosenstengel' },
  ]);

  query(): Observable<Person[]> {
    return this.persons.pipe(delay(1000));
  }

  queryOne(params: QueryParams): Observable<Person> {
    const id = params.params['personId'];
    return this.persons.pipe(
      map((persons) => persons.find((p) => p.id === id)),
      map((person) => {
        if (!person) {
          throw Error(`Person not found with id ${id}`);
        }

        return person;
      }),
      delay(1000)
    );
  }

  update(person: Person) {
    return of(
      this.persons.next(
        this.persons.value.map((p) => (p.id === person.id ? person : p))
      )
    );
  }
}
