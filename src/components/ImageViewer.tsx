'use client'

import { useState } from 'react'

export default function ImageViewer({ urls }: { urls: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <div className="ff-image-grid">
        {urls.map((url) => (
          <div key={url} className="ff-image-thumb" style={{ cursor: 'zoom-in' }} onClick={() => setLightbox(url)}>
            <img src={url} alt="Imagem da questão" />
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="ff-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Visualização" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
