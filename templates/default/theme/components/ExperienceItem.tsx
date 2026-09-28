// biome-ignore-all lint/security/noDangerouslySetInnerHtml: Renderume parses Markdown with raw HTML disabled before it reaches the theme.
import { KeepTogether } from './KeepTogether.js'

type ExperienceItemProps = {
	bodyHtml: string
	company: string
	end?: string
	location?: string
	pageBreakBefore: boolean
	role: string
	stack: string[]
	start: string
}

function period(start: string, end?: string): string {
	return end ? `${start} — ${end}` : start
}

export function ExperienceItem({
	bodyHtml,
	company,
	end,
	location,
	pageBreakBefore,
	role,
	stack,
	start,
}: ExperienceItemProps) {
	return (
		<KeepTogether className="experience-item" pageBreakBefore={pageBreakBefore}>
			<article>
				<header>
					<strong>{role}</strong>
					<span> · {period(start, end)}</span>
				</header>
				<p>
					{company}
					{location ? ` · ${location}` : ''}
				</p>
				<div className="rich-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
				{stack.length > 0 ? <p className="stack">{stack.join(' · ')}</p> : null}
			</article>
		</KeepTogether>
	)
}
