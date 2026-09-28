import type { Dirent } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import type { Experience, Profile, Resume } from './types.js'

function requiredString(value: unknown, field: string, source: string): string {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${source}: ${field} is required`)
	}

	return value.trim()
}

async function loadProfile(root: string): Promise<Profile> {
	const sourcePath = path.join(root, 'content/profile.yaml')
	const source = await readFile(sourcePath, 'utf8')
	const value = parseYaml(source) as Record<string, unknown>

	return {
		name: requiredString(value.name, 'name', sourcePath),
		title: requiredString(value.title, 'title', sourcePath),
		email: requiredString(value.email, 'email', sourcePath),
	}
}

async function loadExperience(root: string): Promise<Experience[]> {
	const directory = path.join(root, 'content/experience')
	const entries: Dirent[] = await readdir(directory, { withFileTypes: true })
	const paths = entries
		.filter((entry: Dirent) => entry.isFile() && entry.name.endsWith('.md'))
		.map((entry: Dirent) => path.join(directory, entry.name))
		.sort()

	return Promise.all(
		paths.map(async (sourcePath: string) => {
			const source = await readFile(sourcePath, 'utf8')
			const parsed = matter(source)
			const data = parsed.data as Record<string, unknown>

			return {
				company: requiredString(data.company, 'company', sourcePath),
				role: requiredString(data.role, 'role', sourcePath),
				start: requiredString(data.start, 'start', sourcePath),
				end: typeof data.end === 'string' ? data.end : undefined,
				body: requiredString(parsed.content, 'Markdown body', sourcePath),
			}
		}),
	)
}

export async function loadResume(root: string): Promise<Resume> {
	const [profile, summary, experience] = await Promise.all([
		loadProfile(root),
		readFile(path.join(root, 'content/summary.md'), 'utf8'),
		loadExperience(root),
	])

	return {
		profile,
		summary: requiredString(summary, 'summary', path.join(root, 'content/summary.md')),
		experience,
	}
}
