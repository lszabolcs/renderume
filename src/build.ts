import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadResume } from './load-resume.js'
import { renderHtml } from './render-html.js'
import { renderTheme } from './render-theme.js'

export type BuildOutput = {
	htmlPath: string
	pdfPath: string
}

async function readOptionalFile(filePath: string): Promise<string> {
	try {
		return await readFile(filePath, 'utf8')
	} catch {
		return ''
	}
}

export async function build(root: string): Promise<BuildOutput> {
	const resume = await loadResume(root)
	const outputDirectory = path.join(root, 'dist')
	const htmlPath = path.join(outputDirectory, 'cv.html')
	const pdfPath = path.join(outputDirectory, 'cv.pdf')
	const temporaryPdfPath = path.join(outputDirectory, 'cv.pdf.tmp')
	const [body, styles] = await Promise.all([
		renderTheme(path.join(root, 'theme/Resume.tsx'), resume),
		readOptionalFile(path.join(root, 'theme/styles.css')),
	])
	const html = renderHtml(resume.profile.name, body, styles)

	await mkdir(outputDirectory, { recursive: true })
	await writeFile(htmlPath, html, 'utf8')

	const browser = await chromium.launch({ headless: true })
	try {
		const page = await browser.newPage()
		await page.setContent(html, { waitUntil: 'load' })
		await page.evaluate(() => document.fonts.ready)
		await page.pdf({
			path: temporaryPdfPath,
			format: 'A4',
			margin: {
				top: '16mm',
				right: '16mm',
				bottom: '16mm',
				left: '16mm',
			},
			printBackground: true,
		})
		await rename(temporaryPdfPath, pdfPath)
	} finally {
		await browser.close()
	}

	return { htmlPath, pdfPath }
}
