import { TestScheduler } from 'rxjs/testing';
import { echo } from './operators';

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

    const expected = '-a 59999ms a 59999ms a|';

    expectObservable(e1.pipe(echo())).toBe(expected);
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
    const expected = '-a----a----a--| ';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: 5,
        })
      )
    ).toBe(expected);
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
    const expected = '-a--b----b----c-|';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: 5,
        })
      )
    ).toBe(expected);
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
    const expected = '-a---| ';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: false,
        })
      )
    ).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});

it('restart echoes on event', () => {
  testScheduler().run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 = hot('   -a-----| ');
    const _evts = hot('----e--| ').subscribe(() => {
      window.dispatchEvent(new Event('focus'));
    });
    // prettier-ignore
    const e1subs = [
      '                 ^------!',
      '                 -^-----!',
    ];
    const expected = ' -a--a--| ';

    expectObservable(
      e1.pipe(
        echo({
          timerTrigger: 5,
        })
      )
    ).toBe(expected);
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
    const expected = ' -a--a--a-a--| ';

    expectObservable(e1.pipe(echo())).toBe(expected);
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
    const expected = ' -a-------| ';

    expectObservable(
      e1.pipe(
        echo({
          focusTrigger: false,
        })
      )
    ).toBe(expected);
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
    const expected = ' -a--a--a-a--| ';

    expectObservable(e1.pipe(echo())).toBe(expected);
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
    const expected = ' -a-------| ';

    expectObservable(
      e1.pipe(
        echo({
          onlineTrigger: false,
        })
      )
    ).toBe(expected);
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
    const expected = '-a--a----a--| ';

    expectObservable(
      e1.pipe(
        echo({
          triggers: () => [evts],
        })
      )
    ).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
