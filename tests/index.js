import _ from 'ramda'
import test from 'ava'

import {
  isNothing,
  fromNullable,
  tryCatch,

  All,
  First,
  Throw,
  Left,
  Right,
  Sum,
  Maybe
} from '../src'

test('isNothing', t => {
  t.is(isNothing(undefined), true)
  t.is(isNothing(null), true)

  t.is(isNothing(true), false)
  t.is(isNothing(false), false)
  t.is(isNothing(''), false)
})

test('fromNullable', t => {
  // Should return the given value
  t.is(fromNullable(0).inspect(), `Right(f(0))`)
  t.is(fromNullable(false).inspect(), `Right(f(false))`)
  t.is(fromNullable('nya ha ha').inspect(), `Right(f(nya ha ha))`)
  t.is(fromNullable('').inspect(), `Right(f())`)

  // These should always return null
  t.is(fromNullable(null).inspect(), `Left(null)`)
  t.is(fromNullable(undefined).inspect(), `Left(null)`)
})

test('tryCatch', t => {
  tryCatch(() => 'komposti')
    .fold(e => t.fail(),
          c => t.is(c, 'komposti'))

  tryCatch(() => Throw('oh noes'))
    .fold(e => t.deepEqual(e, new Error('oh noes')),
          c => t.fail())
})

test('Left', t => {
  Left('foo')
  .fold(
    x => t.deepEqual(x, 'foo'))

  Left(Left('foo'))
  .fold(
    e => t.is(e.inspect(), 'Left(foo)'), t.fail)

  Left(Right('foo'))
  .fold(
    x => t.is(x.inspect(), 'Right(f(foo))', t.fail))
})

// Left never executes f(), only returns itself
test('Left.map', t => {
  t.is(
    'Left(() => 1 + 1)',
    Left(() => 1 + 1).map().inspect()
  )
  Left(() => Left(123))
    .map()
    .fold(e => t.is(e().inspect(), 'Left(123)'))
})

test('Right', t => {
  Right('foo')
  .fold(t.fail,
    x => t.deepEqual(x, 'foo'))

  Right(Right('foo'))
  .fold(t.fail,
    e => t.is(e.inspect(), 'Right(f(foo))'))

  Right(Right('foo'))
  .fold(t.fail,
    x => t.is(x.inspect(), 'Right(f(foo))'))

  Right(Left('foo'))
  .fold(t.fail,
    x => t.is(x.inspect(), 'Left(foo)'))
})

// Right always executes f()
test('Right.map', t => {
  Right(() => 1 + 2 + 3).map(x => t.is(x(), 6))
})

test('Maybe', t => {
  t.deepEqual(Maybe('John Carpenter').map(_.match(/e/ig)).valueOf(), ['e', 'e'])
  t.deepEqual(Maybe(null).map(_.match(/e/ig)).valueOf(), null)
  t.deepEqual(Maybe('a').map(_.match(/b/ig)).valueOf(), [])
})

// has no neutral identity, so can't be a monoid
test('semi group: first', t => {
  t.is('fizz', First('fizz').concat(First('buzz')).valueOf())
})

// Sum(x).concat(Sum(y)) -> Sum(x + y)
test('monoid + semi group: Sum', t => {
  // neutral identity
  t.is(0, Sum.empty().valueOf())

  t.is(
    6,
    Sum(1).concat(Sum(2)).concat(Sum(3)).valueOf())
})

// All(false) && All(true) -> All(false)
test('monoid + semi group: All', t => {
  // neutral identity
  t.is(true, All.empty().valueOf())

  t.is(
    false,
    All(false).concat(All(true)).valueOf()
  )

  t.is(
    false,
    All(true).concat(All(false).concat(All(true))).valueOf()
  )
})

test('Examples', t => {
  const getEmail = order =>
    fromNullable(order.deliveryAddress)
    .chain(address => fromNullable(address.client))
    .map(u => u.email)
    .fold(e => 'no email', n => n)

  const cats = 'cats@example.org';

  t.is(cats, getEmail({
    deliveryAddress: {
      client: {
        email: cats
      }
    }
  }))

  t.is('no email', getEmail({
    deliveryAddress: null
  }))
})
