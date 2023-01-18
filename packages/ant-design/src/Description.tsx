import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import {
  Descriptions, DescriptionsProps, Skeleton, Space
} from 'antd'
import { isFunction, upperFirst } from 'lodash-es'
import {
  cloneElement, ReactNode, useEffect, useState
} from 'react'
import type { Dayjs } from 'dayjs'
import { BaseItemProps } from '.'
import {
  FaasItemProps, transferOptions, transferValue
} from './data'
import { FaasDataWrapper, FaasDataWrapperProps } from './FaasDataWrapper'
import { Blank } from './Blank'

export interface ExtendDescriptionTypeProps {
  children?: JSX.Element
  render?: (value: any, values: any) => JSX.Element
}

export type ExtendDescriptionItemProps = BaseItemProps

export interface DescriptionItemProps<T = any> extends FaasItemProps {
  children?: JSX.Element
  render?: (value: T, values: any) => JSX.Element
  if?: (values: Record<string, any>) => boolean
  object?: DescriptionItemProps[]
}

export interface DescriptionProps<T = any, ExtendItemProps = any> extends DescriptionsProps {
  renderTitle?: ((values: T) => ReactNode)
  items: (DescriptionItemProps | ExtendItemProps)[]
  extendTypes?: {
    [key: string]: ExtendDescriptionTypeProps
  }
  dataSource?: T
  faasData?: FaasDataWrapperProps<T>
}

export interface DescriptionItemContentProps<T = any> {
  item: DescriptionItemProps
  value: T
  values?: any
  extendTypes?: {
    [key: string]: ExtendDescriptionTypeProps
  }
}

function DescriptionItemContent<T = any> (props: DescriptionItemContentProps<T>): JSX.Element {
  const [computedProps, setComputedProps] = useState<DescriptionItemContentProps<T>>()

  useEffect(() => {
    const propsCopy = { ...props }

    if (!propsCopy.item.title) propsCopy.item.title = upperFirst(propsCopy.item.id)
    if (!propsCopy.item.type) propsCopy.item.type = 'string'
    if (propsCopy.item.options?.length) {
      propsCopy.item.options = transferOptions(propsCopy.item.options)
    }

    propsCopy.value = transferValue(propsCopy.item.type, propsCopy.value)

    if (propsCopy.item.options && propsCopy.value !== null) {
      if (propsCopy.item.type.endsWith('[]'))
        propsCopy.value = (propsCopy.value as unknown as any[]).map((v: any) => (propsCopy.item.options as {
          label: string
          value: any
        }[])
          .find(option => option.value === v)?.label
        || v) as unknown as T
      else if ([
        'string',
        'number',
        'boolean'
      ].includes(propsCopy.item.type))
        propsCopy.value = (props.item.options as {
          label: string
          value: any
        }[])
          .find(option => option.value === props.value)?.label as unknown as T
        || props.value
    }

    setComputedProps(propsCopy)
  }, [props])

  if (!computedProps) return null

  if (computedProps.extendTypes && computedProps.extendTypes[computedProps.item.type])
    if (computedProps.extendTypes[computedProps.item.type].children)
      return cloneElement(
        computedProps.extendTypes[computedProps.item.type].children,
        {
          value: computedProps.value,
          values: computedProps.values
        }
      )
    else if (computedProps.extendTypes[computedProps.item.type].render)
      return <>{computedProps.extendTypes[computedProps.item.type].render(computedProps.value, computedProps.values)}</>
    else
      throw Error(computedProps.item.type + ' requires children or render')

  if (computedProps.item.children)
    return cloneElement(computedProps.item.children, {
      value: computedProps.value,
      values: computedProps.values,
    })

  if (computedProps.item.render)
    return <>{computedProps.item.render(computedProps.value, computedProps.values)}</>

  if (computedProps.value === null || (Array.isArray(computedProps.value) && !computedProps.value.length))
    return <Blank />

  switch (computedProps.item.type) {
    case 'string[]':
      return <>{(computedProps.value as string[]).join(', ')}</>
    case 'number':
      return computedProps.value as any || null
    case 'number[]':
      return <>{(computedProps.value as number[]).join(', ')}</>
    case 'boolean':
      return computedProps.value ? <CheckOutlined style={ {
        marginTop: '4px',
        color: '#52c41a'
      } } /> : <CloseOutlined style={ {
        marginTop: '4px',
        color: '#ff4d4f'
      } } />
    case 'time':
      return <>{(computedProps.value as Dayjs).format('YYYY-MM-DD HH:mm:ss')}</>
    case 'date':
      return <>{(computedProps.value as Dayjs).format('YYYY-MM-DD')}</>
    case 'object':
      if (!computedProps.value) return <Blank />

      return <Description
        items={ computedProps.item.object }
        dataSource={ computedProps.value }
        column={ 1 }
      />
    case 'object[]':
      if (!(computedProps.value as Record<string, any>[])?.length) return <Blank />

      return <Space direction="vertical">{
        (computedProps.value as Record<string, any>[])
          .map((value, index) => <Description
            key={ index }
            items={ computedProps.item.object }
            dataSource={ value }
            column={ 1 }
          />)
      }</Space>
    default:
      return computedProps.value as any || null
  }
}

export function Description<T = any> (props: DescriptionProps<T>) {
  if (!props.faasData)
    return <Descriptions
      { ...props }
      title={ isFunction(props.renderTitle) ? props.renderTitle(props.dataSource) : props.title }
    >
      {
        props.items.map(item => {
          return !item.if || item.if(props.dataSource) ? (
            <Descriptions.Item
              key={ item.id }
              label={ item.title || upperFirst(item.id) }>
              <DescriptionItemContent
                item={ item }
                value={ (props.dataSource as Record<string, any>)[item.id] }
                values={ props.dataSource }
                extendTypes={ props.extendTypes }
              />
            </Descriptions.Item>
          ) : null}).filter(Boolean)
      }
    </Descriptions>

  return <FaasDataWrapper<T>
    fallback={ props.faasData.fallback || <Skeleton active /> }
    render={ ({ data }) => {
      return <Descriptions
        { ...props }
        title={ isFunction(props.renderTitle) ? props.renderTitle(data) : props.title }
      >
        {
          props.items.map(item => {
            return !item.if || item.if(data) ? (
              <Descriptions.Item
                key={ item.id }
                label={ item.title || upperFirst(item.id) }>
                <DescriptionItemContent
                  item={ item }
                  value={ (data as Record<string, any>)[item.id] }
                  values={ data }
                  extendTypes={ props.extendTypes }
                />
              </Descriptions.Item>
            ) : null
          }).filter(Boolean)
        }
      </Descriptions>
    } }
    { ...props.faasData }
  />
}
