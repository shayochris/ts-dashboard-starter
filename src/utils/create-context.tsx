import {
  createContext as createReactContext,
  useContext as useReactContext,
  useMemo,
} from 'react'
import type { FC, ReactNode } from 'react'

export function createContext<TContextValue extends object | null>(
  rootComponentName: string,
  defaultContext?: TContextValue,
) {
  const Context = createReactContext<TContextValue | undefined>(defaultContext)

  const Provider: FC<TContextValue & { children: ReactNode }> = (props) => {
    const { children, ...context } = props

    const values = useMemo(
      () => context,
      Object.values(context),
    ) as TContextValue

    return <Context.Provider value={values}>{children}</Context.Provider>
  }

  Provider.displayName = rootComponentName + 'Provider'

  function useContext(consumerName: string) {
    const context = useReactContext(Context)

    if (context) return context

    if (defaultContext !== undefined) return defaultContext

    throw new Error(`${consumerName} must be used within ${rootComponentName}`)
  }

  return [Provider, useContext] as const
}
