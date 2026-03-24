import Image from '@/app/components/SanityImage'
import MuxPlayer from '@mux/mux-player-react'

type MediaItem = {
  mediaType?: 'image' | 'video'
  image?: {
    asset?: {_ref?: string}
    alt?: string
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
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
}

export default function MediaRenderer({media}: MediaRendererProps) {
  if (!media) return null

  const aspectStyle =
    media.aspectRatio && media.aspectRatio !== 'free'
      ? {aspectRatio: media.aspectRatio}
      : undefined

  if (media.mediaType === 'video' && media.video?.asset?.playbackId) {
    return (
      <div className='w-full overflow-hidden' style={aspectStyle}>
        <MuxPlayer
          playbackId={media.video.asset.playbackId}
          streamType='on-demand'
          autoPlay='muted'
          loop
          muted
          style={{width: '100%', height: '100%', ...(aspectStyle || {aspectRatio: '16/9'})}}
        />
      </div>
    )
  }

  if (media.image?.asset?._ref) {
    return (
      <div className='w-full overflow-hidden' style={aspectStyle}>
        <Image
          id={media.image.asset._ref}
          alt={media.image.alt || ''}
          className='w-full h-full object-cover'
          width={1200}
          mode='cover'
          hotspot={media.image.hotspot}
          crop={media.image.crop}
        />
      </div>
    )
  }

  return null
}
