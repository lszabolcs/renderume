import path from 'node:path'
import { Command } from 'commander'
import { build } from './build.js'

const program = new Command()
	.name('cv')
	.description('Renderume — a local-first résumé renderer for developers')
	.version('0.0.0')

program
	.command('build [directory]')
	.description('compile Markdown content to static HTML and PDF')
	.action(async (directory = '.') => {
		const output = await build(path.resolve(process.cwd(), directory))
		console.log(`✓ Wrote ${output.htmlPath}`)
		console.log(`✓ Wrote ${output.pdfPath}`)
	})

await program.parseAsync()
