import { Router } from 'express'
import multer from 'multer'
import axios from 'axios'
import FormData from 'form-data'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const OPENINARY_BASE = process.env.OPENINARY_BASE_URL
const OPENINARY_KEY  = process.env.OPENINARY_API_KEY

function openinaryHeaders() {
  if (OPENINARY_KEY) {
    return { Authorization: `ApiKey ${OPENINARY_KEY}` }
  }
  return {}
}

// POST /api/upload — forward file to Openinary
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const form = new FormData()
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })
    form.append('folder', req.body.folder || 'moms-magic')
    if (req.body.tags) form.append('tags', req.body.tags)

    const response = await axios.post(`${OPENINARY_BASE}/api/upload`, form, {
      headers: { ...form.getHeaders(), ...openinaryHeaders() },
    })

    res.json(response.data)
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ error: 'Openinary upload failed', detail: err.response.data })
    }
    next(err)
  }
})

// DELETE /api/upload/:id — delete from Openinary
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await axios.delete(`${OPENINARY_BASE}/api/asset/${req.params.id}`, {
      headers: openinaryHeaders(),
    })
    res.json({ success: true })
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Asset not found' })
    next(err)
  }
})

export default router
