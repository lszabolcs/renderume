import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadResume } from '../src/load-resume.js'

const exampleRoot = path.resolve(import.meta.dirname, '../examples/minimal-cv')
const paginationRoot = path.resolve(import.meta.dirname, '../examples/pagination-cv')
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

		expect(resume.config.output.filename).toBe('alex-morgan-cv.pdf')
		expect(resume.profile.name).toBe('Alex Morgan')
		expect(resume.profile.contact.email).toBe('alex@example.com')
		expect(resume.profile.contact).toMatchObject({
			phone: '+44 20 7946 0958',
			links: [
				{ label: 'Portfolio', url: 'https://alex.example.com' },
				{ label: 'GitHub', url: 'https://github.com/alexmorgan' },
				{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/alexmorgan' },
			],
		})
		expect(resume.summaryHtml).toContain('Frontend engineer')
		expect(resume.experience).toHaveLength(3)
		expect(resume.experience.map((item) => item.company)).toEqual([
			'Pulsar Studio',
			'Northstar',
			'Redwood Labs',
		])
		expect(resume.experience[1]).toMatchObject({
			company: 'Northstar',
			role: 'Frontend Engineer',
		})
		expect(resume.projects[0]).toMatchObject({
			name: 'Component Atlas',
			stack: ['TypeScript', 'React', 'Storybook'],
		})
		expect(resume.skills).toContainEqual({
			name: 'Frontend',
			items: ['TypeScript', 'React', 'CSS', 'Accessibility', 'Performance'],
		})
		expect(resume.languages).toEqual([
			{ language: 'Hungarian', level: 'Native' },
			{ language: 'English', level: 'C1' },
		])
		expect(resume.educationHtml).toContain('BSc')
	})

	it('reports the source file and field for an invalid profile', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/profile.yaml'),
			'name: Alex Morgan\ntitle: Frontend Engineer\ncontact:\n  email: \n',
		)

		await expect(loadResume(root)).rejects.toThrow(
			'content/profile.yaml: contact.email is required',
		)
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

	it('reports the source file and field for an invalid contact link', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/profile.yaml'),
			'name: Alex Morgan\ntitle: Frontend Engineer\ncontact:\n  email: alex@example.com\n  links:\n    - url: https://example.com\n',
		)

		await expect(loadResume(root)).rejects.toThrow(
			'content/profile.yaml: contact.links.0.label is required',
		)
	})

	it('reports the source file and field for an invalid language', async () => {
		const root = await copyExample()
		await writeFile(
			path.join(root, 'content/languages.yaml'),
			'languages:\n  - language: English\n',
		)

		await expect(loadResume(root)).rejects.toThrow(
			'content/languages.yaml: languages.0.level is required',
		)
	})

	it('uses an empty language list when the optional file is absent', async () => {
		const root = await copyExample()
		await rm(path.join(root, 'content/languages.yaml'))

		await expect(loadResume(root)).resolves.toMatchObject({ languages: [] })
	})

	it('rejects an empty Markdown summary', async () => {
		const root = await copyExample()
		await writeFile(path.join(root, 'content/summary.md'), '   \n')

		await expect(loadResume(root)).rejects.toThrow('content/summary.md: summary is required')
	})

	it('loads the long-block pagination fixture', async () => {
		const resume = await loadResume(paginationRoot)

		expect(resume.experience).toHaveLength(1)
		expect(resume.experience[0]?.bodyHtml).toContain('frontend tooling current')
	})
})
