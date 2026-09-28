import path from 'node:path'
import { Command } from 'commander'
import { buildHtml } from './build.js'

const program = new Command()
	.name('cv')
	.description('Renderume — a local-first résumé renderer for developers')
	.version('0.0.0')

program
	.command('build [directory]')
	.description('compile Markdown content to static HTML')
	.action(async (directory = '.') => {
		const outputPath = await buildHtml(path.resolve(process.cwd(), directory))
		console.log(`✓ Wrote ${outputPath}`)
	})

await program.parseAsync()
