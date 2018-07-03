const isNothing = x =>
  x === null || x === undefined;

const fromNullable = x =>
  isNothing(x) ? Left(null) : Right(x)

const head = x => x[0];
const tail = x => x[x.length - 1]

/*
 * Compose takes in functions `f` and `g`, piping `x` through those.
 */
const compose =
  (f, g) =>
    (x) =>
      f(g(x))

/*
 * Wrap the hideous try..catch to use Right and Left identity
 */
const tryCatch = f => {
  try {
    return Right(f())
  } catch (e) {
    return Left(e)
  }
}

// Right box maps over the given function and value
const Right = x =>
({
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (_, g) => g(x),
  inspect: () => `Right(f(${x}))`
})

// Left box takes the argument and does not map over it,
// it just returns itself.
const Left = x =>
({
  chain: f => Left(x),
  map: f => Left(x),
  fold: (f, _) => f(x),
  inspect: () => `Left(${x})`
})

//
// Semigroup's
// Our law says we should satisfy the laws of the associativity rule.
//
const Sum = x =>
({
  x,
  concat: ({x: y}) => Sum(x + y),
  inspect: `Sum(${x})`,
  valueOf: () => x
})
Sum.empty = () => Sum(0)

const All = x =>
({
  x,
  concat: ({x: y}) => All(x && y),
  inspect: `All(${x})`,
  valueOf: () => x
})
All.empty = () => All(true)

// We don't know the neutral value of "First"!
const First = x =>
({
  x,
  concat: _ => First(x),
  inspect: `First(${x})`,
  valueOf: () => x
})

const Maybe = x =>
({
  x,
  map: f => isNothing(x) ? Maybe(null) : Maybe(f(x)),
  valueOf: () => x
})

const Throw = e => { throw new Error(e) }

module.exports = {
  isNothing,
  fromNullable,
  tryCatch,
  Right,
  Left,
  Sum,
  All,
  First,
  Maybe,
  Throw
}
