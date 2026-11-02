import { lazy, Suspense, useEffect, useState, useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import HeroBanner from '../../components/common/HeroBanner'
import QuickLinkManageContent from '../../components/popup/QuickLinkManageContent'
import ReferenceManageContent from '../../components/popup/ReferenceManageContent'
import ResourceContent from '../../components/table/ResourceContent'
import SectionManageContent from '../../components/popup/SectionManageContent'
import SearchBar from '../../components/search/SearchBar'
import Sidebar from '../../components/layout/Sidebar'
import { useQuickLinks, type QuickLinkCategory, type QuickLinkSubcategory } from '../../hooks/useQuickLinks'
import { useReferences } from '../../hooks/useReferences'
import { useUserRole } from '../../hooks/useUserRole'
import type { UserRole } from '../../services/roleService'
import { Cp_qlsubcategoriesesService } from '../../generated/services/Cp_qlsubcategoriesesService'
import { Cp_qlmastersesService } from '../../generated/services/Cp_qlmastersesService'
import { Cp_refitemsesService } from '../../generated/services/Cp_refitemsesService'
import { Cp_refsubcategoriesesService } from '../../generated/services/Cp_refsubcategoriesesService'
import { Cp_refmastersesService } from '../../generated/services/Cp_refmastersesService'
import type { Cp_refitemses } from '../../generated/models/Cp_refitemsesModel'
import type {
	ReferenceCategory,
	ReferenceMasterDraft,
	ReferenceSubcategory,
} from '../../hooks/useReferences'
import type { ManageListItem } from '../../components/popup/SectionManageContent'
import { sidebarData } from '../../data/sidebarData'
import type { ContentItem } from '../../data/contentData'
import { AboutUsPage } from '../about-us/AboutUsPage'
import Home from './Home'
import './HomePage.css'

const AuditverseMainApp = lazy(() => import('../about-us/AboutUsPage'))

const AUDITVERSE_MAIN_HASH_PREFIX = '#/auditverse-main'

const isAuditverseMainHash = (hash: string) =>
	hash.toLowerCase().startsWith(AUDITVERSE_MAIN_HASH_PREFIX)

type ReferenceHashTarget = {
	categoryName: string
	subcategoryName: string
}

const parseReferenceHash = (hash: string): ReferenceHashTarget | null => {
	const trimmedHash = hash.trim()
	if (!trimmedHash.startsWith('#')) return null
	const hashPath = trimmedHash.slice(1).replace(/^\//, '')
	const segments = hashPath.split('/').filter(Boolean)
	if (segments.length < 3) return null
	if (segments[0].toLowerCase() !== 'references') return null
	const categoryName = decodeURIComponent(segments[1] ?? '').trim()
	const subcategoryName = decodeURIComponent(segments[2] ?? '').trim()
	if (!categoryName || !subcategoryName) return null
	return { categoryName, subcategoryName }
}

type ManageSection =
	| 'quickLinks'
	| 'references'
	| null

type ManageCategorySection =
	| 'quickLinks'
	| 'references'
	| null

type ManageLevel =
	| 'section'
	| 'category'
	| null


interface SearchLocalResult {
	id: string
	breadcrumb: string[]
	title: string
	description: string
	url: string
	type: 'LINK' | 'FOLDER' | 'FILE' | 'AREA'
}

interface SearchWebResult {
	domain: string
	title: string
	description: string
	publisher: string
	url: string
}

interface SearchResultsViewProps {
	query: string
	searchInput: string
	results: SearchLocalResult[]
	webResults: SearchWebResult[]
	onSearchChange: (value: string) => void
	onSearchSubmit: (value: string) => void
}

const ExternalLinkIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M15 3h6v6" />
		<path d="M10 14 21 3" />
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
	</svg>
)

const SearchWithClear = ({
	searchTerm,
	onSearchChange,
	onSearchSubmit,
	className = '',
}: {
	searchTerm: string
	onSearchChange: (value: string) => void
	onSearchSubmit?: (value: string) => void
	className?: string
}) => (
	<div className={`search-with-clear ${className}`.trim()}>
		<style>{`
			.search-with-clear {
				position: relative;
			}

			.search-with-clear > .search-bar,
			.search-with-clear > .hero-search {
				width: 100%;
				margin-left: 0;
				margin-right: 0;
				box-shadow: none !important;
			}

			.search-with-clear > .search-bar:focus-within,
			.search-with-clear > .hero-search:focus-within {
				box-shadow: none !important;
			}

			/* Hide the browser's separate native search clear icon. */
			.search-with-clear input[type="search"] {
				-webkit-appearance: none;
				appearance: none;
			}

			.search-with-clear input[type="search"]::-webkit-search-cancel-button,
			.search-with-clear input[type="search"]::-webkit-search-decoration {
				-webkit-appearance: none;
				appearance: none;
				display: none;
			}

			.search-with-clear .search-clear-button {
				appearance: none !important;
				-webkit-appearance: none !important;
				outline: none !important;
				box-shadow: none !important;
			}

			.search-with-clear .search-clear-button:focus,
			.search-with-clear .search-clear-button:focus-visible,
			.search-with-clear .search-clear-button:active,
			.search-with-clear .search-clear-button:hover:active,
			.search-with-clear .search-clear-button:hover:focus {
				border: 1px solid #fca5a5 !important;
				border-color: #fca5a5 !important;
				outline: none !important;
				box-shadow: none !important;
			}
		`}</style>

		<SearchBar
			searchTerm={searchTerm}
			onSearchChange={onSearchChange}
			onSearchSubmit={onSearchSubmit}
			onClear={() => {
				onSearchChange('')
				onSearchSubmit?.('')
			}}
		/>
	</div>
)

const highlightMatch = (text: string, term: string): React.ReactNode => {
	if (!text || !term.trim()) return text
	const words = term
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
	if (words.length === 0) return text
	const splitRegex = new RegExp(`(${words.join('|')})`, 'gi')
	const testRegex = new RegExp(`^(?:${words.join('|')})$`, 'i')
	const parts = text.split(splitRegex)
	if (parts.length <= 1) return text
	return parts.map((part, index) =>
		testRegex.test(part) ? (
			<mark key={index} className="search-highlight">
				{part}
			</mark>
		) : (
			part
		),
	)
}

const SearchResultsView = ({
	query,
	searchInput,
	results,
	webResults,
	onSearchChange,
	onSearchSubmit,
}: SearchResultsViewProps) => {
	const trimmedQuery = query.trim()
	const highlightTerm = (searchInput || query).trim()

	const quickLinkResults = results.filter(
		(result) => result.id.startsWith('ql-') || result.breadcrumb[0] === 'Quick Links',
	)
	const referenceResults = results.filter(
		(result) => !result.id.startsWith('ql-') && result.breadcrumb[0] !== 'Quick Links',
	)

	const quickLinkAreaCount = new Set(
		quickLinkResults.map((result) => result.breadcrumb.join(' / ')),
	).size
	const referenceAreaCount = new Set(
		referenceResults.map((result) => result.breadcrumb.join(' / ')),
	).size

	const [cursorTooltip, setCursorTooltip] = useState<{
		text: string
		x: number
		y: number
		isWeb?: boolean
	} | null>(null)

	const updateTooltipPos = (e: React.MouseEvent, text?: string, isWeb?: boolean) => {
		const targetIsWeb = isWeb ?? cursorTooltip?.isWeb ?? false
		const maxTooltipWidth = targetIsWeb ? 420 : 380
		let left = e.clientX + 14
		if (left + maxTooltipWidth > window.innerWidth - 10) {
			left = Math.max(10, window.innerWidth - maxTooltipWidth - 10)
		}
		let top = e.clientY + 10
		if (top + 80 > window.innerHeight) {
			top = Math.max(10, e.clientY - 60)
		}
		setCursorTooltip((prev) => ({
			text: text ?? prev?.text ?? '',
			x: left,
			y: top,
			isWeb: targetIsWeb,
		}))
	}

	const handleCardMouseEnter = (e: React.MouseEvent, text: string, isWeb = false) => {
		updateTooltipPos(e, text, isWeb)
	}

	const handleCardMouseMove = (e: React.MouseEvent, isWeb = false) => {
		updateTooltipPos(e, undefined, isWeb)
	}

	const handleCardMouseLeave = () => {
		setCursorTooltip(null)
	}

	const renderSectionCards = (items: SearchLocalResult[], badgeLabel: string) =>
		items.map((result) => {
			const cardTooltip = [
				result.breadcrumb.join('/'),
				result.title,
				result.description,
				badgeLabel,
			]
				.filter(Boolean)
				.join(' - ')

			const cardContent = (
				<>
					<div className="search-results-breadcrumb card-breadcrumb card-url">
						<ExternalLinkIcon />
						<span className="search-results-breadcrumb-text">
							{result.breadcrumb.map((part, index) => (
								<span key={`${part}-${index}`}>
									{index > 0 && (
										<span className="search-results-breadcrumb-separator">
											/
										</span>
									)}
									{highlightMatch(part, highlightTerm)}
								</span>
							))}
						</span>
					</div>

					<h4 className="search-results-card-title card-title">
						{highlightMatch(result.title, highlightTerm)}
					</h4>

					{result.description && (
						<p className="search-results-card-description card-description">
							{highlightMatch(result.description, highlightTerm)}
						</p>
					)}

					<div className="search-results-meta">
						<span className="search-results-type badge tag-pill">
							{badgeLabel}
						</span>
					</div>
				</>
			)

			return result.url ? (
				<a
					key={result.id}
					href={result.url}
					target="_blank"
					rel="noreferrer"
					className="search-results-card search-result-card"
					onMouseEnter={(e) => handleCardMouseEnter(e, cardTooltip)}
					onMouseMove={handleCardMouseMove}
					onMouseLeave={handleCardMouseLeave}
				>
					{cardContent}
				</a>
			) : (
				<div
					key={result.id}
					className="search-results-card search-result-card"
					onMouseEnter={(e) => handleCardMouseEnter(e, cardTooltip)}
					onMouseMove={handleCardMouseMove}
					onMouseLeave={handleCardMouseLeave}
				>
					{cardContent}
				</div>
			)
		})

	return (
		<div className="search-results-view">
			<style>{`
				.search-results-view {
					min-height: 100svh;
					background: #f7f6f5;
					color: #263650;
				}

				.search-results-hero {
					position: relative;
					min-height: 124px;
					padding: 25px 22px 20px;
					box-sizing: border-box;
					overflow: hidden;
					background:
						linear-gradient(90deg, rgba(13, 28, 50, 0.98) 0%, rgba(7, 41, 60, 0.97) 58%, rgba(5, 53, 72, 0.94) 100%);
					color: #ffffff;
				}

				.search-results-hero-copy {
					position: relative;
					z-index: 2;
					max-width: 620px;
				}

				.search-results-kicker {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 9px;
					color: #f04b59;
					font-size: 16px;
					font-weight: 700;
					letter-spacing: 0.55px;
					text-transform: uppercase;
				}

				.search-results-kicker-line {
					display: inline-block;
					width: 18px;
					height: 2px;
					background: #ed1b24;
					flex: 0 0 auto;
				}

				.search-results-hero h1 {
					margin: 0;
					color: #ffffff;
					font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
					font-size: 21px;
					font-weight: 600;
					line-height: 1.1;
				}

				.search-results-hero p {
					margin: 7px 0 0;
					color: #d4dbe7;
					font-size: 10px;
					line-height: 1.3;
				}

				.search-results-network {
					position: absolute;
					right: 0;
					top: -10px;
					width: 68%;
					height: 145px;
					opacity: 0.34;
					background:
						radial-gradient(circle at 10% 28%, rgba(139, 171, 202, 0.9) 0 2px, transparent 3px),
						radial-gradient(circle at 27% 58%, rgba(139, 171, 202, 0.9) 0 2px, transparent 3px),
						radial-gradient(circle at 49% 23%, rgba(139, 171, 202, 0.9) 0 2px, transparent 3px),
						radial-gradient(circle at 70% 68%, rgba(139, 171, 202, 0.9) 0 2px, transparent 3px),
						radial-gradient(circle at 88% 32%, rgba(139, 171, 202, 0.9) 0 2px, transparent 3px),
						linear-gradient(24deg, transparent 49.6%, rgba(111, 149, 187, 0.9) 50%, transparent 50.5%),
						linear-gradient(154deg, transparent 49.6%, rgba(111, 149, 187, 0.9) 50%, transparent 50.5%);
				}

				.search-results-network::before,
				.search-results-network::after {
					content: '';
					position: absolute;
					inset: 0;
					background:
						linear-gradient(23deg, transparent 49.8%, rgba(96, 137, 177, 0.55) 50%, transparent 50.3%),
						linear-gradient(157deg, transparent 49.8%, rgba(96, 137, 177, 0.55) 50%, transparent 50.3%);
				}

				.search-results-search-wrap {
					padding: 24px 22px 0;
					box-sizing: border-box;
				}

				.search-results-search-wrap .search-with-clear {
					padding: 0;
					margin: 0;
				}

				.search-results-search-wrap .search-bar {
					width: 100%;
					height: 36px !important;
					min-height: 36px !important;
					max-height: 36px !important;
					margin: 0;
					border: 1px solid #e9d4ff;
					border-radius: 8px !important;
					box-shadow: none;
					background: #ffffff;
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 0 8px 0 5px;
					box-sizing: border-box;
				}

				.search-results-search-wrap .hero-search__submit,
				.search-results-search-wrap .search-badge-btn,
				.search-results-search-wrap .search-icon-box {
					width: 28px !important;
					height: 28px !important;
					min-width: 28px !important;
					border-radius: 6px !important;
					background: linear-gradient(315deg, #5a0994 0%, #0f68b2 62%);
					flex: 0 0 28px !important;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					padding: 0;
					border: none;
				}

				.search-results-search-wrap .search-badge-btn svg,
				.search-results-search-wrap .search-icon-box .icon {
					width: 15px !important;
					height: 15px !important;
				}

				.search-results-search-wrap .search-bar input {
					height: 34px !important;
					font-size: 14px !important;
					padding: 0 10px !important;
					color: #312c2a !important;
					flex: 1;
					min-width: 0;
				}

				.search-results-search-wrap .search-clear-button {
					position: relative;
					height: 24px !important;
					padding: 0 8px !important;
					font-size: 12px !important;
					border: 1px solid #d5cfc9 !important;
					border-radius: 12px !important;
					background-color: #ffffff !important;
					color: #6e6259 !important;
					flex-shrink: 0;
					transition: all 0.15s ease;
				}

				.search-results-search-wrap .search-clear-button .search-clear-icon {
					display: inline-flex !important;
					align-items: center !important;
					justify-content: center !important;
					line-height: 1 !important;
					flex-shrink: 0 !important;
					font-size: 14px !important;
				}

				.search-results-search-wrap .search-clear-button .search-clear-icon svg {
					width: 13px !important;
					height: 13px !important;
					stroke-width: 2.5 !important;
					stroke: currentColor !important;
					display: block !important;
				}

				.search-results-search-wrap .search-clear-button:hover {
					background-color: #ffffff !important;
					background: #ffffff !important;
					color: #eb1700 !important;
					border-color: #fca5a5 !important;
				}

				.search-results-search-wrap .search-clear-button:focus,
				.search-results-search-wrap .search-clear-button:focus-visible,
				.search-results-search-wrap .search-clear-button:active,
				.search-results-search-wrap .search-clear-button:hover:active,
				.search-results-search-wrap .search-clear-button:hover:focus {
					border: 1px solid #fca5a5 !important;
					border-color: #fca5a5 !important;
					outline: none !important;
					box-shadow: none !important;
				}

				.search-results-search-wrap .search-clear-button .search-clear-text,
				.search-results-search-wrap .search-clear-button span:not(.nav-tooltip):not(.nav-tooltip-box) {
					color: inherit !important;
					font-size: 12px !important;
				}

				.search-results-search-wrap .search-clear-button .nav-tooltip,
				.search-results-search-wrap .search-clear-button:hover .nav-tooltip {
					position: absolute !important;
					top: calc(100% + 4px) !important;
					left: 50% !important;
					transform: none !important;
					color: #111827 !important;
					-webkit-text-fill-color: #111827 !important;
					background-color: #FFFFFF !important;
					border: 1px solid #111827 !important;
				}

				.search-results-search-wrap .ai-badge-btn {
					height: 24px !important;
					padding: 2px 8px !important;
					font-size: 11px !important;
					border-radius: 5px;
					flex-shrink: 0;
				}

				.search-results-main {
					padding: 16px 22px 50px;
					box-sizing: border-box;
				}

				.search-results-section {
					margin: 0 0 21px;
				}

				.search-results-section-title {
					display: flex;
					align-items: baseline;
					gap: 5px;
					font-size: 16px !important;
					font-weight: 600 !important;
					color: #312c2a !important;
					margin: 16px 0 2px 0 !important;
				}

				.search-results-section-title span {
					font-size: 16px !important;
					font-weight: 600 !important;
					color: #eb1700 !important;
				}

				.search-results-section-subtitle {
					font-size: 12px !important;
					color: #6e6259 !important;
					margin: 0 0 8px 0 !important;
					line-height: 1.4;
				}

				.search-results-card-list {
					display: flex !important;
					flex-direction: column !important;
					gap: 8px !important;
					width: 100% !important;
				}

				.search-results-card,
				.search-results-card.has-nav-tooltip,
				.search-result-card.has-nav-tooltip {
					position: relative !important;
					display: flex !important;
					flex-direction: column !important;
					align-items: flex-start !important;
					justify-content: flex-start !important;
					text-align: left !important;
					height: auto !important;
					min-height: auto !important;
					padding: 10px 14px !important;
					box-sizing: border-box;
					border: 1px solid #d5cfc9 !important;
					border-radius: 8px !important;
					background: #ffffff;
					text-decoration: none;
					color: inherit;
					transition: border-color 120ms ease, background-color 120ms ease;
				}

				.search-results-card:hover,
				.search-result-card:hover {
					z-index: 20 !important;
					border-color: #fca5a5 !important;
					background-color: #fef2f1 !important;
					background: #fef2f1 !important;
				}

				.search-result-cursor-tooltip {
					position: fixed !important;
					display: block !important;
					opacity: 1 !important;
					visibility: visible !important;
					background-color: #FFFFFF !important;
					color: #111827 !important;
					-webkit-text-fill-color: #111827 !important;
					font-size: 12px !important;
					font-weight: 400 !important;
					line-height: 1.4 !important;
					max-width: 420px !important;
					white-space: normal !important;
					word-break: break-word !important;
					overflow-wrap: break-word !important;
					padding: 4px 8px !important;
					border: 1px solid #111827 !important;
					border-radius: 0px !important;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
					z-index: 99999 !important;
					pointer-events: none !important;
					transform: none !important;
				}

				.search-result-cursor-tooltip-web {
					max-width: 420px !important;
					white-space: normal !important;
					word-break: break-word !important;
					overflow-wrap: break-word !important;
					line-height: 1.4 !important;
				}

				.search-results-card .nav-tooltip,
				.search-results-card .nav-tooltip-box,
				.search-result-card .nav-tooltip,
				.search-result-card .nav-tooltip-box {
					position: absolute !important;
					top: calc(100% + 4px) !important;
					right: 16px !important;
					left: auto !important;
					transform: none !important;
					background-color: #FFFFFF !important;
					color: #111827 !important;
					-webkit-text-fill-color: #111827 !important;
					font-size: 12px !important;
					font-weight: 400 !important;
					line-height: 1.2 !important;
					white-space: nowrap !important;
					padding: 4px 8px !important;
					border: 1px solid #111827 !important;
					border-radius: 0px !important;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
					z-index: 1000 !important;
					pointer-events: none !important;
					opacity: 0;
					visibility: hidden;
					transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out;
				}

				.search-results-card:hover .nav-tooltip,
				.search-results-card:hover .nav-tooltip-box,
				.search-result-card:hover .nav-tooltip,
				.search-result-card:hover .nav-tooltip-box,
				.search-results-card.has-nav-tooltip:hover .nav-tooltip,
				.search-results-card.has-nav-tooltip:hover .nav-tooltip-box {
					opacity: 1 !important;
					visibility: visible !important;
					color: #111827 !important;
					-webkit-text-fill-color: #111827 !important;
					background-color: #FFFFFF !important;
					border: 1px solid #111827 !important;
				}

				.search-results-breadcrumb {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-bottom: 2px !important;
					color: #6e6259 !important;
					font-size: 12px !important;
					line-height: 1.3;
				}

				.search-results-breadcrumb svg {
					color: #ed1b24;
					width: 12px;
					height: 12px;
					flex: 0 0 auto;
				}

				.search-results-breadcrumb-text {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					color: #6e6259 !important;
					font-size: 12px !important;
				}

				.search-results-breadcrumb-separator {
					padding: 0 3px;
					color: #6e6259 !important;
				}

				.search-results-card-title {
					margin: 0 0 4px 0 !important;
					color: #eb1700 !important;
					font-size: 16px !important;
					font-weight: 600 !important;
					line-height: 1.3 !important;
				}

				.search-results-card-description {
					margin: 0 0 6px 0 !important;
					color: #6e6259 !important;
					font-size: 14px !important;
					line-height: 1.35 !important;
				}

				.search-results-meta {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-top: 4px;
					color: #6e6259 !important;
					font-size: 11px !important;
				}

				.search-results-type {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: 18px !important;
					padding: 1px 6px !important;
					box-sizing: border-box;
					border: 1px solid #d5cfc9 !important;
					border-radius: 3px !important;
					background: #f9f8f7 !important;
					color: #6e6259 !important;
					font-size: 10px !important;
					font-weight: 500;
					line-height: 18px !important;
				}

				.search-results-empty {
					padding: 15px;
					border: 1px solid #d8d2cd;
					border-radius: 4px;
					background: #ffffff;
					color: #77716e;
					font-size: 11px;
				}

				.search-results-web-card .search-results-domain {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-bottom: 3px;
					color: #ed1b24;
					font-size: 8px;
				}

				.search-results-web-card .search-results-domain svg {
					width: 11px;
					height: 11px;
				}

				.search-results-web-card .search-results-card-title {
					font-size: 10.5px;
				}

				.search-results-web-card .search-results-card-description {
					font-size: 9px;
				}

				.search-results-web-note {
					margin-top: 5px;
					color: #9a9794;
					font-size: 8px;
				}

				@media (max-width: 700px) {
					.search-results-hero {
						padding: 22px 14px 18px;
					}

					.search-results-search-wrap,
					.search-results-main {
						padding-left: 14px;
						padding-right: 14px;
					}

					.search-results-network {
						width: 80%;
					}
				}

				mark.search-highlight,
				.search-highlight {
					background-color: #eb170024 !important;
					color: inherit !important;
					padding: 0 1px !important;
					border-radius: 2px !important;
				}
			`}</style>

			<section className="search-results-hero">
				<div className="search-results-hero-copy">
					<div className="search-results-kicker">
						<span className="search-results-kicker-line" />
						<span>GLOBAL AUDIT AND ASSURANCE</span>
					</div>

					<h1>Search Results</h1>

					<p>Showing results for “{trimmedQuery}”</p>
				</div>

				<div className="search-results-network" aria-hidden="true" />
			</section>

			<div className="search-results-search-wrap">
				<SearchWithClear
					searchTerm={searchInput}
					onSearchChange={onSearchChange}
					onSearchSubmit={onSearchSubmit}
				/>
			</div>

			<main className="search-results-main">
				{/* 1. Quick Link Section */}
				{quickLinkResults.length > 0 && (
					<section className="search-results-section search-section-header">
						<h3 className="search-results-section-title">
							Quick Link <span>({quickLinkResults.length})</span>
						</h3>

						<p className="search-results-section-subtitle subtitle search-section-subtitle">
							{quickLinkResults.length} result{quickLinkResults.length === 1 ? '' : 's'} across{' '}
							{quickLinkAreaCount} area{quickLinkAreaCount === 1 ? '' : 's'} for “{trimmedQuery}”
						</p>

						<div className="search-results-card-list search-results-list">
							{renderSectionCards(quickLinkResults, 'Link')}
						</div>
					</section>
				)}

				{/* 2. Reference Section */}
				{(referenceResults.length > 0 || (quickLinkResults.length === 0 && results.length === 0)) && (
					<section className="search-results-section search-section-header">
						<h3 className="search-results-section-title">
							Reference <span>({referenceResults.length})</span>
						</h3>

						<p className="search-results-section-subtitle subtitle search-section-subtitle">
							{referenceResults.length} result{referenceResults.length === 1 ? '' : 's'} across{' '}
							{referenceAreaCount} area{referenceAreaCount === 1 ? '' : 's'} for “{trimmedQuery}”
						</p>

						<div className="search-results-card-list search-results-list">
							{referenceResults.length === 0 ? (
								<div className="search-results-empty">
									No matching results found for “{trimmedQuery}”.
								</div>
							) : (
								renderSectionCards(referenceResults, 'Reference')
							)}
						</div>
					</section>
				)}

				{/* 3. Web Section */}
				<section className="search-results-section search-section-header">
					<h3 className="search-results-section-title">
						Web <span>({webResults.length})</span>
					</h3>

					<p className="search-results-section-subtitle subtitle search-section-subtitle">
						External sources for “{trimmedQuery}” — opened in a new tab.
					</p>

					<div className="search-results-card-list search-results-list">
						{webResults.map((result) => {
							const webTooltip = [
								result.domain,
								result.title,
								result.description,
								result.publisher || 'Web',
							]
								.filter(Boolean)
								.join(' - ')

							return (
								<a
									key={result.domain}
									href={result.url}
									target="_blank"
									rel="noreferrer"
									className="search-results-card search-result-card search-results-web-card"
									onMouseEnter={(e) => handleCardMouseEnter(e, webTooltip, true)}
									onMouseMove={(e) => handleCardMouseMove(e, true)}
									onMouseLeave={handleCardMouseLeave}
								>
									<div className="search-results-domain card-breadcrumb card-url">
										<ExternalLinkIcon />
										<span>{highlightMatch(result.domain, highlightTerm)}</span>
									</div>

									<h4 className="search-results-card-title card-title">
										{highlightMatch(result.title, highlightTerm)}
									</h4>

									<p className="search-results-card-description card-description">
										{highlightMatch(result.description, highlightTerm)}
									</p>

									<div className="search-results-meta">
										<span className="search-results-type badge tag-pill">Web</span>
										<span className="source-label">{highlightMatch(result.publisher, highlightTerm)}</span>
									</div>
								</a>
							)
						})}
					</div>
				</section>
			</main>

			{cursorTooltip && (
				<div
					className={`search-result-cursor-tooltip ${cursorTooltip.isWeb ? 'search-result-cursor-tooltip-web' : ''}`.trim()}
					role="tooltip"
					style={{
						position: 'fixed',
						left: `${cursorTooltip.x}px`,
						top: `${cursorTooltip.y}px`,
						display: 'block',
						opacity: 1,
						visibility: 'visible',
						zIndex: 99999,
						pointerEvents: 'none',
						maxWidth: cursorTooltip.isWeb ? '420px' : '450px',
						whiteSpace: 'normal',
						wordBreak: 'break-word',
						overflowWrap: 'break-word',
						lineHeight: '1.4',
					}}
				>
					{cursorTooltip.text}
				</div>
			)}
		</div>
	)
}


/*
 * Resolve a Reference subcategory selection to its
 * Dataverse record. The preferred identity is the
 * Dataverse GUID. The fallback supports the existing
 * sidebar structure where Reference child nodes may
 * still use static UI ids.
 */
const normalizeReferenceSelectionKey = (value: string | null | undefined) =>
	String(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/&amp;/g, '&')
		.replace(/[^a-z0-9]+/g, '')

const findReferenceStaticChild = (
	nodeId: string,
) => {
	const referenceRoot = sidebarData.find(
		(node) => node.id === 'references',
	)

	const referenceCategories =
		referenceRoot?.children ?? []

	const normalizedNodeId =
		normalizeReferenceSelectionKey(nodeId)

	for (
		let categoryIndex = 0;
		categoryIndex < referenceCategories.length;
		categoryIndex++
	) {
		const staticCategory =
			referenceCategories[categoryIndex]

		const staticChildren =
			staticCategory.children ?? []

		const childIndex =
			staticChildren.findIndex(
				(child) =>
					child.id === nodeId ||
					normalizeReferenceSelectionKey(child.id) === normalizedNodeId,
			)

		if (childIndex >= 0) {
			const staticChild =
				staticChildren[childIndex]

			return {
				categoryIndex,
				childIndex,
				categoryLabel:
					staticCategory.label,
				label:
					staticChild?.label ?? nodeId,
			}
		}
	}

	return null
}

const isSelectedNodeOverviewOfJj = (nodeId: string | null): boolean => {
	if (!nodeId) return false
	const staticSelection = findReferenceStaticChild(nodeId)
	const normalizedKey = normalizeReferenceSelectionKey(
		staticSelection?.label ?? nodeId,
	)
	return (
		normalizedKey === 'jj' ||
		normalizedKey === 'overviewofjj' ||
		normalizedKey === 'overviewofjjh' ||
		normalizedKey.includes('overviewofjj')
	)
}


/*
 * Resolve a Reference subcategory selection to its
 * Dataverse record.
 *
 * The sidebar can contain a static UI id while the actual
 * Reference record uses a Dataverse GUID. This resolver accepts
 * all of the following safely:
 *
 * 1. Dataverse subcategory GUID
 * 2. Dataverse subcategory name
 * 3. Static sidebar child id + displayed name
 * 4. Static sidebar position as a final fallback
 */
const findReferenceSelection = (
	nodeId: string | null,
	dataverseCategories: ReferenceCategory[],
	categoryItems: Record<string, string[]>,
) => {
	if (!nodeId || dataverseCategories.length === 0) {
		return null
	}

	const normalizedNodeId =
		normalizeReferenceSelectionKey(nodeId)

	/*
	 * First try the Dataverse subcategory GUID directly.
	 * This is the most reliable path when the sidebar is
	 * already using a Dataverse id.
	 */
	for (const category of dataverseCategories) {
		const subcategory =
			category.subcategories.find(
				(item) => item.id === nodeId,
			)

		if (subcategory) {
			return {
				category,
				subcategory,
			}
		}
	}

	/*
	 * Resolve the clicked sidebar item back to the exact
	 * static Reference category/subcategory position.
	 */
	const staticSelection =
		findReferenceStaticChild(nodeId)

	if (!staticSelection) {
		/*
		 * The sidebar may contain a display value rather than
		 * the static node id. Try a normalized name match.
		 */
		if (normalizedNodeId) {
			for (const category of dataverseCategories) {
				const subcategory =
					category.subcategories.find(
						(item) => {
							const normalizedItemName =
								normalizeReferenceSelectionKey(
								item.name,
							)

							return (
								normalizedItemName ===
									normalizedNodeId ||
								(
									!!normalizedItemName &&
									!!normalizedNodeId &&
									(
										normalizedItemName.startsWith(
											normalizedNodeId,
										) ||
										normalizedNodeId.startsWith(
											normalizedItemName,
										)
									)
								)
							)
						},
					)

				if (subcategory) {
					return {
						category,
						subcategory,
					}
				}
			}
		}

		/*
		 * Targeted fallback for the existing J&J Overview sidebar
		 * entry. Some versions of the sidebar use a short/static id
		 * instead of the full Dataverse subcategory id or name.
		 * Only these known Overview keys use this fallback.
		 */
		const isOverviewOfJjSelection =
			normalizedNodeId === 'jj' ||
			normalizedNodeId === 'overviewofjj' ||
			normalizedNodeId === 'overviewofjjh'

		if (isOverviewOfJjSelection) {
			for (const category of dataverseCategories) {
				const subcategory =
					category.subcategories.find(
						(item) => {
							const normalizedItemName =
								normalizeReferenceSelectionKey(
								item.name,
							)

							return (
								normalizedItemName === 'overviewofjj' ||
								normalizedItemName === 'overviewofjjh'
							)
						},
					)

				if (subcategory) {
					return {
						category,
						subcategory,
					}
				}
			}
		}

		return null
	}

	const referenceRoot = sidebarData.find(
		(node) => node.id === 'references',
	)

	const referenceCategories =
		referenceRoot?.children ?? []

	const staticCategory =
		referenceCategories[
			staticSelection.categoryIndex
		]

	/*
	 * Prefer the Dataverse category with the same visible
	 * category name. This is safer than depending on order.
	 */
	const normalizedStaticCategoryLabel =
		normalizeReferenceSelectionKey(
			staticSelection.categoryLabel,
		)

	const matchedDataverseCategory =
		dataverseCategories.find(
			(category) =>
				normalizeReferenceSelectionKey(
					category.name,
				) ===
				normalizedStaticCategoryLabel,
		)

	const dataverseCategory =
		matchedDataverseCategory ??
		dataverseCategories[
			staticSelection.categoryIndex
		]

	if (!dataverseCategory) {
		return null
	}

	const normalizedStaticLabel =
		normalizeReferenceSelectionKey(
			staticSelection.label,
		)

	/*
	 * Match the visible label exactly first, then allow a
	 * small text mismatch such as an extra trailing character.
	 */
	const matchedSubcategory =
		dataverseCategory.subcategories.find(
			(item) => {
				const normalizedItemName =
					normalizeReferenceSelectionKey(
						item.name,
					)

				if (
					normalizedItemName ===
						normalizedStaticLabel
				) {
					return true
				}

				return (
						!!normalizedItemName &&
						!!normalizedStaticLabel &&
						(normalizedItemName.startsWith(
							normalizedStaticLabel,
						) ||
						normalizedStaticLabel.startsWith(
							normalizedItemName,
						)))
			})

	if (matchedSubcategory) {
		return {
			category: dataverseCategory,
			subcategory: matchedSubcategory,
		}
	}

	/*
	 * Try the current sidebar label stored in categoryItems.
	 * This covers a renamed sidebar entry.
	 */
	const currentNames =
		staticCategory
			? categoryItems[staticCategory.id] ?? []
			: []

	const currentName =
		currentNames[staticSelection.childIndex] ?? ''

	const normalizedCurrentName =
		normalizeReferenceSelectionKey(currentName)

	if (normalizedCurrentName) {
		const currentNameMatch =
			dataverseCategory.subcategories.find(
				(item) => {
					const normalizedItemName =
						normalizeReferenceSelectionKey(
							item.name,
						)

					return (
						normalizedItemName ===
							normalizedCurrentName ||
						(normalizedItemName.length > 0 &&
							normalizedCurrentName.length > 0 &&
							(normalizedItemName.startsWith(
								normalizedCurrentName,
							) ||
							normalizedCurrentName.startsWith(
								normalizedItemName,
							))))
				},
			)

		if (currentNameMatch) {
			return {
				category: dataverseCategory,
				subcategory: currentNameMatch,
			}
		}
	}

	/*
	 * Last fallback: the clicked item position inside the
	 * correctly identified Dataverse category. This guarantees
	 * a static sidebar item can still resolve when its text has
	 * been changed independently of Dataverse.
	 */
	const positionedSubcategory =
		dataverseCategory.subcategories[
			staticSelection.childIndex
		]

	if (
		positionedSubcategory &&
		((staticSelection.childIndex === 0 && isSelectedNodeOverviewOfJj(nodeId)) ||
			normalizeReferenceSelectionKey(positionedSubcategory.name) ===
				normalizedStaticLabel)
	) {
		return {
			category: dataverseCategory,
			subcategory: positionedSubcategory,
		}
	}

	return null
}

const normalizeQuickLinkKey = (value: string | null | undefined): string => {
	if (!value) return ''
	return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const findQuickLinkSelection = (
	nodeId: string | null,
	dataverseCategories: QuickLinkCategory[],
	contentTitle?: string | null,
) => {
	if (nodeId && findReferenceStaticChild(nodeId)) {
		return null
	}

	if (dataverseCategories.length === 0) {
		return null
	}

	const allCategorySubcategories = dataverseCategories.flatMap((category) =>
		category.subcategories.map((subcategory) => ({
			category,
			subcategory,
		})),
	)

	// 1. Direct ID match
	if (nodeId) {
		const directMatch = allCategorySubcategories.find(
			(entry) => entry.subcategory.id === nodeId,
		)
		if (directMatch) return directMatch
	}

	// 2. Direct name match from contentTitle
	if (contentTitle) {
		const normTitle = normalizeQuickLinkKey(contentTitle)
		if (normTitle) {
			const titleMatch = allCategorySubcategories.find(
				(entry) => normalizeQuickLinkKey(entry.subcategory.name) === normTitle,
			)
			if (titleMatch) return titleMatch
		}
	}

	// 3. Normalized nodeId match
	if (nodeId) {
		const normNode = normalizeQuickLinkKey(nodeId)
		if (normNode) {
			const nodeMatch = allCategorySubcategories.find(
				(entry) => normalizeQuickLinkKey(entry.subcategory.name) === normNode,
			)
			if (nodeMatch) return nodeMatch
		}
	}

	return null
}

type LocalSearchResult = SearchLocalResult

const SEARCH_WEB_SOURCES = [
	{
		domain: 'theiia.org/standards-guidance',
		publisher: 'The Institute of Internal Auditors',
		prefix: 'The Institute of Internal Auditors',
		domainQuery: 'theiia.org',
	},
	{
		domain: 'pcaobus.org/oversight/standards',
		publisher: 'PCAOB',
		prefix: 'PCAOB auditing standards',
		domainQuery: 'pcaobus.org',
	},
	{
		domain: 'sec.gov/rules-regulations',
		publisher: 'U.S. Securities and Exchange Commission',
		prefix: 'SEC rules and regulations',
		domainQuery: 'sec.gov',
	},
	{
		domain: 'isaca.org/resources',
		publisher: 'ISACA',
		prefix: 'ISACA resources',
		domainQuery: 'isaca.org',
	},
	{
		domain: 'gao.gov',
		publisher: 'U.S. Government Accountability Office',
		prefix: 'Government accountability and audit guidance',
		domainQuery: 'gao.gov',
	},
	{
		domain: 'aicpa-cima.com/resources',
		publisher: 'AICPA & CIMA',
		prefix: 'AICPA & CIMA resources',
		domainQuery: 'aicpa-cima.com',
	},
]

const buildWebSearchResults = (query: string): SearchWebResult[] => {
	const trimmedQuery = query.trim()
	const encodedQuery = encodeURIComponent(trimmedQuery)

	return SEARCH_WEB_SOURCES.map((source) => ({
		domain: source.domain,
		title: `${source.prefix} — search for “${trimmedQuery}”`,
		description: `External web search for “${trimmedQuery}” on ${source.publisher}.`,
		publisher: source.publisher,
		url: `https://www.google.com/search?q=site%3A${source.domainQuery}+${encodedQuery}`,
	}))
}


function HomePage() {
	const { role, roleInfo, environment } = useUserRole()
	const [showAuditverseMainApp, setShowAuditverseMainApp] = useState(
		() => isAuditverseMainHash(window.location.hash),
	)
	const [selectedRole, setSelectedRole] = useState<UserRole>(role)
	const [lastDetectedRole, setLastDetectedRole] = useState<UserRole>(role)
	if (lastDetectedRole !== role) {
		setLastDetectedRole(role)
		setSelectedRole(role)
	}
	const canSelectRole =
		environment.trim().toUpperCase() === 'QA'
	const effectiveRole = canSelectRole ? selectedRole : role
	const canManageStructure = effectiveRole === 'admin'
	const canManageRightSide = effectiveRole === 'content_manager'
	const canManageReferenceRightSide = effectiveRole === 'content_manager'
	const canManageAboutUsContent = effectiveRole !== 'user'

	const [searchTerm, setSearchTerm] =
		useState('')

	const [submittedSearchTerm, setSubmittedSearchTerm] =
		useState('')

	const handleSearchChange = (value: string) => {
		setSearchTerm(value)
	}

	const handleSearchSubmit = (value: string) => {
		const trimmedValue = value.trim()

		if (!trimmedValue) {
			setSubmittedSearchTerm('')
			return
		}

		setSearchTerm(value)
		setSubmittedSearchTerm(trimmedValue)
	}

	const [selectedNode, setSelectedNode] =
		useState<string | null>(null)

	const [pendingReferenceHashTarget, setPendingReferenceHashTarget] =
		useState<ReferenceHashTarget | null>(() => parseReferenceHash(window.location.hash))

	const [hasUserManuallySelectedNode, setHasUserManuallySelectedNode] =
		useState(false)

	const restoreUserId = roleInfo?.objectId || roleInfo?.userEmail
	const [restoredForUserId, setRestoredForUserId] = useState<string | undefined>()
	if (restoreUserId && restoredForUserId !== restoreUserId) {
		setRestoredForUserId(restoreUserId)
		try {
			const savedNode = window.localStorage.getItem(
				`auditverse-last-selected-node:${restoreUserId}`,
			)
			if (savedNode) {
				setHasUserManuallySelectedNode(true)
				setSelectedNode(savedNode)
			}
		} catch {
			// Keep the current selection when storage is unavailable.
		}
	}

	const [quickLinkOverrides, setQuickLinkOverrides] =
		useState<Record<string, ContentItem>>({})

	const [isManageMode, setIsManageMode] =
		useState(false)

	const [
		isQuickLinkManageMode,
		setIsQuickLinkManageMode,
	] = useState(false)

	const [
		isReferenceManageMode,
		setIsReferenceManageMode,
	] = useState(false)

	// Primary top navigation active tab
	const [activeNav, setActiveNav] = useState('Home')
	const normalizeNavLabel = (value: string) =>
		value.trim().toLowerCase().replace(/\s+/g, ' ')
	const canonicalizeNavLabel = (value: string) => {
		const normalized = normalizeNavLabel(value)
		if (normalized === 'references') return 'References'
		if (normalized === 'about us' || normalized === 'aboutus') return 'About Us'
		if (normalized === 'home') return 'Home'
		if (normalized === 'audit focus') return 'Audit Focus'
		return value.trim()
	}
	const activeNavCanonical = canonicalizeNavLabel(activeNav)

	// Save Confirmation Success Modal state
	const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
	const [successModalCategoryName, setSuccessModalCategoryName] = useState<string>('')
	const [showSuccessModalFolderSync, setShowSuccessModalFolderSync] = useState<boolean>(false)
	const [folderSyncPollUntil, setFolderSyncPollUntil] = useState<number | null>(null)

	// After a folder is added, the SharePoint sync fills in the files in the background.
	// Poll Dataverse for a few minutes so they appear without a manual page refresh.
	useEffect(() => {
		if (!folderSyncPollUntil) return
		let cancelled = false
		const timer = window.setInterval(async () => {
			if (Date.now() > folderSyncPollUntil) {
				window.clearInterval(timer)
				setFolderSyncPollUntil(null)
				return
			}
			try {
				const result = await Cp_refitemsesService.getAll()
				if (!cancelled) setReferenceItems(result.data ?? [])

				// Replace any temporary folder ids still shown on screen with the real Dataverse ids
				const isGuidId = (value?: string | null) =>
					Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
				const mastersResult = await Cp_refmastersesService.getAll()
				const liveMasters = ((mastersResult.data ?? []) as any[]).filter((m) => m.statecode !== 1)
				if (!cancelled) {
					setReferenceOverrides((prev) => {
						let changed = false
						const next: typeof prev = {}
						for (const [key, override] of Object.entries(prev)) {
							if (!override.items.some((item) => !isGuidId(item.id))) {
								next[key] = override
								continue
							}
							const claimed = new Set(override.items.map((item) => item.id).filter((id) => isGuidId(id)))
							const items = override.items.map((item) => {
								if (isGuidId(item.id)) return item
								const match = liveMasters.find(
									(m) =>
										!claimed.has(m.cp_refmastersid) &&
										String(m._cp_subcategory_value ?? '').toLowerCase() === String(override.id).toLowerCase() &&
										String(m.cp_name ?? '').trim().toLowerCase() === String(item.name ?? '').trim().toLowerCase(),
								)
								if (!match) return item
								claimed.add(match.cp_refmastersid)
								changed = true
								return { ...item, id: match.cp_refmastersid as string }
							})
							next[key] = { ...override, items }
						}
						return changed ? next : prev
					})
				}
			} catch (pollError) {
				console.error('REF ITEMS POLL ERROR:', pollError)
			}
		}, 15000)
		return () => {
			cancelled = true
			window.clearInterval(timer)
		}
	}, [folderSyncPollUntil])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && showSuccessModal) {
				setShowSuccessModal(false)
				setShowSuccessModalFolderSync(false)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [showSuccessModal])

	const [referenceItems, setReferenceItems] = useState<Cp_refitemses[]>([])

	/*
	 * Targeted fallback for the Overview of J&J Reference entry.
	 * This is only used when that sidebar item exists but its
	 * subcategory is not present in the normal hierarchy result.
	 */
	const [overviewReferenceFallback, setOverviewReferenceFallback] =
		useState<ReferenceSubcategory | null>(null)

	const overviewReferenceFallbackIdRef = useRef<string | null>(null)
	useEffect(() => {
		overviewReferenceFallbackIdRef.current = overviewReferenceFallback?.id ?? null
	}, [overviewReferenceFallback])

	const [overviewReferenceFallbackCategory, setOverviewReferenceFallbackCategory] =
		useState<ReferenceCategory | null>(null)

	const [referenceOverrides, setReferenceOverrides] =
		useState<Record<string, ReferenceSubcategory>>({})

	const [quickLinkCategories, setQuickLinkCategories] =
		useState<string[]>([])

	const [referenceCategories, setReferenceCategories] =
		useState<string[]>([])

	const [homeSubscreen, setHomeSubscreen] = useState<'home' | 'customize'>('home')

	const [
		editingQuickLinkCategories,
		setEditingQuickLinkCategories,
	] = useState<ManageListItem[]>([])

	const [
		editingReferenceCategories,
		setEditingReferenceCategories,
	] = useState<ManageListItem[]>([])

	const [manageSection, setManageSection] =
		useState<ManageSection>(null)

	const [manageLevel, setManageLevel] =
		useState<ManageLevel>(null)

	const [categoryItems, setCategoryItems] =
		useState<Record<string, string[]>>({})

	const [categoryItemDescriptions, setCategoryItemDescriptions] =
		useState<Record<string, string>>({})

	const [
		manageCategorySection,
		setManageCategorySection,
	] = useState<ManageCategorySection>(null)

	const [
		manageCategoryId,
		setManageCategoryId,
	] = useState<string | null>(null)

	const [
		manageCategory,
		setManageCategory,
	] = useState<string | null>(null)

	const [
		editingCategoryItems,
		setEditingCategoryItems,
	] = useState<ManageListItem[]>([])

	const [permissionSnapshot, setPermissionSnapshot] = useState({
		canManageStructure,
		canManageRightSide,
		canManageReferenceRightSide,
	})
	if (
		permissionSnapshot.canManageStructure !== canManageStructure ||
		permissionSnapshot.canManageRightSide !== canManageRightSide ||
		permissionSnapshot.canManageReferenceRightSide !== canManageReferenceRightSide
	) {
		setPermissionSnapshot({ canManageStructure, canManageRightSide, canManageReferenceRightSide })
		if (!canManageReferenceRightSide) {
			setIsReferenceManageMode(false)
		}
		if (!canManageStructure) {
			setManageLevel(null)
			setManageSection(null)
			setManageCategorySection(null)
			setManageCategoryId(null)
			setManageCategory(null)
		}
		if (!canManageRightSide) {
			setIsManageMode(false)
			setIsQuickLinkManageMode(false)
			setIsReferenceManageMode(false)
		}
	}

	const {
  categories: dataverseQuickLinkCategories,
  loading: quickLinksLoading,
  saving: quickLinksSaving,
  error: quickLinksError,
  refresh: refreshQuickLinks,
  saveSubcategory,
  saveCategories,
  saveCategorySubcategories,
} = useQuickLinks()

	const {
		categories: dataverseReferenceCategories,
		loading: referencesLoading,
		saving: referencesSaving,
		error: referencesError,
		sites: referenceSites,
		saveCategories: saveReferenceCategories,
		saveCategorySubcategories: saveReferenceCategorySubcategories,
		saveMasters: saveReferenceMasters,
	} = useReferences()

	/*
	 * Load REF Items used when a REF Master folder is expanded.
	 */
	useEffect(() => {
		let cancelled = false

		const loadReferenceItems = async () => {
			try {
				const result = await Cp_refitemsesService.getAll()

				if (!cancelled) {
					setReferenceItems(result.data ?? [])
				}
			} catch (caughtError) {
				console.error('REF ITEMS LOAD ERROR:', caughtError)
			}
		}

		void loadReferenceItems()

		return () => {
			cancelled = true
		}
	}, [])

	/*
	 * ---------------------------------------------------------
	 * Load Quick Link categories and subcategories
	 * from Dataverse.
	 * ---------------------------------------------------------
	 */
	const [quickLinkSyncInputs, setQuickLinkSyncInputs] = useState<{
		categories: typeof dataverseQuickLinkCategories
		error: typeof quickLinksError
		loading: boolean
	} | null>(null)
	if (
		quickLinkSyncInputs === null ||
		quickLinkSyncInputs.categories !== dataverseQuickLinkCategories ||
		quickLinkSyncInputs.error !== quickLinksError ||
		quickLinkSyncInputs.loading !== quickLinksLoading
	) {
		setQuickLinkSyncInputs({
			categories: dataverseQuickLinkCategories,
			error: quickLinksError,
			loading: quickLinksLoading,
		})

		if (!quickLinksLoading && !quickLinksError) {
			const sortedDataverseCategories = [
				...dataverseQuickLinkCategories,
			].sort(
				(left, right) =>
					left.sortOrder -
					right.sortOrder,
			)

			const categoryNames =
				sortedDataverseCategories.map(
					(category) =>
						category.name,
				)

			const subcategoryItems =
				sortedDataverseCategories.reduce<
					Record<string, string[]>
				>((items, category) => {
					const subNames = [
						...category.subcategories,
					]
						.sort(
							(left, right) =>
								left.sortOrder -
								right.sortOrder,
						)
						.map(
							(subcategory) =>
								subcategory.name,
						)

					items[category.id] = subNames
					const slugId = `quick-links-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
					items[slugId] = subNames

					return items
				}, {})

			setQuickLinkCategories(
				categoryNames,
			)

			setCategoryItems((current) => ({
				...current,
				...subcategoryItems,
			}))
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Select the first Quick Link subcategory on initial launch.
	 *
	 * This only runs while nothing has been selected yet. After
	 * the user selects another item, their existing selection is
	 * preserved.
	 * ---------------------------------------------------------
	 */
	const [defaultSelectionInputs, setDefaultSelectionInputs] = useState<{
		categories: typeof dataverseQuickLinkCategories
		error: typeof quickLinksError
		loading: boolean
	} | null>(null)
	if (
		defaultSelectionInputs === null ||
		defaultSelectionInputs.categories !== dataverseQuickLinkCategories ||
		defaultSelectionInputs.error !== quickLinksError ||
		defaultSelectionInputs.loading !== quickLinksLoading
	) {
		setDefaultSelectionInputs({
			categories: dataverseQuickLinkCategories,
			error: quickLinksError,
			loading: quickLinksLoading,
		})

		if (
			!hasUserManuallySelectedNode &&
			!quickLinksLoading &&
			!quickLinksError &&
			dataverseQuickLinkCategories.length > 0
		) {
			const sortedCategories = [...dataverseQuickLinkCategories].sort(
				(left, right) => left.sortOrder - right.sortOrder,
			)
			const defaultJjSubcategory = sortedCategories
				.flatMap((category) => category.subcategories)
				.find((subcategory) => subcategory.name.trim().toLowerCase() === 'j&j')

			if (defaultJjSubcategory) {
				setSelectedNode(defaultJjSubcategory.id)
			} else {
				for (const category of sortedCategories) {
					const sortedSubcategories = category.subcategories
						.slice()
						.sort((left, right) => left.sortOrder - right.sortOrder)

					if (sortedSubcategories.length > 0) {
						setSelectedNode(sortedSubcategories[0].id)
						break
					}
				}
			}
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Load Reference categories and subcategories
	 * from Dataverse.
	 * ---------------------------------------------------------
	 */
	const [referenceSyncInputs, setReferenceSyncInputs] = useState<{
		categories: typeof dataverseReferenceCategories
		error: typeof referencesError
		loading: boolean
	} | null>(null)
	if (
		referenceSyncInputs === null ||
		referenceSyncInputs.categories !== dataverseReferenceCategories ||
		referenceSyncInputs.error !== referencesError ||
		referenceSyncInputs.loading !== referencesLoading
	) {
		setReferenceSyncInputs({
			categories: dataverseReferenceCategories,
			error: referencesError,
			loading: referencesLoading,
		})

		if (!referencesLoading && !referencesError) {
			const sortedReferenceCategories = [
				...dataverseReferenceCategories,
			].sort(
				(left, right) =>
					left.sortOrder - right.sortOrder,
			)

			setReferenceCategories(
				sortedReferenceCategories.map(
					(category) => category.name,
				),
			)

			const referenceSubcategoryItems =
				sortedReferenceCategories.reduce<
					Record<string, string[]>
				>((items, category) => {
					const subNames = category.subcategories
						.slice()
						.sort(
							(left, right) =>
								left.sortOrder - right.sortOrder,
						)
						.map(
							(subcategory) => subcategory.name,
						)

					items[category.id] = subNames
					const slugId = `references-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
					items[slugId] = subNames

					return items
				}, {})

			setCategoryItems((current) => ({
				...current,
				...referenceSubcategoryItems,
			}))

			setCategoryItemDescriptions((current) => {
				const updated = { ...current }
				for (const category of sortedReferenceCategories) {
					for (const sub of category.subcategories) {
						if (sub.description) {
							const trimmed = sub.description.trim()
							if (sub.id) updated[sub.id] = trimmed
							updated[sub.name.toLowerCase().trim()] = trimmed
							updated[normalizeReferenceSelectionKey(sub.name)] = trimmed
							const subSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
							updated[subSlug] = trimmed
							updated[`${category.id}-${subSlug}`] = trimmed
						}
					}
				}
				return updated
			})
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Find the selected Quick Link subcategory.
	 * ---------------------------------------------------------
	 */
	const quickLinkSelection = findQuickLinkSelection(
		selectedNode,
		dataverseQuickLinkCategories,
	)

	const selectedQuickLinkSubcategory =
		quickLinkSelection?.subcategory ?? null

	const selectedQuickLinkCategory =
		quickLinkSelection?.category ??
		dataverseQuickLinkCategories.find((category) =>
			category.subcategories.some(
				(subcategory) =>
					subcategory.id === selectedNode ||
					subcategory.id === selectedQuickLinkSubcategory?.id,
			),
		) ?? null

	/*
	 * ---------------------------------------------------------
	 * Find the selected Reference subcategory.
	 * ---------------------------------------------------------
	 */
	const selectedReferenceSelection =
		findReferenceSelection(
			selectedNode,
			dataverseReferenceCategories,
			categoryItems,
		)

	const selectedReferenceCategory =
		selectedReferenceSelection?.category ?? null

	const selectedReferenceSubcategory =
		selectedReferenceSelection?.subcategory ??
		null

	/*
	 * ---------------------------------------------------------
	 * Targeted Overview of J&J fallback.
	 *
	 * The Overview entry can be present in the sidebar while its
	 * Reference Subcategory record is not returned in the normal
	 * category hierarchy. In that case, load that one subcategory
	 * and its masters directly from Dataverse.
	 * ---------------------------------------------------------
	 */
	const overviewStaticSelection =
		selectedNode !== null
			? findReferenceStaticChild(selectedNode)
			: null

	const overviewNormalizedLabel =
		normalizeReferenceSelectionKey(
			overviewStaticSelection?.label ?? selectedNode ?? '',
		)

	const overviewFallbackApplies =
		(overviewNormalizedLabel === 'jj' ||
			overviewNormalizedLabel === 'overviewofjj' ||
			overviewNormalizedLabel === 'overviewofjjh' ||
			overviewNormalizedLabel.includes('overviewofjj')) &&
		!selectedReferenceSubcategory

	if (
		!overviewFallbackApplies &&
		(overviewReferenceFallback !== null ||
			overviewReferenceFallbackCategory !== null)
	) {
		setOverviewReferenceFallback(null)
		setOverviewReferenceFallbackCategory(null)
	}

	useEffect(() => {
		let cancelled = false
		const staticSelection =
			selectedNode !== null
				? findReferenceStaticChild(selectedNode)
				: null

		if (!overviewFallbackApplies) {
			return () => {
				cancelled = true
			}
		}

		const loadOverviewReferenceFallback = async () => {
			try {
				const [subcategoryResult, masterResult] =
					await Promise.all([
						Cp_refsubcategoriesesService.getAll(),
						Cp_refmastersesService.getAll(),
					])

				if (cancelled) {
					return
				}

				const subcategoryData =
					subcategoryResult.data ?? []

				const normalizedCandidates = [
					'overviewofjj',
					'overviewofjjh',
				]

				const overviewRecord =
					subcategoryData.find((record) => {
						if (Number(record.statecode ?? 0) === 1) {
							return false
						}

						if (
							overviewReferenceFallbackIdRef.current &&
							record.cp_refsubcategoriesid === overviewReferenceFallbackIdRef.current
						) {
							return true
						}

						const normalizedName =
							normalizeReferenceSelectionKey(
								record.cp_subcategory,
							)

						return normalizedCandidates.some(
							(candidate) =>
								normalizedName === candidate ||
								normalizedName.startsWith(candidate) ||
								candidate.startsWith(normalizedName),
						)
					})

				if (!overviewRecord) {
					return
				}

				const overviewId =
					overviewRecord.cp_refsubcategoriesid

				const masterData = masterResult.data ?? []

				const overviewMasters =
					masterData
						.filter(
							(master) =>
								master.statecode !== 1 &&
								master._cp_subcategory_value === overviewId,
						)
						.sort(
							(left, right) =>
								Number(left.cp_sortorder ?? 0) -
								Number(right.cp_sortorder ?? 0),
						)

				const fallbackSubcategory: ReferenceSubcategory = {
					id: overviewId,
					name: overviewRecord.cp_subcategory ?? '',
					description: overviewRecord.cp_description || '',
					sortOrder: Number(overviewRecord.cp_sortorder ?? 0),
					items: overviewMasters.length > 0 ? overviewMasters.map((master) => ({
						id: master.cp_refmastersid,
						name: master.cp_name ?? '',
						type:
							Number(master.cp_type) === 100000000
								? 'folder'
								: 'link',
						link: master.cp_link ?? '',
						folderName: master.cp_foldername ?? '',
						libraryId: master.cp_libraryid ?? '',
						libraryName: master.cp_libraryname ?? '',
						folderParentPath:
							master.cp_folderparentpath ?? '',
						folderPath: master.cp_folderpath ?? '',
						sortOrder: Number(master.cp_sortorder ?? 0),
						siteId: master._cp_site_value ?? '',
						siteName: (master.cp_site as { cp_sitename?: string } | undefined)?.cp_sitename ?? '',
					})) : [],
				}

				const staticCategoryLabel =
					normalizeReferenceSelectionKey(
						staticSelection?.categoryLabel ?? '',
					)

				const fallbackCategory =
					dataverseReferenceCategories.find(
						(category) =>
							normalizeReferenceSelectionKey(
								category.name,
							) === staticCategoryLabel,
					) ?? null

				setOverviewReferenceFallback(
					fallbackSubcategory,
				)

				setOverviewReferenceFallbackCategory(
					fallbackCategory,
				)
			} catch (caughtError) {
				console.error(
					'OVERVIEW REFERENCE FALLBACK LOAD ERROR:',
					caughtError,
				)
			}
		}

		void loadOverviewReferenceFallback()

		return () => {
			cancelled = true
		}
	}, [
		overviewFallbackApplies,
		selectedNode,
		dataverseReferenceCategories,
	])

	/*
	 * ---------------------------------------------------------
	 * Resolve selected sidebar node hierarchy context.
	 * Finds Section, Category, Subcategory, and Description
	 * even when no child content records exist yet.
	 * ---------------------------------------------------------
	 */
	const hierarchyContext = (() => {
		if (!selectedNode) return null
		const isStaticReferenceSelection = Boolean(findReferenceStaticChild(selectedNode))
		const memoReferenceSelection = findReferenceSelection(
			selectedNode,
			dataverseReferenceCategories,
			categoryItems,
		)

		if (isStaticReferenceSelection && memoReferenceSelection) {
			const { category, subcategory } = memoReferenceSelection
			const resolvedDesc =
				categoryItemDescriptions[subcategory.id] ||
				categoryItemDescriptions[subcategory.name.toLowerCase().trim()] ||
				categoryItemDescriptions[normalizeReferenceSelectionKey(subcategory.name)] ||
				subcategory.description ||
				''

			return {
				section: 'references' as const,
				sectionLabel: 'References',
				categoryName: category.name,
				categoryId: category.id,
				subcategoryName: subcategory.name,
				subcategoryId: subcategory.id,
				description: resolvedDesc,
			}
		}

		// 1. Check Dataverse Quick Links categories & subcategories
		for (const cat of isStaticReferenceSelection ? [] : dataverseQuickLinkCategories) {
			const sub = cat.subcategories.find(
				(s) =>
					s.id === selectedNode ||
					s.name.trim().toLowerCase() === selectedNode.trim().toLowerCase() ||
					normalizeQuickLinkKey(s.name) === normalizeQuickLinkKey(selectedNode),
			)
			if (sub) {
				return {
					section: 'quickLinks' as const,
					sectionLabel: 'Quick Links',
					categoryName: cat.name,
					categoryId: cat.id,
					subcategoryName: sub.name,
					subcategoryId: sub.id,
					description: sub.description || `List of contents available under ${sub.name}`,
				}
			}
		}

		// 2. Check Dataverse Reference categories & subcategories
		for (const cat of isStaticReferenceSelection ? [] : dataverseReferenceCategories) {
			const sub = cat.subcategories.find(
				(s) =>
					s.id === selectedNode ||
					s.name.trim().toLowerCase() === selectedNode.trim().toLowerCase() ||
					normalizeReferenceSelectionKey(s.name) === normalizeReferenceSelectionKey(selectedNode),
			)
			if (sub) {
				const resolvedDesc =
					categoryItemDescriptions[sub.id] ||
					categoryItemDescriptions[sub.name.toLowerCase().trim()] ||
					categoryItemDescriptions[normalizeReferenceSelectionKey(sub.name)] ||
					categoryItemDescriptions[selectedNode] ||
					sub.description ||
					''
				return {
					section: 'references' as const,
					sectionLabel: 'References',
					categoryName: cat.name,
					categoryId: cat.id,
					subcategoryName: sub.name,
					subcategoryId: sub.id,
					description: resolvedDesc,
				}
			}
		}

		// 3. Check categoryItems (where dynamic categories & subcategories from manage are stored)
		const quickLinksRoot = sidebarData.find((n) => n.id === 'quick-links')
		const staticQuickCats = quickLinksRoot?.children ?? []
		const referencesRoot = sidebarData.find((n) => n.id === 'references')
		const staticRefCats = referencesRoot?.children ?? []

		// Check Quick Links categories
		for (let i = 0; i < quickLinkCategories.length; i++) {
			const catLabel = quickLinkCategories[i]
			const staticCat = staticQuickCats[i]
			const catId =
				staticCat?.id ||
				`quick-links-${catLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

			if (
				selectedNode === catId ||
				(staticCat && selectedNode === staticCat.id) ||
				selectedNode.toLowerCase() === catLabel.toLowerCase()
			) {
				return {
					section: 'quickLinks' as const,
					sectionLabel: 'Quick Links',
					categoryName: catLabel,
					categoryId: catId,
					subcategoryName: catLabel,
					subcategoryId: catId,
					description: `List of contents available under ${catLabel}`,
				}
			}

			const subLabels: string[] =
				categoryItems[catId] ??
				(staticCat ? categoryItems[staticCat.id] : undefined) ??
				[]
			for (const subLabel of subLabels) {
				const subSlug = subLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')
				const possibleIds: string[] = [
					`${catId}-${subSlug}`,
					staticCat ? `${staticCat.id}-${subSlug}` : '',
					subSlug,
				]
				if (
					possibleIds.includes(selectedNode) ||
					selectedNode === subLabel ||
					selectedNode.toLowerCase().includes(subSlug) ||
					normalizeQuickLinkKey(selectedNode) === normalizeQuickLinkKey(subLabel)
				) {
					return {
						section: 'quickLinks' as const,
						sectionLabel: 'Quick Links',
						categoryName: catLabel,
						categoryId: catId,
						subcategoryName: subLabel,
						subcategoryId: selectedNode,
						description: `List of contents available under ${subLabel}`,
					}
				}
			}
		}

		// Check References categories
		for (let i = 0; i < referenceCategories.length; i++) {
			const catLabel = referenceCategories[i]
			const staticCat = staticRefCats[i]
			const catId =
				staticCat?.id ||
				`references-${catLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

			if (
				selectedNode === catId ||
				(staticCat && selectedNode === staticCat.id) ||
				selectedNode.toLowerCase() === catLabel.toLowerCase()
			) {
				return {
					section: 'references' as const,
					sectionLabel: 'References',
					categoryName: catLabel,
					categoryId: catId,
					subcategoryName: catLabel,
					subcategoryId: catId,
					description: `List of contents available under ${catLabel}`,
				}
			}

			const subLabels: string[] =
				categoryItems[catId] ??
				(staticCat ? categoryItems[staticCat.id] : undefined) ??
				[]
			for (const subLabel of subLabels) {
				const subSlug = subLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')
				const possibleIds: string[] = [
					`${catId}-${subSlug}`,
					staticCat ? `${staticCat.id}-${subSlug}` : '',
					subSlug,
				]
				if (
					possibleIds.includes(selectedNode) ||
					selectedNode === subLabel ||
					selectedNode.toLowerCase().includes(subSlug) ||
					normalizeReferenceSelectionKey(selectedNode) === normalizeReferenceSelectionKey(subLabel)
				) {
					const resolvedDesc =
						categoryItemDescriptions[selectedNode] ||
						categoryItemDescriptions[subLabel.toLowerCase().trim()] ||
						categoryItemDescriptions[normalizeReferenceSelectionKey(subLabel)] ||
						categoryItemDescriptions[subSlug] ||
						categoryItemDescriptions[`${catId}-${subSlug}`] ||
						(staticCat ? categoryItemDescriptions[`${staticCat.id}-${subSlug}`] : '') ||
						dataverseReferenceCategories
							.flatMap((c) => c.subcategories)
							.find((s) =>
								s.id === selectedNode ||
								s.name.trim().toLowerCase() === subLabel.trim().toLowerCase() ||
								normalizeReferenceSelectionKey(s.name) === normalizeReferenceSelectionKey(subLabel),
						)?.description ||
						''

					return {
						section: 'references' as const,
						sectionLabel: 'References',
						categoryName: catLabel,
						categoryId: catId,
						subcategoryName: subLabel,
						subcategoryId: selectedNode,
						description: resolvedDesc,
					}
				}
			}
		}

		return null
	})()

	const isOverviewNode = isSelectedNodeOverviewOfJj(selectedNode)

	/*
	 * Detect Reference sidebar children independently from the
	 * Dataverse lookup so a temporary null selection never causes
	 * the generic content component to receive null.
	 */
	const isReferenceSidebarNode =
		selectedNode !== null &&
		(
			hierarchyContext?.section === 'references' ||
			!!findReferenceStaticChild(selectedNode) ||
			!!selectedReferenceSubcategory ||
			(isOverviewNode && !!overviewReferenceFallback)
		)

	const effectiveSelectedReferenceSubcategory =
		(selectedNode ? referenceOverrides[selectedNode] : null) ??
		selectedReferenceSubcategory ??
		(isOverviewNode ? overviewReferenceFallback : null) ??
		(isReferenceSidebarNode && selectedNode !== null
			? {
					id: selectedNode,
					name:
						hierarchyContext?.subcategoryName ||
						'Subcategory',
					description:
						hierarchyContext?.description ||
						categoryItemDescriptions[selectedNode] ||
						categoryItemDescriptions[
							(hierarchyContext?.subcategoryName ?? '').toLowerCase().trim()
						] ||
						categoryItemDescriptions[
							normalizeReferenceSelectionKey(hierarchyContext?.subcategoryName)
						] ||
						'',
					sortOrder: 1,
					items: [],
					categoryId: hierarchyContext?.categoryId || '',
			  }
			: null)

	const effectiveSelectedReferenceCategory =
		selectedReferenceCategory ??
		(isOverviewNode ? overviewReferenceFallbackCategory : null) ??
		(hierarchyContext && hierarchyContext.section === 'references'
			? {
					id: hierarchyContext.categoryId || 'ref-cat',
					name: hierarchyContext.categoryName,
					sortOrder: 1,
					subcategories: [],
			  }
			: null)

	const effectiveSelectedQuickLinkSubcategory =
		(!isReferenceSidebarNode ? selectedQuickLinkSubcategory : null) ??
		(hierarchyContext && hierarchyContext.section === 'quickLinks' && selectedNode !== null
			? {
					id: selectedNode,
					name: hierarchyContext.subcategoryName,
					description: hierarchyContext.description,
					sortOrder: 1,
					items: [],
					categoryId: hierarchyContext.categoryId,
			  }
			: null)

	/*
	 * ---------------------------------------------------------
	 * Build the right-side content from
	 * QL Masters or REF Masters.
	 * ---------------------------------------------------------
	 */
	const quickLinkCategoryName =
		selectedQuickLinkCategory?.name ||
		hierarchyContext?.categoryName ||
		''

	const referenceCategoryName =
		effectiveSelectedReferenceCategory?.name ||
		hierarchyContext?.categoryName ||
		''

	const dataverseContent: ContentItem | null =
		!isReferenceSidebarNode && selectedQuickLinkSubcategory
			? {
					id: selectedQuickLinkSubcategory.id,
					section: 'quickLinks',
					title:
						selectedQuickLinkSubcategory.name,
					description:
						selectedQuickLinkSubcategory.description,
					breadcrumb: [
						'Quick Links',
						quickLinkCategoryName,
						selectedQuickLinkSubcategory.name,
					],
					resources:
						selectedQuickLinkSubcategory.items.map(
							(item) => ({
								id: item.id,
								name: item.name,
								type: 'link' as const,
								description: '',
								url: item.link,
							}),
						),
				}
			: selectedNode && referenceOverrides[selectedNode]
			? {
					id: referenceOverrides[selectedNode].id,
					section: 'references',
					title: referenceOverrides[selectedNode].name,
					description: referenceOverrides[selectedNode].description,
					breadcrumb: [
						'References',
						referenceCategoryName,
						referenceOverrides[selectedNode].name,
					],
					resources: referenceOverrides[selectedNode].items.map((item) => ({
						id: item.id,
						name: item.name || item.folderName,
						type: item.type,
						description: item.type === 'folder' ? item.folderPath : '',
						url: item.link,
					})),
				}
			: selectedReferenceSubcategory
			? {
					id: selectedReferenceSubcategory.id,
					section: 'references',
					title: selectedReferenceSubcategory.name,
					description:
						selectedReferenceSubcategory.description,
					breadcrumb: [
						'References',
						referenceCategoryName,
						selectedReferenceSubcategory.name,
					],
					resources:
						selectedReferenceSubcategory.items.map(
							(item) => ({
								id: item.id,
								name: item.name || item.folderName,
								type: item.type,
								description:
									item.type === 'folder'
										? item.folderPath
										: '',
								url: item.link,
							}),
						),
				}
			: isOverviewNode && overviewReferenceFallback
			? {
					id: overviewReferenceFallback.id,
					section: 'references',
					title: overviewReferenceFallback.name,
					description:
						overviewReferenceFallback.description,
					breadcrumb: [
						'References',
						referenceCategoryName,
						overviewReferenceFallback.name,
					],
					resources:
						overviewReferenceFallback.items.map(
							(item) => ({
								id: item.id,
								name: item.name || item.folderName,
								type: item.type,
								description:
									item.type === 'folder'
										? item.folderPath
										: '',
								url: item.link,
							}),
						),
				}
			: isReferenceSidebarNode && selectedNode !== null
			? {
					id: selectedNode,
					section: 'references',
					title:
						hierarchyContext?.subcategoryName ||
						'Subcategory',
					description:
						hierarchyContext?.description ||
						categoryItemDescriptions[selectedNode] ||
						categoryItemDescriptions[
							(hierarchyContext?.subcategoryName ?? '').toLowerCase().trim()
						] ||
						categoryItemDescriptions[
							normalizeReferenceSelectionKey(hierarchyContext?.subcategoryName)
						] ||
						'',
					breadcrumb: [
						'References',
						referenceCategoryName,
						hierarchyContext?.subcategoryName ||
							'Subcategory',
					],
					resources: [],
				}
			: null

	/*
	 * Fallback content when a subcategory has no content items.
	 * Displays headings with Path, Subcategory, Description,
	 * default options, and Manage options.
	 */
	const fallbackContent: ContentItem | null =
		selectedNode !== null && hierarchyContext
			? {
					id: selectedNode,
					section: hierarchyContext.section,
					title: hierarchyContext.subcategoryName,
					description:
						hierarchyContext.description ||
						categoryItemDescriptions[selectedNode] ||
						categoryItemDescriptions[
							(hierarchyContext.subcategoryName ?? '').toLowerCase().trim()
						] ||
						categoryItemDescriptions[
							normalizeReferenceSelectionKey(hierarchyContext.subcategoryName)
						] ||
						'',
					breadcrumb: [
						hierarchyContext.sectionLabel,
						hierarchyContext.categoryName,
						hierarchyContext.subcategoryName,
					],
					resources: [],
			  }
			: null

	/*
	 * ---------------------------------------------------------
	 * Use Dataverse content when a Dataverse
	 * subcategory is selected.
	 *
	 * Otherwise use existing static content or fallback hierarchy.
	 * ---------------------------------------------------------
	 */
	const content: ContentItem | null =
		selectedNode === null
			? null
			: dataverseContent ??
				quickLinkOverrides[selectedNode] ??
				fallbackContent

	/*
	 * ---------------------------------------------------------
	 * Search resources.
	 * ---------------------------------------------------------
	 */
	const visibleResources = content?.resources ?? []

	/*
	 * ---------------------------------------------------------
	 * Select sidebar node.
	 * ---------------------------------------------------------
	 */
	const handleSelectNode = (
		nodeId: string,
	) => {
		setHasUserManuallySelectedNode(true)
		const userId = roleInfo?.objectId || roleInfo?.userEmail
		if (userId) {
			try {
				window.localStorage.setItem(
					`auditverse-last-selected-node:${userId}`,
					nodeId,
				)
			} catch {
				// Keep the current selection when storage is unavailable.
			}
		}
		/*
		 * Keep the sidebar's own node id as the selected value.
		 * The right-side Reference content resolves the corresponding
		 * Dataverse subcategory independently. This prevents a
		 * Reference selection from switching ids underneath the
		 * Sidebar and losing the selected item.
		 */
		setSelectedNode(nodeId)

		setIsManageMode(false)

		setIsQuickLinkManageMode(false)

		setIsReferenceManageMode(false)

		setManageSection(null)

		setManageCategorySection(null)

		setManageCategoryId(null)

		setManageCategory(null)

		setManageLevel(null)
	}

	/*
	 * ---------------------------------------------------------
	 * Existing generic Quick Link content save.
	 * Kept for compatibility with the existing
	 * ResourceContent component.
	 * ---------------------------------------------------------
	 */
	const handleSaveContent = async (
		updatedContent: ContentItem,
	) => {
		setQuickLinkOverrides((current) => ({
			...current,

			[updatedContent.id]: {
				...updatedContent,

				breadcrumb: [
					...updatedContent.breadcrumb.slice(
						0,
						-1,
					),

					updatedContent.title,
				],
			},
		}))

		const targetSelection =
			quickLinkSelection ??
			findQuickLinkSelection(
				selectedNode,
				dataverseQuickLinkCategories,
				updatedContent.title,
			)

		const targetSubcategory = targetSelection?.subcategory ?? null

		if (targetSubcategory) {
			try {
				await saveSubcategory(targetSubcategory, {
					...targetSubcategory,
					name: updatedContent.title,
					description: updatedContent.description || '',
					items: updatedContent.resources.map((item, index) => ({
						id: item.id,
						name: item.name,
						link: item.url || '',
						sortOrder: index + 1,
						isNew: item.id.startsWith('new-'),
					})),
				})
			} catch (caughtError) {
				console.error('QUICK LINK SAVE ERROR:', caughtError)
				throw caughtError
			}
		} else {
			// Subcategory does not exist in Dataverse yet: create it under the category
			const targetCategory =
				targetSelection?.category ??
				selectedQuickLinkCategory ??
				dataverseQuickLinkCategories.find(
					(cat) =>
						normalizeQuickLinkKey(cat.name) ===
						normalizeQuickLinkKey(quickLinkCategoryName),
				) ??
				dataverseQuickLinkCategories[0]

			if (targetCategory) {
				try {
					const createSubResult = await Cp_qlsubcategoriesesService.create({
						cp_subcategory: updatedContent.title.trim(),
						cp_description: (updatedContent.description || '').trim(),
						cp_sortorder: targetCategory.subcategories.length + 1,
						statecode: 0,
						statuscode: 1,
						'cp_Category@odata.bind': `/cp_qlcategorieses(${targetCategory.id})`,
					})

					const fallbackCreateResult = createSubResult as unknown as {
						cp_qlsubcategoriesid?: string
						id?: string
					}
					const newSubId =
						createSubResult.data?.cp_qlsubcategoriesid ||
						fallbackCreateResult.cp_qlsubcategoriesid ||
						fallbackCreateResult.id

					if (newSubId) {
						for (let i = 0; i < updatedContent.resources.length; i++) {
							const res = updatedContent.resources[i]
							await Cp_qlmastersesService.create({
								cp_name: res.name.trim(),
								cp_link: (res.url || '').trim(),
								cp_sortorder: i + 1,
								statecode: 0,
								'cp_SubCategory@odata.bind': `/cp_qlsubcategorieses(${newSubId})`,
							})
						}
						await refreshQuickLinks()
					}
				} catch (caughtError) {
					console.error('QUICK LINK CREATE SUBCATEGORY & MASTERS ERROR:', caughtError)
					throw caughtError
				}
			}
		}

		setIsManageMode(false)
		const categoryTitle = updatedContent.title || content?.title || ''
		setSuccessModalCategoryName(categoryTitle)
		setShowSuccessModal(true)
	}

	/*
	 * ---------------------------------------------------------
	 * Manage Reference resources.
	 * ---------------------------------------------------------
	 */
	const handleManageReference = () => {
		setIsManageMode(false)
		setIsQuickLinkManageMode(false)
		setIsReferenceManageMode(true)
		setManageLevel(null)
	}

	const handleSaveReferenceMasters = async (
		drafts: ReferenceMasterDraft[],
		metadata?: { title: string; description: string },
	) => {
		if (!effectiveSelectedReferenceSubcategory) {
			return
		}

		try {
			const existingItemIds = new Set(
				effectiveSelectedReferenceSubcategory.items.map((item) => item.id),
			)
			const hasNewFolder = drafts.some(
				(draft) =>
					draft.type === 'folder' &&
					(!draft.id || !existingItemIds.has(draft.id)),
			)

			const finalTitle = metadata?.title?.trim() || effectiveSelectedReferenceSubcategory.name
			const finalDescription =
				metadata?.description !== undefined
					? metadata.description.trim()
					: effectiveSelectedReferenceSubcategory.description

			effectiveSelectedReferenceSubcategory.name = finalTitle
			effectiveSelectedReferenceSubcategory.description = finalDescription

			if (effectiveSelectedReferenceSubcategory.id) {
				try {
					await Cp_refsubcategoriesesService.update(
						effectiveSelectedReferenceSubcategory.id,
						{
							cp_subcategory: finalTitle,
							cp_description: finalDescription,
						},
					)
				} catch (subErr) {
					console.error(
						'Failed to update subcategory title/desc in Dataverse:',
						subErr,
					)
				}
			}

			await saveReferenceMasters(
				effectiveSelectedReferenceSubcategory,
				drafts,
				metadata,
			)

			// Hand real Dataverse ids to newly created folders so their files can be matched without a refresh
			try {
				const isGuidId = (value?: string | null) =>
					Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
				if (drafts.some((d) => !isGuidId(d.id))) {
					const mastersResult = await Cp_refmastersesService.getAll()
					const subId = String(effectiveSelectedReferenceSubcategory.id ?? '').toLowerCase()
					const liveRows = ((mastersResult.data ?? []) as any[]).filter(
						(m) =>
							m.statecode !== 1 &&
							(!isGuidId(subId) || String(m._cp_subcategory_value ?? '').toLowerCase() === subId),
					)
					const claimed = new Set(drafts.map((d) => d.id).filter((id): id is string => isGuidId(id)))
					for (const draft of drafts) {
						if (isGuidId(draft.id)) continue
						const match = liveRows.find(
							(m) =>
								!claimed.has(m.cp_refmastersid) &&
								String(m.cp_name ?? '').trim().toLowerCase() === draft.name.trim().toLowerCase(),
						)
						if (match) {
							draft.id = match.cp_refmastersid
							claimed.add(match.cp_refmastersid)
						}
					}
				}
			} catch (idError) {
				console.error('FOLDER ID RESOLVE ERROR:', idError)
			}

			try {
				const refreshedRefItems = await Cp_refitemsesService.getAll()
				setReferenceItems(refreshedRefItems.data ?? [])
			} catch (refItemsError) {
				console.error('REF ITEMS REFRESH ERROR:', refItemsError)
			}

			effectiveSelectedReferenceSubcategory.items = drafts.map((d, i) => ({
				id: d.id || `draft-${i}`,
				name: d.name,
				type: d.type,
				link: d.link,
				folderName: d.folderName,
						libraryId: d.libraryId,
				libraryName: d.libraryName,
				folderParentPath: d.folderParentPath,
				folderPath: d.folderPath,
				sortOrder: i + 1,
				siteId: d.siteId,
				siteName: '',
			}))

			if (
				overviewReferenceFallback &&
				overviewReferenceFallback.id === effectiveSelectedReferenceSubcategory.id
			) {
				setOverviewReferenceFallback({
					...overviewReferenceFallback,
					name: finalTitle,
					description: finalDescription,
					items: effectiveSelectedReferenceSubcategory.items,
				})
			}

			// Store updated reference items in referenceOverrides so they immediately show
			setReferenceOverrides((prev) => ({
				...prev,
				[effectiveSelectedReferenceSubcategory.id]: {
					...effectiveSelectedReferenceSubcategory,
					name: finalTitle,
					description: finalDescription,
					items: effectiveSelectedReferenceSubcategory.items,
				},
				...(selectedNode
					? {
							[selectedNode]: {
								...effectiveSelectedReferenceSubcategory,
								name: finalTitle,
								description: finalDescription,
								items: effectiveSelectedReferenceSubcategory.items,
							},
					  }
					: {}),
			}))

			setCategoryItemDescriptions((prev) => ({
				...prev,
				[effectiveSelectedReferenceSubcategory.id]: finalDescription,
				[finalTitle.toLowerCase().trim()]: finalDescription,
				[normalizeReferenceSelectionKey(finalTitle)]: finalDescription,
				...(selectedNode ? { [selectedNode]: finalDescription } : {}),
			}))

			setIsReferenceManageMode(false)
			const categoryTitle = finalTitle || effectiveSelectedReferenceSubcategory.name || 'Category'
			setSuccessModalCategoryName(categoryTitle)
			setShowSuccessModalFolderSync(hasNewFolder)
			if (hasNewFolder) setFolderSyncPollUntil(Date.now() + 5 * 60 * 1000)
			setShowSuccessModal(true)
		} catch (caughtError) {
			console.error(
				'REFERENCE MASTER SAVE ERROR:',
				caughtError,
			)
			throw caughtError
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Manage Quick Links section.
	 * ---------------------------------------------------------
	 */
	const handleManageSection = (
		sectionId: string,
	) => {
		setIsManageMode(false)
		setIsQuickLinkManageMode(false)
		setIsReferenceManageMode(false)
		setManageLevel('section')
		setManageCategorySection(null)
		setManageCategoryId(null)
		setManageCategory(null)

		if (sectionId === 'quick-links') {
			const sortedCategories = [
				...dataverseQuickLinkCategories,
			].sort(
				(left, right) =>
					left.sortOrder -
					right.sortOrder,
			)

			const populatedItems: ManageListItem[] =
				sortedCategories.map((category) => ({
					id: category.id,
					name: category.name,
				}))

			setEditingQuickLinkCategories(populatedItems)
			setManageSection('quickLinks')
		}

		if (sectionId === 'references') {
			const sortedReferenceCategories = [
				...dataverseReferenceCategories,
			].sort(
				(left, right) =>
					left.sortOrder - right.sortOrder,
			)

			setEditingReferenceCategories(
				sortedReferenceCategories.map(
					(category) => ({
						id: category.id,
						name: category.name,
					}),
				),
			)

			setManageSection('references')
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Cancel section/category management.
	 *
	 * All management screens use local draft state.
	 * Cancel simply discards that draft and returns to
	 * the normal sidebar/content view.
	 * ---------------------------------------------------------
	 */
	const handleCancelManage = () => {
		setManageSection(null)
		setManageCategorySection(null)
		setManageCategoryId(null)
		setManageCategory(null)
		setManageLevel(null)
	}

	/*
	 * ---------------------------------------------------------
	 * Change section items.
	 * ---------------------------------------------------------
	 */
	const handleSectionItemsChange = (
		items: ManageListItem[],
	) => {
		if (
			manageSection ===
			'quickLinks'
		) {
			setEditingQuickLinkCategories(
				items,
			)
		}

		if (
			manageSection ===
			'references'
		) {
			setEditingReferenceCategories(
				items,
			)
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Save section changes.
	 * ---------------------------------------------------------
	 */
	const handleSaveSection = async (
		items: ManageListItem[],
	) => {
		if (
			manageSection ===
			'quickLinks'
		) {
			try {
				await saveCategories(
				dataverseQuickLinkCategories,
				items.map((item) => ({
					id: item.id,
					name: item.name,
				})),
				)

				setQuickLinkCategories(
					items.map(
						(item) => item.name.trim(),
					),
				)

				setEditingQuickLinkCategories(
					items.map((item) => ({
						id: item.id,
						name: item.name.trim(),
					})),
				)

				setManageSection(null)
				setManageLevel(null)
				setSuccessModalCategoryName('Quick Links')
				setShowSuccessModal(true)
			} catch (caughtError) {
				console.error(
					'QUICK LINK CATEGORY SAVE ERROR:',
					caughtError,
				)
			}

			return
		}

		if (
			manageSection ===
			'references'
		) {
			try {
				await saveReferenceCategories(
					dataverseReferenceCategories,
					items.map((item) => ({
						id: item.id,
						name: item.name,
					})),
				)

				setReferenceCategories(
					items.map(
						(item) => item.name.trim(),
					),
				)

				setEditingReferenceCategories(
					items.map((item) => ({
						id: item.id,
						name: item.name.trim(),
					})),
				)

				setManageSection(null)
				setManageLevel(null)
				setSuccessModalCategoryName('References')
				setShowSuccessModal(true)
			} catch (caughtError) {
				console.error(
					'REFERENCE CATEGORY SAVE ERROR:',
					caughtError,
				)
				throw caughtError
			}
		}
	}

	/*
	 * ---------------------------------------------------------
	 * Manage sidebar category.
	 * ---------------------------------------------------------
	 */
	const handleManageCategory = (
		section: ManageCategorySection,
		categoryId: string,
		categoryLabel: string,
	) => {
		if (!section) {
			return
		}

		setIsManageMode(false)
		setIsQuickLinkManageMode(false)
		setIsReferenceManageMode(false)
		setManageSection(null)
		setManageLevel('category')
		setManageCategorySection(section)
		setManageCategory(categoryLabel)

		if (section === 'quickLinks') {
			/*
			 * The Sidebar may provide its static node id.
			 * Resolve that node to the real Dataverse category
			 * GUID before starting the draft.
			 */
			const selectedCategory =
				dataverseQuickLinkCategories.find(
					(category) =>
						category.id === categoryId ||
						category.name === categoryLabel,
				)

			if (!selectedCategory) {
				setManageCategoryId(null)
				setEditingCategoryItems([])
				return
			}

			setManageCategoryId(
				selectedCategory.id,
			)

			setManageCategory(
				selectedCategory.name,
			)

			setEditingCategoryItems(
				[...selectedCategory.subcategories]
					.sort(
						(left, right) =>
							left.sortOrder -
							right.sortOrder,
					)
					.map(
						(subcategory) => ({
							id: subcategory.id,
							name: subcategory.name,
							description: subcategory.description ?? '',
						}),
					),
			)

			return
		}

		const selectedReferenceCategory =
			dataverseReferenceCategories.find(
				(category) =>
					category.id === categoryId ||
					category.name === categoryLabel,
			)

		if (!selectedReferenceCategory) {
			setManageCategoryId(null)
			setEditingCategoryItems([])
			return
		}

		setManageCategoryId(
			selectedReferenceCategory.id,
		)

		setManageCategory(
			selectedReferenceCategory.name,
		)

		setEditingCategoryItems(
			[...selectedReferenceCategory.subcategories]
				.sort(
					(left, right) =>
						left.sortOrder - right.sortOrder,
				)
				.map((subcategory) => ({
					id: subcategory.id,
					name: subcategory.name,
					description:
						subcategory.description ||
						categoryItemDescriptions[subcategory.id] ||
						categoryItemDescriptions[subcategory.name.toLowerCase().trim()] ||
						categoryItemDescriptions[normalizeReferenceSelectionKey(subcategory.name)] ||
						'',
				})),
		)
	}

	/*
	 * ---------------------------------------------------------
	 * Save sidebar category.
	 * ---------------------------------------------------------
	 */
	const handleSaveCategory = async (
		items: ManageListItem[],
	) => {
		if (!manageCategoryId) {
			return
		}

		if (
			manageCategorySection ===
			'quickLinks'
		) {
			const selectedCategory =
				dataverseQuickLinkCategories.find(
					(category) =>
						category.id ===
						manageCategoryId,
				)

			if (selectedCategory) {
				await saveCategorySubcategories(
					selectedCategory,
					items.map((item) => ({
						id: item.id,
						name: item.name,
						description: item.description,
					})),
				)
			}

			setCategoryItems(
				(current) => ({
					...current,
					[manageCategoryId]: items.map(
						(item) => item.name.trim(),
					),
				}),
			)

			setManageCategorySection(null)
			setManageCategoryId(null)
			setManageCategory(null)
			setManageLevel(null)
			setSuccessModalCategoryName(manageCategory || 'Quick Links')
			setShowSuccessModal(true)

			return
		}

		const selectedReferenceCategory =
			dataverseReferenceCategories.find(
				(category) =>
					category.id === manageCategoryId ||
					category.name === manageCategory,
			)

		// Update categoryItemDescriptions so the entered descriptions are immediately preserved and accessible
		setCategoryItemDescriptions((current) => {
			const updated = { ...current }
			items.forEach((item) => {
				const trimmedName = item.name.trim()
				const desc =
					item.description !== undefined && item.description !== null
						? item.description.trim()
						: ''
				if (item.id) {
					updated[item.id] = desc
				}
				updated[trimmedName.toLowerCase()] = desc
				updated[normalizeReferenceSelectionKey(trimmedName)] = desc
				const subSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
				updated[subSlug] = desc
				if (manageCategoryId) {
					updated[`${manageCategoryId}-${subSlug}`] = desc
				}
			})
			return updated
		})

		if (selectedReferenceCategory) {
			items.forEach((item) => {
				const match = selectedReferenceCategory.subcategories.find(
					(s) =>
						s.id === item.id ||
						s.name.trim().toLowerCase() === item.name.trim().toLowerCase() ||
						normalizeReferenceSelectionKey(s.name) === normalizeReferenceSelectionKey(item.name),
				)
				if (match) {
					match.name = item.name.trim()
					if (item.description !== undefined && item.description !== null) {
						match.description = item.description.trim()
					}
				}
			})

			await saveReferenceCategorySubcategories(
				selectedReferenceCategory,
				items.map((item) => ({
					id: item.id,
					name: item.name,
					description: item.description,
				})),
			)
		}

		setCategoryItems(
			(current) => ({
				...current,
				[manageCategoryId]: items.map(
					(item) => item.name.trim(),
				),
			}),
		)

		setManageCategorySection(null)
		setManageCategoryId(null)
		setManageCategory(null)
		setManageLevel(null)
		setSuccessModalCategoryName(manageCategory || 'Category')
		setShowSuccessModal(true)
	}

	/*
	 * ---------------------------------------------------------
	 * RIGHT-SIDE QUICK LINK MANAGE
	 *
	 * This opens the new QuickLinkManageContent screen.
	 * ---------------------------------------------------------
	 */
	const handleManageQuickLink = () => {
		setIsManageMode(true)
		setIsQuickLinkManageMode(false)
		setIsReferenceManageMode(false)
		setManageSection(null)
		setManageCategorySection(null)
		setManageCategoryId(null)
		setManageCategory(null)
		setManageLevel(null)
	}

	/*
	 * ---------------------------------------------------------
	 * Cancel Quick Link Manage.
	 *
	 * No Dataverse changes are made because the
	 * Manage screen works with a local draft.
	 * ---------------------------------------------------------
	 */
	const handleCancelQuickLinkManage =
		() => {
			setIsQuickLinkManageMode(false)
		}

	/*
	 * ---------------------------------------------------------
	 * Save Quick Link Manage.
	 *
	 * This sends the local draft to useQuickLinks(),
	 * which performs the Dataverse CRUD operations.
	 * ---------------------------------------------------------
	 */
	const handleSaveQuickLinkManage =
		async (
			draft: QuickLinkSubcategory | null | undefined,
		) => {
			const targetSubcategory =
				selectedQuickLinkSubcategory ||
				effectiveSelectedQuickLinkSubcategory

			if (
				!draft ||
				!targetSubcategory
			) {
				return
			}

			try {
				if (selectedQuickLinkSubcategory) {
					await saveSubcategory(
						selectedQuickLinkSubcategory,
						draft,
					)
				} else {
					setQuickLinkOverrides((current) => ({
						...current,
						[targetSubcategory.id]: {
							id: targetSubcategory.id,
							section: 'quickLinks',
							title: draft.name,
							description: draft.description || '',
							breadcrumb: [
								'Quick Links',
								quickLinkCategoryName,
								draft.name,
							],
							resources: draft.items.map((item) => ({
								id: item.id,
								name: item.name,
								type: 'link',
								description: '',
								url: item.link,
							})),
						},
					}))
				}

				setIsQuickLinkManageMode(
					false,
				)
				const categoryTitle = draft.name || targetSubcategory.name || 'Quick Links'
				setSuccessModalCategoryName(categoryTitle)
				setShowSuccessModal(true)
			} catch (caughtError) {
				console.error(
					'QUICK LINK SAVE ERROR:',
					caughtError,
				)
			}
		}

	/*
	 * ---------------------------------------------------------
	 * GLOBAL SEARCH RESULTS
	 * ---------------------------------------------------------
	 */
	const normalizedSearchTerm = submittedSearchTerm.trim().toLowerCase()
	const globalSearchResults: LocalSearchResult[] = []

	if (normalizedSearchTerm) {
		for (const category of dataverseQuickLinkCategories) {
			for (const subcategory of category.subcategories) {
				const subcategoryMatch = [
					category.name,
					subcategory.name,
					subcategory.description,
				].some((value) =>
					String(value ?? '').toLowerCase().includes(normalizedSearchTerm),
				)

				let matchingItemFound = false

				for (const item of subcategory.items) {
					const itemMatch = [item.name, item.link].some((value) =>
						String(value ?? '').toLowerCase().includes(normalizedSearchTerm),
					)

					if (!itemMatch) continue

					matchingItemFound = true

					globalSearchResults.push({
						id: `ql-${item.id}`,
						breadcrumb: ['Quick Links', category.name, subcategory.name],
						title: item.name,
						description: subcategory.description,
						url: item.link ?? '',
						type: 'LINK',
					})
				}

				if (subcategoryMatch && !matchingItemFound) {
					const firstLink = subcategory.items.find((item) => Boolean(item.link))

					globalSearchResults.push({
						id: `ql-area-${subcategory.id}`,
						breadcrumb: ['Quick Links', category.name, subcategory.name],
						title: subcategory.name,
						description: subcategory.description,
						url: firstLink?.link ?? '',
						type: 'AREA',
					})
				}
			}
		}

		for (const category of dataverseReferenceCategories) {
			for (const subcategory of category.subcategories) {
				const subcategoryMatch = [
					category.name,
					subcategory.name,
					subcategory.description,
				].some((value) =>
					String(value ?? '').toLowerCase().includes(normalizedSearchTerm),
				)

				let matchingItemFound = false

				for (const item of subcategory.items) {
					const masterName = item.name || item.folderName
					const itemMatch = [
						masterName,
						item.name,
						item.link,
						item.folderPath,
					].some((value) =>
						String(value ?? '').toLowerCase().includes(normalizedSearchTerm),
					)

					if (!itemMatch) continue

					matchingItemFound = true

					globalSearchResults.push({
						id: `ref-${item.id}`,
						breadcrumb: ['References', category.name, subcategory.name],
						title: masterName,
						description: item.type === 'folder' ? item.folderPath || subcategory.description : subcategory.description,
						url: item.link ?? '',
						type: item.type === 'folder' ? 'FOLDER' : 'LINK',
					})

					const childItems = referenceItems.filter(
						(child) =>
							child.statecode !== 1 &&
							child._cp_refmaster_value === item.id,
					)

					for (const child of childItems) {
						const childMatch = String(child.cp_filename ?? '').toLowerCase().includes(normalizedSearchTerm)

						if (!childMatch) continue

						globalSearchResults.push({
							id: `ref-file-${child.cp_refitemsid}`,
							breadcrumb: ['References', category.name, subcategory.name, masterName],
							title: child.cp_filename ?? '',
							description: subcategory.description,
						url: child.cp_filelink ?? '',
						type: 'FILE',
						})
					}
				}

				if (subcategoryMatch && !matchingItemFound) {
					const firstItem = subcategory.items[0]

					globalSearchResults.push({
						id: `ref-area-${subcategory.id}`,
						breadcrumb: ['References', category.name, subcategory.name],
						title: subcategory.name,
						description: subcategory.description,
						url: firstItem?.link ?? '',
						type: 'AREA',
					})
				}
			}
		}
	}

	const webSearchResults = buildWebSearchResults(submittedSearchTerm)

	useEffect(() => {
		if (!pendingReferenceHashTarget) return

		const normalizedCategoryName = normalizeReferenceSelectionKey(pendingReferenceHashTarget.categoryName)
		const normalizedSubcategoryName = normalizeReferenceSelectionKey(pendingReferenceHashTarget.subcategoryName)
		let nextSelectedNode = pendingReferenceHashTarget.subcategoryName

		const matchedDataverseCategory = dataverseReferenceCategories.find(
			(category) => normalizeReferenceSelectionKey(category.name) === normalizedCategoryName,
		)
		const matchedDataverseSubcategory = matchedDataverseCategory?.subcategories.find(
			(subcategory) => normalizeReferenceSelectionKey(subcategory.name) === normalizedSubcategoryName,
		)
		if (matchedDataverseSubcategory?.id?.trim()) {
			nextSelectedNode = matchedDataverseSubcategory.id.trim()
		} else {
			const referenceRoot = sidebarData.find((node) => node.id === 'references')
			const matchedStaticCategory = (referenceRoot?.children ?? []).find(
				(category) => normalizeReferenceSelectionKey(category.label) === normalizedCategoryName,
			)
			const matchedStaticSubcategory = (matchedStaticCategory?.children ?? []).find(
				(subcategory) => normalizeReferenceSelectionKey(subcategory.label) === normalizedSubcategoryName,
			)
			if (matchedStaticSubcategory?.id?.trim()) {
				nextSelectedNode = matchedStaticSubcategory.id.trim()
			}
		}

		setSearchTerm('')
		setSubmittedSearchTerm('')
		setActiveNav('References')
		setHasUserManuallySelectedNode(true)
		setSelectedNode(nextSelectedNode)
		setPendingReferenceHashTarget(null)

		const userId = roleInfo?.objectId || roleInfo?.userEmail
		if (userId) {
			try {
				window.localStorage.setItem(
					`auditverse-last-selected-node:${userId}`,
					nextSelectedNode,
				)
			} catch {
				// Keep runtime selection when storage is unavailable.
			}
		}
	}, [dataverseReferenceCategories, pendingReferenceHashTarget, roleInfo?.objectId, roleInfo?.userEmail])

	useEffect(() => {
		const onHashChange = () => {
			setShowAuditverseMainApp(isAuditverseMainHash(window.location.hash))
			setPendingReferenceHashTarget(parseReferenceHash(window.location.hash))
		}
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [])

	if (showAuditverseMainApp) {
		return (
			<Suspense
				fallback={(
					<div style={{ padding: 16, fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif' }}>
						Loading Auditverse module...
					</div>
				)}
			>
				<AuditverseMainApp />
			</Suspense>
		)
	}

	return (
		<div className="app-shell">
			<Navbar
				role={effectiveRole}
				showRoleSelector={canSelectRole}
				onRoleChange={setSelectedRole}
				activeNav={normalizedSearchTerm ? '' : (activeNavCanonical === 'Home' && homeSubscreen === 'customize' ? '__none__' : activeNavCanonical)}
				onNavClick={(nav) => {
					setSearchTerm('')
					setSubmittedSearchTerm('')
					setActiveNav(canonicalizeNavLabel(nav))
				}}
			/>

			{normalizedSearchTerm ? (
				<SearchResultsView
					query={submittedSearchTerm}
					searchInput={searchTerm}
					results={globalSearchResults}
					webResults={webSearchResults}
					onSearchChange={handleSearchChange}
					onSearchSubmit={handleSearchSubmit}
				/>
			) : (
				<>
					{activeNavCanonical === 'References' ? (
						<>
							<HeroBanner />

							<main className="page-content page-main">
				<SearchWithClear
					searchTerm={searchTerm}
					onSearchChange={handleSearchChange}
					onSearchSubmit={handleSearchSubmit}
				/>

				<div className="content-layout about-layout">
					<Sidebar
						key={`sidebar-${roleInfo?.objectId || roleInfo?.userEmail || 'anonymous'}`}
						userId={roleInfo?.objectId || roleInfo?.userEmail}
						selectedItem={
							selectedNode ?? ''
						}
						onSelectItem={
							handleSelectNode
						}
						quickLinkCategories={
							quickLinkCategories
						}
						referenceCategories={
							referenceCategories
						}
						categoryItems={
							categoryItems
						}
						quickLinkData={
							dataverseQuickLinkCategories
						}
						referenceData={
							dataverseReferenceCategories
						}
						onManageSection={
							canManageStructure
								? handleManageSection
								: undefined
						}
						onManageCategory={
							canManageStructure
								? handleManageCategory
								: undefined
						}
					/>

					{/*
					 * -------------------------------------------------
					 * SIDEBAR CATEGORY MANAGEMENT
					 * -------------------------------------------------
					 */}
					{manageLevel ===
						'category' &&
					manageCategorySection &&
					canManageStructure ? (
						<SectionManageContent
							sectionTitle={
								manageCategory ??
								''
							}
							items={
								editingCategoryItems
							}
							onItemsChange={
								setEditingCategoryItems
							}
							hasDescription={true}
							onCancel={() => {
								setManageCategorySection(
									null,
								)

								setManageCategoryId(
									null,
								)

								setManageCategory(
									null,
								)

								setManageLevel(
									null,
								)
							}}
							onSave={
								handleSaveCategory
							}
						/>
					) : /*
					 * -------------------------------------------------
					 * SECTION MANAGEMENT - QUICK LINKS
					 * -------------------------------------------------
					 */
					manageLevel ===
							'section' &&
						manageSection ===
							'quickLinks' &&
						canManageStructure ? (
						<SectionManageContent
  sectionTitle="Quick Links"
  items={editingQuickLinkCategories}
  onItemsChange={handleSectionItemsChange}
  onCancel={handleCancelManage}
  onSave={handleSaveSection}
/>
					) : /*
					 * -------------------------------------------------
					 * SECTION MANAGEMENT - REFERENCES
					 * -------------------------------------------------
					 */
					manageLevel ===
							'section' &&
						manageSection ===
							'references' &&
						canManageStructure ? (
						<SectionManageContent
							sectionTitle="References"
							items={editingReferenceCategories}
							onItemsChange={handleSectionItemsChange}
							onCancel={handleCancelManage}
							onSave={handleSaveSection}
						/>
					) : /*
					 * -------------------------------------------------
					 * QUICK LINK MANAGE SCREEN
					 * -------------------------------------------------
					 */
					isQuickLinkManageMode &&
						effectiveSelectedQuickLinkSubcategory &&
						canManageRightSide ? (
						<QuickLinkManageContent
							subcategory={
								effectiveSelectedQuickLinkSubcategory
							}
							saving={
								quickLinksSaving
							}
							role={effectiveRole}
							canEditSubcategoryName={effectiveRole === 'content_manager'}
							onCancel={
								handleCancelQuickLinkManage
							}
							onSave={
								handleSaveQuickLinkManage
							}
						/>
					) : /*
					 * -------------------------------------------------
					 * REFERENCE MANAGE SCREEN
					 * -------------------------------------------------
					 */
				isReferenceManageMode &&
						effectiveSelectedReferenceSubcategory &&
						canManageReferenceRightSide ? (
						<ReferenceManageContent
							subcategory={effectiveSelectedReferenceSubcategory}
							sites={referenceSites}
							saving={referencesSaving}
							canEditSubcategoryName={effectiveRole === 'content_manager'}
							canEditDescription={false}
							referenceItems={referenceItems}
							onCancel={() =>
							setIsReferenceManageMode(false)
						}
							onSave={handleSaveReferenceMasters}
						/>
					) : /*
					 * -------------------------------------------------
					 * NORMAL RESOURCE CONTENT
					 * -------------------------------------------------
					 */
					(
						content ? (
							<ResourceContent
								content={content}
								resources={visibleResources}
								searchTerm={searchTerm}
								referenceItems={referenceItems}
								isManageMode={
									content.section === 'references'
										? canManageReferenceRightSide && (isManageMode || isReferenceManageMode)
										: canManageRightSide && (isManageMode || isReferenceManageMode)
								}
								canEditDescription={effectiveRole === 'admin'}
								onManage={
									content.section === 'references'
										? (canManageReferenceRightSide ? handleManageReference : undefined)
										: (canManageRightSide ? handleManageQuickLink : undefined)
								}
								onCancelManage={() => {
									setIsManageMode(false)
									setIsReferenceManageMode(false)
								}}
								onSaveManage={handleSaveContent}
								onAddWidget={() => console.log('Add to Home Page Widgets')}
							/>
						) : isReferenceSidebarNode &&
							!effectiveSelectedReferenceSubcategory ? (
							<section className="resource-card pane">
								<p>Loading Reference content...</p>
							</section>
						) : (
							<section className="resource-card pane">
								<p>Select an item from the sidebar to view details.</p>
							</section>
						)
					)}
				</div>

			</main>
				</>
			) : activeNavCanonical === 'About Us' ? (
				<AboutUsPage
					isAdmin={effectiveRole === 'admin'}
					canManageContent={canManageAboutUsContent}
				/>
			) : activeNavCanonical === 'Home' ? (
				<Home onScreenChange={setHomeSubscreen} />
			) : (
				<main className="blank-page-body" />
			)}
		</>
	)}

			{/* Save Confirmation Success Modal Overlay */}
			{showSuccessModal && (
				<div
					className="modal-backdrop"
					onClick={() => {
						setShowSuccessModal(false)
						setShowSuccessModalFolderSync(false)
					}}
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-headline"
				>
					<div
						className="modal-dialog"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-success-badge">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#2e7d32"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
						<h3 id="modal-headline" className="modal-headline" style={{ color: '#312c2a' }}>
							Changes saved
						</h3>
						<p className="modal-description">
							{successModalCategoryName} content has been saved.
						</p>
						{showSuccessModalFolderSync && (
							<p
								className="modal-description"
								role="status"
								style={{ marginTop: 8 }}
							>
								<strong>Almost there!</strong> Your folder is syncing with
								SharePoint. Please wait a few minutes for the files to appear.
							</p>
						)}
						<button
							type="button"
							className="modal-done-btn has-nav-tooltip"
							onClick={() => {
								setShowSuccessModal(false)
								setShowSuccessModalFolderSync(false)
							}}
						>
							Done
							<span className="nav-tooltip nav-tooltip-box" role="tooltip">Done</span>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default HomePage