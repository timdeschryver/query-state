import { TestScheduler } from 'rxjs/testing';
import { echo } from './echo';

const testScheduler = () =>
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

it('echoes the value via timer', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('-a 120000ms |');
    // prettier-ignore
    const e1subs = [
      '              ^- 120000ms ! ',
      '              -^- 119999ms !'
    ];

    const expected = '-i 59999ms t 59999ms t|';

    expectObservable(e1.pipe(echo())).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
      t: {
        trigger: 'timer',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('configures echoes via timer', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('  -a------------| ');
    // prettier-ignore
    const e1subs = [
      '                ^-------------!',
      '                -^------------!'
    ];
    const expected = '-i----t----t--| ';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: 5,
        })
      )
    ).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
      t: {
        trigger: 'timer',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('echoes multiple values via timer and switches to latest', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('  -a--b---------c-|');
    // prettier-ignore
    const e1subs = [
      '                ^---------------!',
      '                -^--!',
      '                ----^---------!',
      '                --------------^-!',
    ];
    const expected = '-a--b----B----c-|';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: 5,
        })
      )
    ).toBe(expected, {
      a: {
        trigger: 'init',
        value: 'a',
      },
      b: {
        trigger: 'init',
        value: 'b',
      },
      B: {
        trigger: 'timer',
        value: 'b',
      },
      c: {
        trigger: 'init',
        value: 'c',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('disables echoes of values via timer', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('  -a---| ');
    // prettier-ignore
    const e1subs = [
      '                ^----!',
      '                -^---!'
    ];
    const expected = '-i---| ';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: false,
        })
      )
    ).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('echoes the value via focus', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('   -a----------| ');
    const _evts = hot('----e--e-e--| ').subscribe(() => {
      window.dispatchEvent(new Event('focus'));
    });
    // prettier-ignore
    const e1subs = [
      '                 ^-----------!',
      '                 -^----------!'];
    const expected = ' -i--f--f-f--| ';

    expectObservable(e1.pipe(echo())).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
      f: {
        trigger: 'focus',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('disables echoes the value via focus', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('   -a-------| ');
    const _evts = hot('----e----| ').subscribe(() => {
      window.dispatchEvent(new Event('focus'));
    });
    // prettier-ignore
    const e1subs = [
          '             ^--------!',
          '             -^-------!'
    ];
    const expected = ' -i-------| ';

    expectObservable(
      e1.pipe(
        echo({
          focusTrigger: false,
        })
      )
    ).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('echoes the value via online', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('   -a----------| ');
    const _evts = hot('----e--e-e--| ').subscribe(() => {
      window.dispatchEvent(new Event('online'));
    });
    // prettier-ignore
    const e1subs = [
      '                 ^-----------!',
      '                 -^----------!'];
    const expected = ' -i--o--o-o--| ';

    expectObservable(e1.pipe(echo())).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
      o: {
        trigger: 'online',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('disables echoes the value via online', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('   -a-------| ');
    const _evts = hot('----e----| ').subscribe(() => {
      window.dispatchEvent(new Event('online'));
    });
    // prettier-ignore
    const e1subs = [
      '                 ^--------!',
      '                 -^-------!'
    ];
    const expected = ' -i-------| ';

    expectObservable(
      e1.pipe(
        echo({
          onlineTrigger: false,
        })
      )
    ).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('echoes can be triggered by custom events', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('  -a----------| ');
    const evts = hot('----e----e--| ');
    // prettier-ignore
    const e1subs = [
      '                ^-----------!',
      '                -^----------!',
    ];
    const expected = '-i--c----c--| ';

    expectObservable(
      e1.pipe(
        echo({
          triggers: () => [evts],
        })
      )
    ).toBe(expected, {
      i: {
        trigger: 'init',
        value: 'a',
      },
      c: {
        trigger: 'e',
        value: 'a',
      },
    });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
