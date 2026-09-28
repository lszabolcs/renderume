import type { ReactNode } from 'react'

type KeepTogetherProps = {
	children: ReactNode
	className?: string
	pageBreakBefore?: boolean
}

export function KeepTogether({ children, className, pageBreakBefore = false }: KeepTogetherProps) {
	const classNames = ['keep-together', className, pageBreakBefore ? 'page-break-before' : undefined]
		.filter(Boolean)
		.join(' ')

	return <div className={classNames}>{children}</div>
}
