import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadResume } from '../src/load-resume.js'

const exampleRoot = path.resolve(import.meta.dirname, '../examples/minimal-cv')
const temporaryRoots: string[] = []

async function copyExample(): Promise<string> {
	const root = await mkdtemp(path.join(tmpdir(), 'renderume-test-'))
	temporaryRoots.push(root)
	await cp(exampleRoot, root, { recursive: true })
	return root
}

afterEach(async () => {
	await Promise.all(
		temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
	)
})

describe('loadResume', () => {
	it('loads the minimal CV source', async () => {
		const resume = await loadResume(await copyExample())

		expect(resume.profile).toEqual({
			name: 'Alex Morgan',
			title: 'Frontend Engineer',
			email: 'alex@example.com',
		})
		expect(resume.summary).toContain('Frontend engineer')
		expect(resume.experience).toHaveLength(1)
		expect(resume.experience[0]).toMatchObject({
			company: 'Northstar',
			role: 'Frontend Engineer',
		})
	})

	it('reports the source file and field for an invalid profile', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/profile.yaml'),
			'name: Alex Morgan\ntitle: Frontend Engineer\nemail: \n',
		)

		await expect(loadResume(root)).rejects.toThrow('content/profile.yaml: email is required')
	})

	it('reports the source file and field for an invalid experience item', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/experience/northstar.md'),
			'---\ncompany: Northstar\nstart: 2022-05\n---\n\n- Built product interfaces.\n',
		)

		await expect(loadResume(root)).rejects.toThrow(
			'content/experience/northstar.md: role is required',
		)
	})

	it('rejects an empty Markdown summary', async () => {
		const root = await copyExample()
		await writeFile(path.join(root, 'content/summary.md'), '   \n')

		await expect(loadResume(root)).rejects.toThrow('content/summary.md: summary is required')
	})
})
