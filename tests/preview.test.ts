import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { startPreview } from '../src/preview.js'

const temporaryRoots: string[] = []

afterEach(async () => {
	await Promise.all(
		temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
	)
})

describe('startPreview', () => {
	it('serves the generated HTML and PDF on local routes', async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'renderume-preview-test-'))
		temporaryRoots.push(root)
		const htmlPath = path.join(root, 'resume.html')
		const pdfPath = path.join(root, 'resume.pdf')
		await writeFile(htmlPath, '<main>Résumé</main>')
		await writeFile(pdfPath, '%PDF-1.4')
		const preview = await startPreview(htmlPath, pdfPath)

		try {
			const [html, pdf] = await Promise.all([fetch(preview.htmlUrl), fetch(preview.pdfUrl)])

			expect(html.headers.get('content-type')).toContain('text/html')
			expect(await html.text()).toBe('<main>Résumé</main>')
			expect(pdf.headers.get('content-type')).toContain('application/pdf')
			expect(await pdf.text()).toBe('%PDF-1.4')
		} finally {
			await preview.close()
		}
	})
})
