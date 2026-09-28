import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

export type PreviewServer = {
	close: () => Promise<void>
	htmlUrl: string
	pdfUrl: string
}

export async function startPreview(htmlPath: string, pdfPath: string): Promise<PreviewServer> {
	const server = createServer(async (request, response) => {
		if (request.method !== 'GET') {
			response.writeHead(405)
			response.end()
			return
		}

		const previewFile =
			request.url === '/html'
				? { contentType: 'text/html; charset=utf-8', path: htmlPath }
				: request.url === '/pdf'
					? { contentType: 'application/pdf', path: pdfPath }
					: undefined

		if (!previewFile) {
			response.writeHead(404)
			response.end()
			return
		}

		try {
			const content = await readFile(previewFile.path)
			response.writeHead(200, { 'content-type': previewFile.contentType })
			response.end(content)
		} catch {
			response.writeHead(404)
			response.end()
		}
	})

	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', resolve)
	})

	const { port } = server.address() as AddressInfo
	const baseUrl = `http://127.0.0.1:${port}`
	return {
		htmlUrl: `${baseUrl}/html`,
		pdfUrl: `${baseUrl}/pdf`,
		close: () =>
			new Promise((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()))
			}),
	}
}
