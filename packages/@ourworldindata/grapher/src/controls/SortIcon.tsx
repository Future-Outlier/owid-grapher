import * as React from "react"
import classnames from "classnames"
import { IconDefinition } from "@fortawesome/fontawesome-svg-core/index"
import {
    faSortAlphaUpAlt,
    faSortAlphaDown,
    faSortAmountUpAlt,
    faSortAmountDown,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SortOrder } from "@ourworldindata/types"

export function SortIcon(props: {
    type?: "text" | "numeric"
    isActiveIcon?: boolean
    order: SortOrder
}): React.ReactElement {
    const type = props.type ?? "numeric"
    const isActiveIcon = props.isActiveIcon ?? false

    let faIcon: IconDefinition

    if (type === "text")
        faIcon =
            props.order === SortOrder.desc ? faSortAlphaUpAlt : faSortAlphaDown
    else
        faIcon =
            props.order === SortOrder.desc
                ? faSortAmountDown
                : faSortAmountUpAlt

    return (
        <span
            className={classnames({ "sort-icon": true, active: isActiveIcon })}
        >
            <FontAwesomeIcon icon={faIcon} />
        </span>
    )
}
