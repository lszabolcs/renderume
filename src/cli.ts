import path from 'node:path'
import { Command } from 'commander'
import { build } from './build.js'
import { initialize } from './init.js'
import { startPreview } from './preview.js'
import { validate } from './validate.js'
import { startWatch } from './watch.js'

const program = new Command()
	.name('renderume')
	.description('Renderume — a local-first résumé renderer for developers')
	.version('0.1.0')

program
	.command('init <directory>')
	.description('create a starter CV project')
	.option('-t, --template <name>', 'starter template to copy', 'default')
	.action(async (directory, options) => {
		const target = path.resolve(process.cwd(), directory)
		await initialize(target, options.template)
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
	.command('watch [directory]')
	.description('serve local HTML/PDF previews and rebuild them when sources change')
	.action(async (directory = '.') => {
		const root = path.resolve(process.cwd(), directory)
		const output = await build(root)
		const preview = await startPreview(output.htmlPath, output.pdfPath)
		console.log(`✓ HTML preview (live reload): ${preview.htmlUrl}`)
		console.log(`✓ PDF preview:  ${preview.pdfUrl}`)
		await startWatch(root, {
			initialBuild: false,
			onChange: (sourcePath) => {
				console.log(`↻ Changed ${path.relative(root, sourcePath)}`)
			},
			onResult: ({ output, succeeded }) => {
				process.stdout.write(output)
				if (succeeded) {
					preview.reload()
				} else {
					preview.showError(output.trim())
				}
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
