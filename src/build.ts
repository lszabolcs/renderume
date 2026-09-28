import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadResume } from './load-resume.js'
import { renderHtml } from './render-html.js'

export async function buildHtml(root: string): Promise<string> {
	const resume = await loadResume(root)
	const outputDirectory = path.join(root, 'dist')
	const outputPath = path.join(outputDirectory, 'cv.html')

	await mkdir(outputDirectory, { recursive: true })
	await writeFile(outputPath, renderHtml(resume), 'utf8')

	return outputPath
}
