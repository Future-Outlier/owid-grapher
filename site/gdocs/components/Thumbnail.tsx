import {
    ARCHVED_THUMBNAIL_FILENAME,
    DEFAULT_THUMBNAIL_FILENAME,
} from "@ourworldindata/types"
import { GRAPHER_DYNAMIC_THUMBNAIL_URL } from "../../../settings/clientSettings"
import Image from "./Image"

export const Thumbnail = ({
    thumbnail,
    className,
}: {
    thumbnail?: string
    className?: string
}) => {
    if (!thumbnail)
        return (
            <img src={`/${DEFAULT_THUMBNAIL_FILENAME}`} className={className} />
        )
    if (
        thumbnail.startsWith(GRAPHER_DYNAMIC_THUMBNAIL_URL) ||
        thumbnail.endsWith(ARCHVED_THUMBNAIL_FILENAME) ||
        thumbnail.endsWith(DEFAULT_THUMBNAIL_FILENAME)
    ) {
        return <img src={thumbnail} className={className} />
    } else {
        return (
            <Image
                filename={thumbnail}
                containerType="thumbnail"
                className={className}
            />
        )
    }
}
