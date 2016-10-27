export function hasModule (module: string) {
  try {
    require(module)
    return true
  } catch (err) {
    return false
  }
}
