import { pathToFileURL } from 'node:url'
import * as ReactRuntime from 'react'
import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Resume } from './types.js'

type ThemeProps = {
	cv: Resume
}

type ThemeModule = {
	Resume?: ComponentType<ThemeProps>
	default?: ComponentType<ThemeProps>
}

export async function renderTheme(themePath: string, cv: Resume): Promise<string> {
	;(globalThis as typeof globalThis & { React?: typeof ReactRuntime }).React ??= ReactRuntime
	const theme = (await import(pathToFileURL(themePath).href)) as ThemeModule
	const ResumeComponent = theme.Resume ?? theme.default

	if (typeof ResumeComponent !== 'function') {
		throw new Error(`${themePath} must export a React component named Resume or default`)
	}

	return renderToStaticMarkup(createElement(ResumeComponent, { cv }))
}
