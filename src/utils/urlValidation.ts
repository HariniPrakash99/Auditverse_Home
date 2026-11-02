export const isValidHttpsUrl = (value: string): boolean => {
  const trimmedValue = value.trim()

  if (!/^https:\/\//i.test(trimmedValue)) {
    return false
  }

  try {
    const url = new URL(trimmedValue)
    return url.protocol.toLowerCase() === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}