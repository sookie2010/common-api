export type VForm = Vue & {
  validate: (callback: (valid: boolean) => void) => void
  resetValidation: () => boolean
  reset: () => void
}