import { useState } from 'react'

// Pixabay 이미지 CDN 은 짧은 시간에 몰리면 429 를 돌려줍니다.
// 실패하면 잠깐 뒤 한 번 다시 시도하고, 그래도 안 되면 작은 미리보기(preview)로 대체합니다.
export default function PixImg({ photo, large = false, alt, ...rest }) {
  const main = large ? photo.large : photo.thumb
  const [src, setSrc] = useState(main)
  const [tries, setTries] = useState(0)

  function onError() {
    if (tries === 0) {
      setTries(1)
      setTimeout(() => setSrc(`${main}${main.includes('?') ? '&' : '?'}r=1`), 1200 + Math.random() * 1500)
    } else if (photo.preview && src !== photo.preview) {
      setSrc(photo.preview)
    }
  }
  return <img src={src} alt={alt} onError={onError} {...rest} />
}
