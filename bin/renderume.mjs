#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const cliPath = fileURLToPath(new URL('../src/cli.ts', import.meta.url))
const require = createRequire(import.meta.url)
const tsxLoaderPath = require.resolve('tsx')
const child = spawn(
	process.execPath,
	['--import', tsxLoaderPath, cliPath, ...process.argv.slice(2)],
	{
		stdio: 'inherit',
	},
)

child.on('error', (error) => {
	console.error(`✖ ${error.message}`)
	process.exitCode = 1
})

child.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal)
		return
	}

	process.exitCode = code ?? 1
})
