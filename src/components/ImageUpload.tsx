'use client'

import { useRef, useState } from 'react'
import { uploadQuestionImage } from '@/lib/storage'

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUpload({ urls, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploads = await Promise.all(
        Array.from(files).map((f) => uploadQuestionImage(f))
      )
      onChange([...urls, ...uploads])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (url: string) => onChange(urls.filter((u) => u !== url))

  return (
    <>
      <div className="ff-image-grid">
        {urls.map((url) => (
          <div key={url} className="ff-image-thumb">
            <img
              src={url}
              alt="Imagem da questão"
              style={{ cursor: 'zoom-in' }}
              onClick={() => setLightbox(url)}
            />
            <button
              type="button"
              className="ff-image-thumb-remove"
              onClick={() => remove(url)}
              title="Remover imagem"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          className="ff-image-add-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span style={{ fontSize: '11px', color: 'var(--ink-500)' }}>Enviando...</span>
          ) : (
            <>
              <span className="ff-image-add-btn-icon">＋</span>
              <span>Adicionar</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {lightbox && (
        <div className="ff-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Visualização" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
