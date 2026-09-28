import { Command } from 'commander'

const program = new Command()
	.name('cv')
	.description('Renderume — a local-first résumé renderer for developers')
	.version('0.0.0')

await program.parseAsync()
