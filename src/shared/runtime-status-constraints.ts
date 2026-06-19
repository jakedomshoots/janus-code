export type RuntimeStatusPortingNumericConstraint = {
  integer: true
  minimum: number
  nullable?: true
}

export type RuntimeStatusPortingStringConstraint = {
  minLength: number
  trim?: true
}

export type RuntimeStatusPortingArrayConstraint = {
  itemType: 'string'
}
