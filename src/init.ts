import { cp, lstat } from 'node:fs/promises'
import path from 'node:path'

const templateRoot = path.resolve(import.meta.dirname, '../templates/default')

async function targetExists(target: string): Promise<boolean> {
	try {
		await lstat(target)
		return true
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
		throw error
	}
}

export async function initialize(target: string): Promise<void> {
	if (await targetExists(target)) {
		throw new Error(`${target}: destination already exists; choose a new directory`)
	}

	await cp(templateRoot, target, { recursive: true, errorOnExist: true, force: false })
}
