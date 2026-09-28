import { spawn } from 'node:child_process'
import path from 'node:path'
import { watch } from 'chokidar'

type BuildResult = {
	succeeded: boolean
	output: string
}

type WatchOptions = {
	build?: () => Promise<BuildResult>
	initialBuild?: boolean
	onChange?: (sourcePath: string) => void
	onResult?: (result: BuildResult) => void
}

export type CvWatcher = {
	close: () => Promise<void>
}

function runBuild(root: string): Promise<BuildResult> {
	const projectRoot = path.resolve(import.meta.dirname, '..')
	const tsxPath = path.join(projectRoot, 'node_modules/tsx/dist/cli.mjs')

	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [tsxPath, 'src/cli.ts', 'build', root], {
			cwd: projectRoot,
			stdio: ['ignore', 'pipe', 'pipe'],
		})
		let output = ''

		child.stdout.on('data', (chunk) => {
			output += chunk
		})
		child.stderr.on('data', (chunk) => {
			output += chunk
		})
		child.on('error', reject)
		child.on('close', (code) => {
			resolve({ succeeded: code === 0, output })
		})
	})
}

export async function startWatch(root: string, options: WatchOptions = {}): Promise<CvWatcher> {
	const sources = [
		path.join(root, 'cv.config.yaml'),
		path.join(root, 'content'),
		path.join(root, 'theme'),
	]
	const watcher = watch(sources, {
		awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 25 },
		ignoreInitial: true,
	})
	const build = options.build ?? (() => runBuild(root))
	let building = false
	let rebuildQueued = false
	const recentChanges = new Map<string, number>()

	async function rebuild(): Promise<void> {
		if (building) {
			rebuildQueued = true
			return
		}

		building = true
		try {
			const result = await build()
			options.onResult?.(result)
		} catch (error) {
			options.onResult?.({
				succeeded: false,
				output: `✖ ${error instanceof Error ? error.message : String(error)}\n`,
			})
		} finally {
			building = false
			if (rebuildQueued) {
				rebuildQueued = false
				await rebuild()
			}
		}
	}

	watcher.on('all', (_event, sourcePath) => {
		const now = Date.now()
		const previousChange = recentChanges.get(sourcePath)
		if (previousChange && now - previousChange < 250) {
			return
		}
		recentChanges.set(sourcePath, now)
		options.onChange?.(sourcePath)
		void rebuild()
	})

	await new Promise<void>((resolve, reject) => {
		watcher.once('ready', resolve)
		watcher.once('error', reject)
	})
	if (options.initialBuild ?? true) {
		await rebuild()
	}

	return { close: () => watcher.close() }
}
