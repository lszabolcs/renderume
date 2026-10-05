import type { Dirent } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import { renderMarkdown } from './render-markdown.js'
import type {
	ContactLink,
	Experience,
	Profile,
	Project,
	Resume,
	ResumeConfig,
	SkillGroup,
} from './types.js'

function sourceRecord(value: unknown, source: string): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error(`${source}: expected an object`)
	}

	return value as Record<string, unknown>
}

function requiredString(value: unknown, field: string, source: string): string {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${source}: ${field} is required`)
	}

	return value.trim()
}

function optionalString(value: unknown, field: string, source: string): string | undefined {
	return value === undefined ? undefined : requiredString(value, field, source)
}

function stringList(value: unknown, field: string, source: string): string[] {
	if (value === undefined) return []
	if (
		!Array.isArray(value) ||
		value.some((item) => typeof item !== 'string' || item.trim() === '')
	) {
		throw new Error(`${source}: ${field} must be a list of strings`)
	}

	return value.map((item) => item.trim())
}

function contactLinks(value: unknown, field: string, source: string): ContactLink[] {
	if (value === undefined) return []
	if (!Array.isArray(value)) {
		throw new Error(`${source}: ${field} must be a list`)
	}

	return value.map((item, index) => {
		const link = sourceRecord(item, source)
		return {
			label: requiredString(link.label, `${field}.${index}.label`, source),
			url: requiredString(link.url, `${field}.${index}.url`, source),
		}
	})
}

function optionalNumber(value: unknown, field: string, source: string): number {
	if (value === undefined) return 0
	if (typeof value !== 'number' || !Number.isInteger(value)) {
		throw new Error(`${source}: ${field} must be an integer`)
	}

	return value
}

function optionalBoolean(value: unknown, field: string, source: string): boolean {
	if (value === undefined) return false
	if (typeof value !== 'boolean') {
		throw new Error(`${source}: ${field} must be true or false`)
	}

	return value
}

async function readYaml(
	root: string,
	relativePath: string,
): Promise<{ data: Record<string, unknown>; source: string }> {
	const filePath = path.join(root, relativePath)
	return {
		data: sourceRecord(parseYaml(await readFile(filePath, 'utf8')), relativePath),
		source: relativePath,
	}
}

async function readOptionalMarkdown(
	root: string,
	relativePath: string,
): Promise<string | undefined> {
	try {
		const source = await readFile(path.join(root, relativePath), 'utf8')
		return source.trim() ? renderMarkdown(source) : undefined
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
		throw error
	}
}

async function loadConfig(root: string): Promise<ResumeConfig> {
	const { data, source } = await readYaml(root, 'cv.config.yaml')
	const output = sourceRecord(data.output, source)

	const filename = requiredString(output.filename, 'output.filename', source)
	if (!filename.endsWith('.pdf') || /[\\/]/.test(filename)) {
		throw new Error(`${source}: output.filename must be a PDF filename`)
	}

	if (output.pageSize !== 'A4') {
		throw new Error(`${source}: output.pageSize must be A4`)
	}

	return {
		locale: requiredString(data.locale, 'locale', source),
		output: {
			filename,
			pageSize: 'A4',
			margin: requiredString(output.margin, 'output.margin', source),
		},
	}
}

async function loadProfile(root: string): Promise<Profile> {
	const { data, source } = await readYaml(root, 'content/profile.yaml')
	const contact = sourceRecord(data.contact, source)

	return {
		name: requiredString(data.name, 'name', source),
		title: requiredString(data.title, 'title', source),
		location: optionalString(data.location, 'location', source),
		contact: {
			email: requiredString(contact.email, 'contact.email', source),
			phone: optionalString(contact.phone, 'contact.phone', source),
			links: contactLinks(contact.links, 'contact.links', source),
		},
	}
}

async function markdownFiles(root: string, relativeDirectory: string): Promise<string[]> {
	const directory = path.join(root, relativeDirectory)
	try {
		const entries: Dirent[] = await readdir(directory, { withFileTypes: true })
		return entries
			.filter((entry: Dirent) => entry.isFile() && entry.name.endsWith('.md'))
			.map((entry: Dirent) => path.join(directory, entry.name))
			.sort()
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
		throw error
	}
}

function itemId(sourcePath: string): string {
	return path.basename(sourcePath, '.md')
}

async function loadExperience(root: string): Promise<Experience[]> {
	const files = await markdownFiles(root, 'content/experience')
	const items = await Promise.all(
		files.map(async (sourcePath: string) => {
			const source = path.relative(root, sourcePath)
			const parsed = matter(await readFile(sourcePath, 'utf8'))
			const data = sourceRecord(parsed.data, source)

			return {
				id: itemId(sourcePath),
				company: requiredString(data.company, 'company', source),
				role: requiredString(data.role, 'role', source),
				location: optionalString(data.location, 'location', source),
				start: requiredString(data.start, 'start', source),
				end: optionalString(data.end, 'end', source),
				stack: stringList(data.stack, 'stack', source),
				order: optionalNumber(data.order, 'order', source),
				pageBreakBefore: optionalBoolean(data.pageBreakBefore, 'pageBreakBefore', source),
				bodyHtml: renderMarkdown(requiredString(parsed.content, 'Markdown body', source)),
			}
		}),
	)

	return items.sort(
		(first, second) => second.order - first.order || first.id.localeCompare(second.id),
	)
}

async function loadProjects(root: string): Promise<Project[]> {
	const files = await markdownFiles(root, 'content/projects')
	const items = await Promise.all(
		files.map(async (sourcePath: string) => {
			const source = path.relative(root, sourcePath)
			const parsed = matter(await readFile(sourcePath, 'utf8'))
			const data = sourceRecord(parsed.data, source)

			return {
				id: itemId(sourcePath),
				name: requiredString(data.name, 'name', source),
				url: optionalString(data.url, 'url', source),
				stack: stringList(data.stack, 'stack', source),
				order: optionalNumber(data.order, 'order', source),
				pageBreakBefore: optionalBoolean(data.pageBreakBefore, 'pageBreakBefore', source),
				bodyHtml: renderMarkdown(requiredString(parsed.content, 'Markdown body', source)),
			}
		}),
	)

	return items.sort(
		(first, second) => second.order - first.order || first.id.localeCompare(second.id),
	)
}

async function loadSkills(root: string): Promise<SkillGroup[]> {
	const { data, source } = await readYaml(root, 'content/skills.yaml')
	if (!Array.isArray(data.groups)) {
		throw new Error(`${source}: groups must be a list`)
	}

	return data.groups.map((group, index) => {
		const value = sourceRecord(group, source)
		return {
			name: requiredString(value.name, `groups.${index}.name`, source),
			items: stringList(value.items, `groups.${index}.items`, source),
		}
	})
}

export async function loadResume(root: string): Promise<Resume> {
	const [config, profile, summaryHtml, experience, projects, skills, educationHtml] =
		await Promise.all([
			loadConfig(root),
			loadProfile(root),
			readOptionalMarkdown(root, 'content/summary.md'),
			loadExperience(root),
			loadProjects(root),
			loadSkills(root),
			readOptionalMarkdown(root, 'content/education.md'),
		])

	if (!summaryHtml) {
		throw new Error('content/summary.md: summary is required')
	}

	return { config, profile, summaryHtml, experience, projects, skills, educationHtml }
}
