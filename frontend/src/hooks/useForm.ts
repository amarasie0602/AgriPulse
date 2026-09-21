import { useCallback, useMemo, useState } from 'react'

type Values = Record<string, string>

/** Validator for one field. Receives all values so it can compare fields (e.g. confirm password). */
type FieldValidator<T extends Values> = (value: string, values: T) => string | undefined

export type Validators<T extends Values> = { [K in keyof T]?: FieldValidator<T> }

/**
 * Small controlled-form helper.
 * Errors are computed from current values, and only revealed once a field
 * has been touched (blurred) or the form has been submitted.
 */
export function useForm<T extends Values>(initialValues: T, validators: Validators<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo(() => {
    const result: Partial<Record<keyof T, string>> = {}
    for (const key of Object.keys(validators) as (keyof T)[]) {
      const message = validators[key]?.(values[key], values)
      if (message) result[key] = message
    }
    return result
  }, [values, validators])

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((current) => ({ ...current, [name]: value }))
  }, [])

  const touch = useCallback((name: keyof T) => {
    setTouched((current) => ({ ...current, [name]: true }))
  }, [])

  /**
   * Marks the form as submitted and reports whether it is valid.
   * When a form element is given, focuses the first invalid field (fields are matched by `name`).
   */
  const validate = useCallback(
    (form?: HTMLFormElement | null): boolean => {
      setSubmitted(true)
      const firstInvalid = Object.keys(errors)[0]
      if (!firstInvalid) return true

      const field = form?.elements.namedItem(firstInvalid)
      if (field instanceof HTMLElement) field.focus()
      return false
    },
    [errors],
  )

  const getFieldProps = <K extends keyof T & string>(name: K) => ({
    name,
    value: values[name],
    error: touched[name] || submitted ? errors[name] : undefined,
    onChange: (event: { target: { value: string } }) => setValue(name, event.target.value as T[K]),
    onBlur: () => touch(name),
  })

  return { values, errors, setValue, validate, getFieldProps }
}
