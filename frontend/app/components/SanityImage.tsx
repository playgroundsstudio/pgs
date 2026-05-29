'use client'

import {useState, useCallback} from 'react'
import {SanityImage, type WrapperProps} from 'sanity-image'

import {dataset, projectId} from '@/sanity/lib/api'

type ImageProps = WrapperProps<'img'> & {
  fadeIn?: boolean
  palette?: {dominant?: {background?: string}}
  containerClassName?: string
  containerStyle?: React.CSSProperties
}

const Image = ({style, onLoad, fadeIn = true, palette, containerClassName, containerStyle, ...props}: ImageProps) => {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      if (typeof onLoad === 'function') {
        onLoad(e)
      }
    },
    [onLoad],
  )

  if (!fadeIn) {
    return (
      <SanityImage
        baseUrl={`https://cdn.sanity.io/images/${projectId}/${dataset}/`}
        style={style as React.CSSProperties}
        onLoad={onLoad}
        {...props}
      />
    )
  }

  const img = (
    <SanityImage
      baseUrl={`https://cdn.sanity.io/images/${projectId}/${dataset}/`}
      style={{
        ...(style as React.CSSProperties),
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
      onLoad={handleLoad}
      {...props}
    />
  )

  if (palette) {
    return (
      <div
        className={containerClassName}
        style={{...containerStyle, backgroundColor: palette.dominant?.background}}
      >
        {img}
      </div>
    )
  }

  return img
}

export default Image
