import { useContext } from "react"
import urljoin from "url-join"
import cx from "classnames"
import {
    EnrichedBlockAllCharts,
    RelatedChart,
    Url,
    ALL_CHARTS_ID,
    KeyChartLevel,
    queryParamsToStr,
} from "@ourworldindata/utils"
import { AttachmentsContext } from "../AttachmentsContext.js"
import { RelatedCharts } from "../../blocks/RelatedCharts.js"
import { BAKED_BASE_URL } from "../../../settings/clientSettings.js"
import { Button } from "@ourworldindata/components"

type AllChartsProps = EnrichedBlockAllCharts & {
    className?: string
}

function sortRelatedCharts(
    relatedCharts: RelatedChart[],
    sortedSlugs: string[]
): RelatedChart[] {
    const sortedRelatedCharts: RelatedChart[] = []

    // (We don't know if these slugs actually exist in relatedCharts)
    // Try to find them in order and put them at the front of the list
    sortedSlugs.forEach((slug) => {
        const index = relatedCharts.findIndex((chart) => chart.slug === slug)
        if (index !== -1) {
            const relatedChart = relatedCharts.splice(index, 1)[0]
            if (relatedChart) {
                // a teeny hack to stop the RelatedCharts component from
                // sorting these charts below the other key charts
                relatedChart.keyChartLevel = KeyChartLevel.Top
                sortedRelatedCharts.push(relatedChart)
            }
        }
    })

    sortedRelatedCharts.push(...relatedCharts)

    return sortedRelatedCharts
}

export function AllCharts(props: AllChartsProps) {
    const { heading, top, className } = props
    const { relatedCharts, tags } = useContext(AttachmentsContext)
    if (relatedCharts.length === 0) return null

    const topSlugs = top.map((item) => Url.fromURL(item.url).slug as string)

    const firstTag = tags[0]
    const firstTagDataCatalogQueryString = firstTag
        ? queryParamsToStr({ topics: firstTag.name })
        : ""

    const sortedRelatedCharts = sortRelatedCharts(relatedCharts, topSlugs)
    return (
        <div className={cx(className)}>
            <h1
                className="article-block__heading h1-semibold"
                id={ALL_CHARTS_ID}
            >
                <span>
                    {firstTag ? `Key Charts on ${firstTag.name}` : heading}
                </span>
                <a
                    className="deep-link"
                    aria-labelledby={ALL_CHARTS_ID}
                    href={`#${ALL_CHARTS_ID}`}
                />
            </h1>
            <Button
                theme="solid-vermillion"
                text="See all charts on this topic"
                href={`${urljoin(BAKED_BASE_URL, `/data`, firstTagDataCatalogQueryString)}`}
            />
            <RelatedCharts
                showKeyChartsOnly={true}
                charts={sortedRelatedCharts}
            />
        </div>
    )
}
