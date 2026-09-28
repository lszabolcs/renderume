import path from 'node:path'
import { Command } from 'commander'
import { build } from './build.js'
import { initialize } from './init.js'
import { startPreview } from './preview.js'
import { validate } from './validate.js'
import { startWatch } from './watch.js'

const program = new Command()
	.name('cv')
	.description('Renderume — a local-first résumé renderer for developers')
	.version('0.0.0')

program
	.command('init <directory>')
	.description('create a starter CV project')
	.action(async (directory) => {
		const target = path.resolve(process.cwd(), directory)
		await initialize(target)
		console.log(`✓ Created ${target}`)
	})

program
	.command('build [directory]')
	.description('compile Markdown content to static HTML and PDF')
	.action(async (directory = '.') => {
		const output = await build(path.resolve(process.cwd(), directory))
		console.log(`✓ Wrote ${output.htmlPath}`)
		console.log(`✓ Wrote ${output.pdfPath}`)
	})

program
	.command('preview [directory]')
	.description('build a CV and serve a local A4 preview')
	.action(async (directory = '.') => {
		const output = await build(path.resolve(process.cwd(), directory))
		const preview = await startPreview(output.htmlPath, output.pdfPath)
		console.log(`✓ HTML preview: ${preview.htmlUrl}`)
		console.log(`✓ PDF preview:  ${preview.pdfUrl}`)
	})

program
	.command('watch [directory]')
	.description('rebuild a CV when content, theme, or config files change')
	.action(async (directory = '.') => {
		const root = path.resolve(process.cwd(), directory)
		await startWatch(root, {
			onChange: (sourcePath) => {
				console.log(`↻ Changed ${path.relative(root, sourcePath)}`)
			},
			onResult: ({ output }) => {
				process.stdout.write(output)
			},
		})
		console.log(`✓ Watching ${root}`)
		await new Promise<void>(() => {})
	})

program
	.command('validate [directory]')
	.description('validate CV content without generating output')
	.action(async (directory = '.') => {
		const root = path.resolve(process.cwd(), directory)
		await validate(root)
		console.log(`✓ Validated ${root}`)
	})

try {
	await program.parseAsync()
} catch (error) {
	console.error(`✖ ${error instanceof Error ? error.message : String(error)}`)
	process.exitCode = 1
}
