// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the theme.
import { KeepTogether } from './KeepTogether.js'

type ProjectItemProps = {
	bodyHtml: string
	name: string
	pageBreakBefore: boolean
	stack: string[]
	url?: string
}

function linkLabel(url: string): string {
	return url.replace(/^https?:\/\//, '')
}

export function ProjectItem({ bodyHtml, name, pageBreakBefore, stack, url }: ProjectItemProps) {
	return (
		<KeepTogether className="project-item" pageBreakBefore={pageBreakBefore}>
			<article>
				<header>
					<strong>{name}</strong>
					{url ? (
						<span>
							{' · '}
							<a href={url}>{linkLabel(url)}</a>
						</span>
					) : null}
				</header>
				<div className="rich-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
				{stack.length > 0 ? <p className="stack">{stack.join(' · ')}</p> : null}
			</article>
		</KeepTogether>
	)
}
