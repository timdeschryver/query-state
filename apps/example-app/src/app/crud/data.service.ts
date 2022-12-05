import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of, tap } from 'rxjs';
import { Person } from './models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private persons = new BehaviorSubject<Person[]>([
    { id: 'er', firstname: 'Ellen', lastname: 'Riley' },
    { id: 'jb', firstname: 'Jaxon', lastname: 'Brigstocke' },
    { id: 'bs', firstname: 'Bethany', lastname: 'Stuart' },
    { id: 'mr', firstname: 'Mikayla', lastname: 'Rosenstengel' },
  ]);

  getAll(): Observable<Person[]> {
    return this.persons.pipe(
      tap((persons) => console.log('getAll', persons)),
      delay(5_000)
    );
  }

  get(personId: string): Observable<Person> {
    return this.persons.pipe(
      map((persons) => persons.find((p) => p.id === personId)),
      map((person) => {
        if (!person) {
          throw Error(`Person not found with id ${personId}`);
        }

        return person;
      }),
      tap((person) => console.log('get', person)),
      delay(1_000)
    );
  }

  update(person: Person): Observable<void> {
    return of(
      this.persons.next(
        this.persons.value.map((p) => (p.id === person.id ? person : p))
      )
    );
  }
}
