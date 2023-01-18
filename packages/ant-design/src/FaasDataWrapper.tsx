import {
  FaasDataWrapper as Origin, FaasDataWrapperProps, FaasDataInjection 
} from '@faasjs/react'
import { Loading } from './Loading'
import { Alert } from 'antd'

export { FaasDataWrapperProps, FaasDataInjection }

/**
 * FaasDataWrapper component with Loading and ErrorBoundary
 */
export function FaasDataWrapper<T = any> (props: FaasDataWrapperProps<T>): JSX.Element {
  return <Alert.ErrorBoundary>
    <Origin
      fallback={ <Loading /> }
      { ...props }
    />
  </Alert.ErrorBoundary>
}
