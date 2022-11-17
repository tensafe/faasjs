import { faas } from '@faasjs/react'
import {
  Button,
  Form as AntdForm,
  FormProps as AntdFormProps,
} from 'antd'
import {
  ReactNode, useEffect, useState, useCallback
} from 'react'
import { useConfigContext } from './Config'
import { transferValue } from './data'
import {
  ExtendFormTypeProps, ExtendFormItemProps, ExtendTypes,
  FormItem, FormItemProps
} from './FormItem'

export { ExtendFormTypeProps, ExtendFormItemProps }

export type FormProps<Values extends Record<string, any> = any, ExtendItemProps = any> = {
  items?: (FormItemProps | ExtendItemProps)[]
  /** Default: { text: 'Submit' }, set false to disable it */
  submit?: false | {
    /** Default: Submit */
    text?: string
    /**
     * Submit to FaasJS server.
     *
     * If use onFinish, you should call submit manually.
     * ```ts
     * {
     *   submit: {
     *     to: {
     *       action: 'action_name'
     *     }
     *   },
     *   onFinish: (values, submit) => {
     *     // do something before submit
     *
     *     // submit
     *     await submit({
     *      ...values,
     *      extraProps: 'some extra props'
     *     })
     *
     *     // do something after submit
     *   }
     * }
     * ```
     */
    to?: {
      action: string
      /** params will overwrite form values before submit */
      params?: Record<string, any>
    }
  }

  onFinish?: (values: Values, submit?: (values: any) => Promise<any>) => Promise<any>
  beforeItems?: JSX.Element | JSX.Element[]
  footer?: JSX.Element | JSX.Element[]
  extendTypes?: ExtendTypes
  children?: ReactNode
  initialValues?: Values
} & Omit<AntdFormProps<Values>, 'onFinish' | 'children' | 'initialValues'>

/**
 * Form component with Ant Design & FaasJS
 *
 * @ref https://ant.design/components/form/
 */
export function Form<Values = any> (props: FormProps<Values>) {
  const [loading, setLoading] = useState(false)
  const [computedProps, setComputedProps] = useState<FormProps<Values>>()
  const config = useConfigContext()
  const [extendTypes, setExtendTypes] = useState<ExtendTypes>()
  const [form] = AntdForm.useForm<Values>(props.form)
  const [initialValues, setInitialValues] = useState<Values>(props.initialValues)

  useEffect(() => {
    const propsCopy = {
      ...props,
      form,
    }

    if (propsCopy.initialValues) {
      for (const key in propsCopy.initialValues)
        propsCopy.initialValues[key] = transferValue(
          propsCopy.items.find(item => item.id === key)?.type,
          propsCopy.initialValues[key]
        )
      setInitialValues(propsCopy.initialValues)
      delete propsCopy.initialValues
    }

    if (propsCopy.onFinish) {
      propsCopy.onFinish = async values => {
        setLoading(true)

        try {
          if (propsCopy.submit && propsCopy.submit.to?.action) {
            await props.onFinish(values, async values => faas((propsCopy.submit as {
              to: {
                action: string
              }
            }).to.action, (propsCopy.submit as {
              to: {
                params?: Record<string, any>
              }
            }).to.params ? {
                ...values,
                ...(propsCopy.submit as {
                  to: {
                    params?: Record<string, any>
                  }
                }).to.params
              } : values))
          } else
            await props.onFinish(values)
        } catch (error) {
          console.error(error)
        }

        setLoading(false)
      }
    } else if (propsCopy.submit && (propsCopy.submit as {
      to?: {
        action: string
      }
    }).to?.action) {
      propsCopy.onFinish = async values => {
        setLoading(true)
        return faas((propsCopy.submit as {
          to: {
            action: string
          }
        }).to.action, (propsCopy.submit as {
          to: {
            params?: Record<string, any>
          }
        }).to.params ? {
            ...values,
            ...(propsCopy.submit as {
              to: {
                params?: Record<string, any>
              }
            }).to.params
          } : values).finally(() => setLoading(false))
      }
    }

    if (propsCopy.extendTypes) {
      setExtendTypes(propsCopy.extendTypes)
      delete propsCopy.extendTypes
    }

    setComputedProps(propsCopy)
  }, [props])

  const onValuesChange = useCallback((changedValues:Record<string, any>, allValues:Values) => {
    if (props.onValuesChange) {
      props.onValuesChange(changedValues, allValues)
    }

    if (!props.items) return

    for (const key in changedValues) {
      const item = computedProps.items.find(i => i.id === key)

      if (item?.onValueChange)
        item.onValueChange(changedValues[key], allValues, form)
    }
  }, [computedProps])

  useEffect(() => {
    if (!initialValues) return

    form.setFieldsValue(initialValues as any)

    setInitialValues(null)
  }, [computedProps])

  if (!computedProps) return null

  return <AntdForm
    { ...computedProps }
    onValuesChange = { onValuesChange }
  >
    {computedProps.beforeItems}
    {computedProps.items?.map((item: FormItemProps) => <FormItem
      key={ item.id }
      { ...item }
      extendTypes={ extendTypes }
    />)}
    {computedProps.children}
    {computedProps.submit !== false && <Button
      htmlType='submit'
      type='primary'
      loading={ loading }
    >{computedProps.submit?.text || config.Form.submit.text}</Button>}
    {computedProps.footer}
  </AntdForm>
}

Form.useForm = AntdForm.useForm
