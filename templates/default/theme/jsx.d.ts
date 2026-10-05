/**
 * Keeps TSX editable when this standalone CV directory is opened directly in
 * an editor. Renderume provides React at build time, so this file deliberately
 * supplies only the minimal editor-facing JSX contract.
 */
declare namespace JSX {
	type Element = unknown

	interface IntrinsicAttributes {
		key?: string | number
	}

	interface IntrinsicElements {
		[elementName: string]: Record<string, unknown>
	}
}

declare module 'react/jsx-runtime' {
	export namespace JSX {
		type Element = unknown

		interface IntrinsicAttributes {
			key?: string | number
		}

		interface IntrinsicElements {
			[elementName: string]: Record<string, unknown>
		}
	}

	export const Fragment: symbol
	export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element
	export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element
}
