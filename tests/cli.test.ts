import { spawn } from 'node:child_process'
import { access, cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const projectRoot = path.resolve(import.meta.dirname, '..')
const exampleRoot = path.join(projectRoot, 'examples/minimal-cv')
const tsxPath = path.join(projectRoot, 'node_modules/tsx/dist/cli.mjs')
const temporaryRoots: string[] = []

async function copyExample(): Promise<string> {
	const root = await mkdtemp(path.join(tmpdir(), 'renderume-cli-test-'))
	temporaryRoots.push(root)
	await cp(exampleRoot, root, { recursive: true })
	await rm(path.join(root, 'dist'), { recursive: true, force: true })
	return root
}

async function runCli(...args: string[]): Promise<{ code: number | null; output: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [tsxPath, 'src/cli.ts', ...args], {
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
		child.on('close', (code) => resolve({ code, output }))
	})
}

afterEach(async () => {
	await Promise.all(
		temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
	)
})

describe('cv validate', () => {
	it('validates a CV without creating dist output', async () => {
		const root = await copyExample()
		const result = await runCli('validate', root)

		expect(result.code).toBe(0)
		expect(result.output).toContain(`✓ Validated ${root}`)
		await expect(access(path.join(root, 'dist'))).rejects.toMatchObject({ code: 'ENOENT' })
	})

	it('returns a field-level error without creating dist output', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/profile.yaml'),
			'name: Alex Morgan\ncontact:\n  email: alex@example.com\n',
		)
		const result = await runCli('validate', root)

		expect(result.code).toBe(1)
		expect(result.output).toContain('content/profile.yaml: title is required')
		await expect(access(path.join(root, 'dist'))).rejects.toMatchObject({ code: 'ENOENT' })
	})
})
