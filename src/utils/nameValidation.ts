const ALLOWED_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .\-/,&:()]*$/

export const validateName = (value: string, label = 'Name'): string | null => {
  if (!value.trim()) {
    return `${label} cannot be blank.`
  }

  if (value[0] !== value.trimStart()[0] || !/^[A-Za-z0-9]/.test(value)) {
    return `${label} "${value}" cannot start with a space or special character.`
  }

  const trimmedValue = value.trim()
  if (trimmedValue.length < 3) {
    return `${label} "${trimmedValue}" must be at least 3 characters.`
  }

  if (trimmedValue.length > 100) {
    return `${label} cannot be more than 100 characters (currently ${trimmedValue.length}).`
  }

  if (!ALLOWED_NAME_PATTERN.test(trimmedValue)) {
    return `${label} "${trimmedValue}" contains unsupported special characters. Allowed characters are . - / , & : ( ).`
  }

  return null
}