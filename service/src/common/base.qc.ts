export default class BaseQc {
  $and?: object[]
  $or?: object[]
  $where?: () => boolean
  $expr?: object
}
