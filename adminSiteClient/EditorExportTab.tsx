import { IReactionDisposer, action, autorun, computed, observable } from "mobx"
import { observer } from "mobx-react"
import React from "react"
import { ChartEditor } from "./ChartEditor.js"
import { Section, SelectField, Toggle } from "./Forms.js"
import { Grapher, GrapherStaticFormat } from "@ourworldindata/grapher"
import {
    Bounds,
    triggerDownloadFromBlob,
    capitalize,
} from "@ourworldindata/utils"

type ExportSettings = Pick<
    Grapher,
    | "hideTitle"
    | "forceHideAnnotationFieldsInTitle"
    | "hideSubtitle"
    | "hideLogo"
    | "hideNote"
    | "hideOriginUrl"
>

type ExportSettingsByChartId = Record<number, ExportSettings>

type Format = "png" | "svg"
type ExportFilename = `${string}.${Format}`

const STORAGE_KEY = "chart-export-settings"

const DEFAULT_SETTINGS: ExportSettings = {
    hideTitle: false,
    forceHideAnnotationFieldsInTitle: { entity: false, time: false },
    hideSubtitle: false,
    hideLogo: false,
    hideNote: false,
    hideOriginUrl: false,
}

@observer
export class EditorExportTab extends React.Component<{ editor: ChartEditor }> {
    @observable private settings = DEFAULT_SETTINGS
    private originalSettings = DEFAULT_SETTINGS
    private disposers: IReactionDisposer[] = []

    componentDidMount(): void {
        this.saveOriginalSettings()

        if (sessionStorage) {
            this.loadSettingsFromSessionStorage()
        }

        this.disposers.push(autorun(() => this.updateGrapher()))
    }

    componentWillUnmount(): void {
        this.resetGrapher()

        if (sessionStorage) {
            this.saveSettingsToSessionStorage()
        }

        this.disposers.forEach((dispose) => dispose())
    }

    private loadSettingsFromSessionStorage() {
        const settingsByChartId = (loadJSONFromSessionStorage(STORAGE_KEY) ??
            {}) as ExportSettingsByChartId
        const settings = settingsByChartId[this.chartId]
        if (settings) {
            this.settings = settings
        }
    }

    private saveSettingsToSessionStorage() {
        const settingsByChartId = (loadJSONFromSessionStorage(STORAGE_KEY) ??
            {}) as ExportSettingsByChartId
        settingsByChartId[this.chartId] = this.settings
        saveJSONToSessionStorage(STORAGE_KEY, settingsByChartId)
    }

    private saveOriginalSettings() {
        this.originalSettings = {
            hideTitle: this.grapher.hideTitle,
            forceHideAnnotationFieldsInTitle:
                this.grapher.forceHideAnnotationFieldsInTitle,
            hideSubtitle: this.grapher.hideSubtitle,
            hideLogo: this.grapher.hideLogo,
            hideNote: this.grapher.hideNote,
            hideOriginUrl: this.grapher.hideOriginUrl,
        }
    }

    private resetGrapher() {
        Object.assign(this.grapher, this.originalSettings)
    }

    private updateGrapher() {
        Object.assign(this.grapher, this.settings)
    }

    @computed private get grapher(): Grapher {
        return this.props.editor.grapher
    }

    @computed private get chartId(): number {
        // the id is undefined for unsaved charts
        return this.grapher.id ?? 0
    }

    @computed private get baseFilename(): string {
        return this.props.editor.grapher.displaySlug
    }

    @action.bound private onPresetChange(value: string) {
        this.props.editor.staticPreviewFormat = value as GrapherStaticFormat
    }

    @action.bound private onDownloadDesktopSVG() {
        this.download(
            `${this.baseFilename}-desktop.svg`,
            this.grapher.idealBounds
        )
    }

    @action.bound private onDownloadDesktopPNG() {
        this.download(
            `${this.baseFilename}-desktop.png`,
            this.grapher.idealBounds
        )
    }

    @action.bound private onDownloadMobileSVG() {
        this.download(
            `${this.baseFilename}-mobile.svg`,
            this.grapher.staticBounds
        )
    }

    @action.bound private onDownloadMobilePNG() {
        this.download(
            `${this.baseFilename}-mobile.png`,
            this.grapher.staticBounds
        )
    }

    async download(filename: ExportFilename, bounds: Bounds) {
        try {
            const { blob: pngBlob, svgBlob } =
                await this.grapher.rasterize(bounds)
            if (filename.endsWith("svg") && svgBlob) {
                triggerDownloadFromBlob(filename, svgBlob)
            } else if (filename.endsWith("png") && pngBlob) {
                triggerDownloadFromBlob(filename, pngBlob)
            }
        } catch (err) {
            console.error(err)
        }
    }

    render() {
        const { editor } = this.props
        return (
            <div className="EditorExportTab">
                <Section name="Mobile image size">
                    <SelectField
                        label="Preset"
                        value={editor.staticPreviewFormat}
                        onValue={this.onPresetChange}
                        options={Object.keys(GrapherStaticFormat)
                            .filter(
                                (format) =>
                                    format !== GrapherStaticFormat.landscape
                            )
                            .map((format) => ({
                                value: format,
                                label: capitalize(format),
                            }))}
                    />
                </Section>
                <Section name="Displayed elements">
                    <Toggle
                        label="Title"
                        value={!this.settings.hideTitle}
                        onValue={(value) => (this.settings.hideTitle = !value)}
                    />
                    <Toggle
                        label="Title suffix: automatic entity"
                        value={
                            !this.settings.forceHideAnnotationFieldsInTitle
                                ?.entity
                        }
                        onValue={(value) =>
                            (this.settings.forceHideAnnotationFieldsInTitle.entity =
                                !value)
                        }
                    />
                    <Toggle
                        label="Title suffix: automatic time"
                        value={
                            !this.settings.forceHideAnnotationFieldsInTitle
                                ?.time
                        }
                        onValue={(value) =>
                            (this.settings.forceHideAnnotationFieldsInTitle.time =
                                !value)
                        }
                    />
                    <Toggle
                        label="Subtitle"
                        value={!this.settings.hideSubtitle}
                        onValue={(value) =>
                            (this.settings.hideSubtitle = !value)
                        }
                    />
                    <Toggle
                        label="Logo"
                        value={!this.settings.hideLogo}
                        onValue={(value) => (this.settings.hideLogo = !value)}
                    />
                    <Toggle
                        label="Note"
                        value={!this.settings.hideNote}
                        onValue={(value) => (this.settings.hideNote = !value)}
                    />
                    <Toggle
                        label="Origin URL"
                        value={!this.settings.hideOriginUrl}
                        onValue={(value) =>
                            (this.settings.hideOriginUrl = !value)
                        }
                    />
                </Section>
                <Section name="Export static chart">
                    <div className="DownloadButtons">
                        <button
                            className="btn btn-primary"
                            onClick={this.onDownloadDesktopPNG}
                        >
                            Download Desktop PNG
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.onDownloadDesktopSVG}
                        >
                            Download Desktop SVG
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.onDownloadMobilePNG}
                        >
                            Download Mobile PNG
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={this.onDownloadMobileSVG}
                        >
                            Download Mobile SVG
                        </button>
                    </div>
                </Section>
            </div>
        )
    }
}

function loadJSONFromSessionStorage(key: string): unknown | undefined {
    const rawJSON = sessionStorage.getItem(key)
    if (!rawJSON) return undefined
    try {
        return JSON.parse(rawJSON)
    } catch (err) {
        console.error(err)
        return undefined
    }
}

function saveJSONToSessionStorage(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value))
}
