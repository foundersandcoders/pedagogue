<script lang="ts">
	import { DOMParser as BrowserDOMParser } from '@xmldom/xmldom';

	export let xmlContent: string = '';

	interface Change {
		section: string;
		type: string;
		confidence: 'high' | 'medium' | 'low';
		summary: string;
		rationale: string;
		sources: Array<{ url: string; text: string }>;
	}

	interface GenerationInfo {
		timestamp: string;
		source: string;
		model: string;
	}

	interface ProvenanceInfo {
		aiUpdateCount: number;
		sectionsNeedingReview: string[];
	}

	let changes: Change[] = [];
	let generationInfo: GenerationInfo | null = null;
	let provenanceInfo: ProvenanceInfo | null = null;
	let hasMetadata = false;

	$: if (xmlContent) {
		parseMetadata(xmlContent);
	}

	function parseMetadata(xml: string) {
		try {
			const ParserClass = typeof window !== 'undefined' ? window.DOMParser : BrowserDOMParser;
			const parser = new ParserClass();
			const doc = parser.parseFromString(xml, 'text/xml');

			const metadataSections = doc.getElementsByTagName('Metadata');
			if (metadataSections.length === 0) {
				hasMetadata = false;
				return;
			}

			hasMetadata = true;
			const metadata = metadataSections[0];

			// Parse GenerationInfo
			const genInfoSections = metadata.getElementsByTagName('GenerationInfo');
			if (genInfoSections.length > 0) {
				const genInfo = genInfoSections[0];
				generationInfo = {
					timestamp: getElementText(genInfo, 'Timestamp'),
					source: getElementText(genInfo, 'Source'),
					model: getElementText(genInfo, 'Model')
				};
			}

			// Parse Changelog
			const changelogSections = metadata.getElementsByTagName('Changelog');
			if (changelogSections.length > 0) {
				const changelog = changelogSections[0];
				const changeElements = changelog.getElementsByTagName('Change');

				changes = [];
				for (let i = 0; i < changeElements.length; i++) {
					const changeEl = changeElements[i];

					// Parse sources
					const sources: Array<{ url: string; text: string }> = [];
					const sourceElements = changeEl.getElementsByTagName('Source');
					for (let j = 0; j < sourceElements.length; j++) {
						const sourceEl = sourceElements[j];
						sources.push({
							url: sourceEl.getAttribute('url') || '',
							text: sourceEl.textContent?.trim() || ''
						});
					}

					changes.push({
						section: getElementText(changeEl, 'Section'),
						type: getElementText(changeEl, 'Type'),
						confidence: getElementText(changeEl, 'Confidence').toLowerCase() as 'high' | 'medium' | 'low',
						summary: getElementText(changeEl, 'Summary'),
						rationale: getElementText(changeEl, 'Rationale'),
						sources
					});
				}
			}

			// Parse ProvenanceTracking
			const provenanceSections = metadata.getElementsByTagName('ProvenanceTracking');
			if (provenanceSections.length > 0) {
				const provenance = provenanceSections[0];
				const updateCountText = getElementText(provenance, 'AIUpdateCount');

				const sectionsNeedingReview: string[] = [];
				const reviewSections = provenance.getElementsByTagName('Section');
				for (let i = 0; i < reviewSections.length; i++) {
					const section = reviewSections[i].textContent?.trim();
					if (section) sectionsNeedingReview.push(section);
				}

				provenanceInfo = {
					aiUpdateCount: parseInt(updateCountText) || 1,
					sectionsNeedingReview
				};
			}
		} catch (err) {
			console.error('Error parsing metadata:', err);
			hasMetadata = false;
		}
	}

	function getElementText(parent: Element, tagName: string): string {
		const elements = parent.getElementsByTagName(tagName);
		return elements.length > 0 ? elements[0].textContent?.trim() || '' : '';
	}

	function formatTimestamp(timestamp: string): string {
		try {
			const date = new Date(timestamp);
			return date.toLocaleString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return timestamp;
		}
	}

	function getConfidenceBadgeClass(confidence: string): string {
		switch (confidence) {
			case 'high': return 'confidence-high';
			case 'medium': return 'confidence-medium';
			case 'low': return 'confidence-low';
			default: return '';
		}
	}

	function getTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			'content_update': 'Updated',
			'examples_expanded': 'Examples Added',
			'new_content': 'New Content',
			'removed': 'Removed',
			'reordered': 'Reordered'
		};
		return labels[type] || type;
	}
</script>

{#if hasMetadata}
	<div class="changelog-viewer">
		<div class="changelog-header">
			<h4>📝 Change Summary</h4>
			{#if generationInfo}
				<div class="generation-info">
					<span class="info-badge">{generationInfo.source}</span>
					<span class="info-text">{formatTimestamp(generationInfo.timestamp)}</span>
				</div>
			{/if}
		</div>

		{#if changes.length > 0}
			<div class="changes-list">
				{#each changes as change}
					<div class="change-item">
						<div class="change-header">
							<div class="change-badges">
								<span class="type-badge">{getTypeLabel(change.type)}</span>
								<span class="confidence-badge {getConfidenceBadgeClass(change.confidence)}">
									{change.confidence} confidence
								</span>
							</div>
							<span class="change-section">{change.section}</span>
						</div>

						<div class="change-content">
							<p class="change-summary"><strong>{change.summary}</strong></p>
							{#if change.rationale}
								<p class="change-rationale">{change.rationale}</p>
							{/if}

							{#if change.sources && change.sources.length > 0}
								<div class="change-sources">
									<span class="sources-label">Sources:</span>
									<ul>
										{#each change.sources as source}
											<li>
												{#if source.url}
													<a href={source.url} target="_blank" rel="noopener noreferrer">
														{source.text || source.url}
													</a>
												{:else}
													{source.text}
												{/if}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="no-changes">No significant changes documented</p>
		{/if}

		{#if provenanceInfo && provenanceInfo.sectionsNeedingReview.length > 0}
			<div class="needs-review">
				<h5>⚠️ Sections Requiring Human Review</h5>
				<ul>
					{#each provenanceInfo.sectionsNeedingReview as section}
						<li>{section}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}

<style>
	.changelog-viewer {
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.changelog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #dee2e6;
	}

	.changelog-header h4 {
		margin: 0;
		font-size: 1.1rem;
		color: #333;
	}

	.generation-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.85rem;
	}

	.info-badge {
		background: #007bff;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-weight: 600;
		font-size: 0.75rem;
	}

	.info-text {
		color: #6c757d;
	}

	.changes-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.change-item {
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		padding: 1rem;
	}

	.change-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.change-badges {
		display: flex;
		gap: 0.5rem;
	}

	.type-badge {
		background: #6c757d;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.confidence-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.confidence-high {
		background: #d4edda;
		color: #155724;
	}

	.confidence-medium {
		background: #fff3cd;
		color: #856404;
	}

	.confidence-low {
		background: #f8d7da;
		color: #721c24;
	}

	.change-section {
		font-family: 'SF Mono', Consolas, monospace;
		font-size: 0.8rem;
		color: #6c757d;
	}

	.change-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.change-summary {
		margin: 0;
		color: #333;
		font-size: 0.95rem;
	}

	.change-rationale {
		margin: 0;
		color: #495057;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.change-sources {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid #e9ecef;
	}

	.sources-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #6c757d;
	}

	.change-sources ul {
		margin: 0.25rem 0 0 0;
		padding-left: 1.5rem;
	}

	.change-sources li {
		font-size: 0.85rem;
		color: #495057;
		margin-bottom: 0.25rem;
	}

	.change-sources a {
		color: #007bff;
		text-decoration: none;
	}

	.change-sources a:hover {
		text-decoration: underline;
	}

	.no-changes {
		text-align: center;
		color: #6c757d;
		padding: 2rem;
		margin: 0;
	}

	.needs-review {
		margin-top: 1rem;
		padding: 1rem;
		background: #fff3cd;
		border: 1px solid #ffc107;
		border-radius: 6px;
	}

	.needs-review h5 {
		margin: 0 0 0.5rem 0;
		color: #856404;
		font-size: 0.95rem;
	}

	.needs-review ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.needs-review li {
		color: #856404;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
		font-family: 'SF Mono', Consolas, monospace;
	}
</style>
