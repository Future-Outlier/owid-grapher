import * as React from "react"
import { SubNavId } from "@ourworldindata/types"
import { getSubnavItem } from "./gdocs/utils.js"
import { subnavs } from "./SiteConstants.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

export const BackToTopic = ({
    subnavId,
}: {
    subnavId: SubNavId
}): React.ReactElement | null => {
    const subnavItem = getSubnavItem(subnavId, subnavs[subnavId])
    if (!subnavItem) return null

    return (
        <a className="back-to-topic" href={subnavItem.href}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>{subnavItem.label}</span>
        </a>
    )
}
