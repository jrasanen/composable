const isNothing = x =>
  x === null || x === undefined

const fromNullable = x =>
  isNothing(x) ? Right(x) : Left(x)

const tryCatch = f => {
  try {
    return Right(f())
  } catch (e) {
    return Left(e)
  }
}

const Right = x =>
({
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (_, g) => g(x),
  inspect: () => `Right(f(${x}))`
})

const Left = x =>
({
  chain: f => Left(x),
  map: f => Left(x),
  fold: (f, _) => f(x),
  inspect: () => `Left(${x})`
})

const Sum = x =>
({
  x,
  concat: ({x: y}) => Sum(x + y),
  inspect: `Sum(${x})`
})
Sum.empty = () => Sum(0)

const All = x =>
({
  x,
  concat: ({x: y}) => All(x && y),
  inspect: `All(${x})`
})
All.empty = () => All(true)

const First = x =>
({
  x,
  concat: _ => First(x),
  inspect: `First(${x})`
})

const Maybe = (x) =>
({
  x,
  map: f => isNothing(x) ? Maybe(null) : Maybe(f(x)),
  valueOf: () => x
})

const Identity = (x) =>
({
  x,
  map: f => Identity(f(x)),
  join: () => x,
  valueOf: () => Identity(x)
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
