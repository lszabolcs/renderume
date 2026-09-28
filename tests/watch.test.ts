import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { startWatch } from '../src/watch.js'

const temporaryRoots: string[] = []

async function waitFor(condition: () => boolean): Promise<void> {
	const timeout = Date.now() + 2_000
	while (!condition()) {
		if (Date.now() > timeout) {
			throw new Error('timed out while waiting for the file watcher')
		}
		await new Promise((resolve) => setTimeout(resolve, 25))
	}
}

afterEach(async () => {
	await Promise.all(
		temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
	)
})

describe('startWatch', () => {
	it('builds initially and rebuilds when a CV source file changes', async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'renderume-watch-test-'))
		temporaryRoots.push(root)
		await Promise.all([mkdir(path.join(root, 'content')), mkdir(path.join(root, 'theme'))])
		await Promise.all([
			writeFile(path.join(root, 'cv.config.yaml'), 'output: {}'),
			writeFile(path.join(root, 'content/summary.md'), 'Initial summary'),
		])
		const changedPaths: string[] = []
		let builds = 0
		const watcher = await startWatch(root, {
			build: async () => {
				builds += 1
				return { succeeded: true, output: '' }
			},
			onChange: (sourcePath) => changedPaths.push(sourcePath),
		})

		try {
			expect(builds).toBe(1)
			const summaryPath = path.join(root, 'content/summary.md')
			await writeFile(summaryPath, 'Updated summary')
			await waitFor(() => builds === 2)
			await new Promise((resolve) => setTimeout(resolve, 300))

			expect(builds).toBe(2)
			expect(changedPaths).toContain(summaryPath)
		} finally {
			await watcher.close()
		}
	})

	it('can skip the initial build when another command already built the CV', async () => {
		const root = await mkdtemp(path.join(tmpdir(), 'renderume-watch-test-'))
		temporaryRoots.push(root)
		await Promise.all([
			mkdir(path.join(root, 'content')),
			mkdir(path.join(root, 'theme')),
			writeFile(path.join(root, 'cv.config.yaml'), 'output: {}'),
		])
		let builds = 0
		const watcher = await startWatch(root, {
			initialBuild: false,
			build: async () => {
				builds += 1
				return { succeeded: true, output: '' }
			},
		})

		try {
			expect(builds).toBe(0)
			await writeFile(path.join(root, 'cv.config.yaml'), 'output: { filename: cv.pdf }')
			await waitFor(() => builds === 1)
		} finally {
			await watcher.close()
		}
	})
})
