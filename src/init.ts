import { cp, lstat } from 'node:fs/promises'
import path from 'node:path'

const templatesRoot = path.resolve(import.meta.dirname, '../templates')
const templateNames = ['default', 'sidebar'] as const

export type TemplateName = (typeof templateNames)[number]

function resolveTemplate(template: string): string {
	if (!templateNames.includes(template as TemplateName)) {
		throw new Error(
			`unknown template "${template}"; available templates: ${templateNames.join(', ')}`,
		)
	}

	return path.join(templatesRoot, template)
}

async function targetExists(target: string): Promise<boolean> {
	try {
		await lstat(target)
		return true
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
		throw error
	}
}

export async function initialize(target: string, template = 'default'): Promise<void> {
	if (await targetExists(target)) {
		throw new Error(`${target}: destination already exists; choose a new directory`)
	}

	await cp(resolveTemplate(template), target, { recursive: true, errorOnExist: true, force: false })
}
