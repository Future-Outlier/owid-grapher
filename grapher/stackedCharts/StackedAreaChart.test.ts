#! /usr/bin/env yarn jest

import { StackedAreaChart } from "./StackedAreaChart"
import {
    SampleColumnSlugs,
    SynthesizeFruitTable,
    SynthesizeGDPTable,
} from "coreTable/OwidTableSynthesizers"
import { ChartManager } from "grapher/chart/ChartManager"
import { observable } from "mobx"
import { AxisConfig } from "grapher/axis/AxisConfig"

class MockManager implements ChartManager {
    table = SynthesizeGDPTable({
        timeRange: [1950, 2010],
    })
    yColumnSlugs = [SampleColumnSlugs.GDP]
    yAxis = new AxisConfig({ min: 0, max: 200 })
    @observable isRelativeMode = false
}

it("can create a basic chart", () => {
    const manager = new MockManager()
    const chart = new StackedAreaChart({ manager })
    expect(chart.failMessage).toBeTruthy()
    manager.table.selectAll()
    expect(chart.failMessage).toEqual("")
})

describe("column charts", () => {
    it("can show custom colors for a column series", () => {
        let table = SynthesizeFruitTable().selectSample(1)
        table = table.withTransformedDefs((def) => {
            def.color = def.slug // Slug is not a valid color but good enough for testing
            return def
        })
        const columnsChart: ChartManager = {
            table,
            yColumnSlugs: [
                SampleColumnSlugs.Fruit,
                SampleColumnSlugs.Vegetables,
            ],
        }
        const chart = new StackedAreaChart({ manager: columnsChart })
        expect(chart.seriesColors).toEqual([
            SampleColumnSlugs.Vegetables,
            SampleColumnSlugs.Fruit,
        ])
    })
})

it("use author axis settings unless relative mode", () => {
    const manager = new MockManager()
    const chart = new StackedAreaChart({ manager })
    manager.table.selectSample(3)
    expect(chart.verticalAxis.domain[1]).toBeGreaterThan(100)
    manager.isRelativeMode = true
    expect(chart.verticalAxis.domain).toEqual([0, 100])
})

it("shows a failure message if there are columns but no series", () => {
    const chart = new StackedAreaChart({
        manager: { table: SynthesizeFruitTable() },
    })
    expect(chart.failMessage).toBeTruthy()
})

it("can filter a series when there are no points", () => {
    const chart = new StackedAreaChart({
        manager: {
            table: SynthesizeFruitTable({
                entityCount: 2,
                timeRange: [2000, 2003],
            })
                .selectSample(1)
                .replaceRandomCells(6, [SampleColumnSlugs.Fruit]),
        },
    })

    expect(chart.series.length).toEqual(1)
})
