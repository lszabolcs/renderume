import { readFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

export type PreviewServer = {
	close: () => Promise<void>
	htmlUrl: string
	pdfUrl: string
	reload: () => void
	showError: (message: string) => void
}

function addLiveReload(html: string): string {
	const script = `<script>
const source = new EventSource('/events')
source.addEventListener('reload', () => location.reload())
source.addEventListener('build-error', (event) => {
  const id = 'renderume-watch-error'
  const banner = document.getElementById(id) ?? document.createElement('div')
  banner.id = id
  Object.assign(banner.style, { background: '#fff3cd', borderBottom: '1px solid #664d03', color: '#664d03', fontFamily: 'system-ui, sans-serif', padding: '12px 16px', whiteSpace: 'pre-wrap' })
  banner.textContent = 'Renderume rebuild failed\\n' + JSON.parse(event.data)
  document.body.prepend(banner)
})
</script>`
	return html.includes('</body>') ? html.replace('</body>', `${script}</body>`) : `${html}${script}`
}

export async function startPreview(htmlPath: string, pdfPath: string): Promise<PreviewServer> {
	const eventClients = new Set<ServerResponse>()
	function broadcast(event: string, data: string): void {
		for (const client of eventClients) {
			client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
		}
	}

	const server = createServer(async (request, response) => {
		if (request.method !== 'GET') {
			response.writeHead(405)
			response.end()
			return
		}

		if (request.url === '/events') {
			response.writeHead(200, {
				'cache-control': 'no-cache',
				connection: 'keep-alive',
				'content-type': 'text/event-stream',
			})
			response.write(': connected\n\n')
			eventClients.add(response)
			request.on('close', () => eventClients.delete(response))
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
			response.end(request.url === '/html' ? addLiveReload(content.toString()) : content)
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
		reload: () => broadcast('reload', 'now'),
		showError: (message) => broadcast('build-error', message),
		close: () =>
			new Promise((resolve, reject) => {
				for (const client of eventClients) {
					client.end()
				}
				server.close((error) => (error ? reject(error) : resolve()))
			}),
	}
}
