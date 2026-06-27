import {useEffect, useRef, useState} from 'react'
import Image from '@/app/components/SanityImage'
import MuxPlayer from '@mux/mux-player-react'
import '@mux/mux-player/themes/minimal'
import {useMuxDominantColor} from '@/app/hooks/useMuxDominantColor'

type MediaItem = {
  mediaType?: 'image' | 'video'
  image?: {
    asset?: {_ref?: string}
    alt?: string
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
    metadata?: {palette?: {dominant?: {background?: string}}}
  }
  video?: {
    asset?: {
      playbackId?: string
    }
  }
  aspectRatio?: string
}

type MediaRendererProps = {
  media: MediaItem | null | undefined
  isActive?: boolean
}

export default function MediaRenderer({media, isActive = true}: MediaRendererProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {threshold: 0.1}
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const shouldPlay = isActive && inView

  useEffect(() => {
    const el = playerRef.current
    if (!el) return
    const mediaEl = el.media?.nativeEl ?? el
    if (shouldPlay) {
      mediaEl.play?.()?.catch?.(() => {})
    } else {
      mediaEl.pause?.()
    }
  }, [shouldPlay])

  const playbackId = media?.video?.asset?.playbackId
  const dominantColor = useMuxDominantColor(playbackId)

  if (!media) return null

  const aspectStyle =
    media.aspectRatio && media.aspectRatio !== 'free'
      ? {aspectRatio: media.aspectRatio}
      : undefined

  if (media.mediaType === 'video' && playbackId) {
    return (
      <div
        ref={containerRef}
        className='w-full overflow-hidden'
        style={{...aspectStyle, backgroundColor: dominantColor}}
      >
        <MuxPlayer
          ref={playerRef}
          theme='minimal'
          playbackId={playbackId}
          streamType='on-demand'
          autoPlay='muted'
          loop
          muted
          style={{
            width: '100%',
            height: '100%',
            '--controls': 'none',
            '--media-object-fit': 'cover',
            ...(aspectStyle || {aspectRatio: '16/9'}),
            opacity: isActive ? 1 : 'var(--disabled-image)',
            transition: 'opacity 0.3s ease-in-out',
          } as any}
        />
      </div>
    )
  }

  if (media.image?.asset?._ref) {
    return (
      <Image
        id={media.image.asset._ref}
        alt={media.image.alt || ''}
        className='w-full h-full object-cover'
        width={1200}
        mode='cover'
        hotspot={media.image.hotspot}
        crop={media.image.crop}
        palette={media.image.metadata?.palette}
        containerClassName='w-full overflow-hidden'
        containerStyle={aspectStyle}
        isActive={isActive}
      />
    )
  }

  return null
}
