import { loadResume } from './load-resume.js'

export async function validate(root: string): Promise<void> {
	await loadResume(root)
}
