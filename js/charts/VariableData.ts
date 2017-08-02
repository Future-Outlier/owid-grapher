import * as _ from 'lodash'
import * as $ from 'jquery'
import ChartType from './ChartType'
import ChartConfig from './ChartConfig'
import {observable, computed, autorun, action} from 'mobx'

declare var Global: { rootUrl: string }

export class Variable {
	@observable.ref id: number
	@observable.ref name: string
	@observable.ref description: string
	@observable.ref unit: string
	@observable.ref coverage: string
	@observable.ref timespan: string
	@observable.struct source: {
		name: string,
		description: string
	}
	@observable.ref years: number[]
	@observable.ref entities: string[]
	@observable.ref values: (string|number)[]

	constructor(meta: Partial<Variable>) {
		_.extend(this, meta)
	}

	@computed get hasNumericValues(): boolean {
		return _.some(this.values, v => _.isFinite(v))
	}

	@computed get numericValues(): number[] {
		return _.sortBy(_.filter(this.values, v => _.isNumber(v))) as number[]
	}	

	@computed get categoricalValues(): string[] {
		return _.sortBy(_.filter(this.values, v => _.isString(v))) as string[]
	}

	@computed get hasCategoricalValues(): boolean {
		return _.some(this.values, v => _.isString(v))
	}

	@computed get entitiesUniq(): string[] {
		return _.uniq(this.entities)
	}

	@computed get yearsUniq(): number[] {
		return _.uniq(this.years)
	}

	@computed get minYear() {
		return _.min(this.yearsUniq)
	}

	@computed get maxYear(): number {
		return _.max(this.yearsUniq) as number
	}

	@computed get minValue(): number {
		return _.min(this.numericValues) as number
	}

	@computed get maxValue(): number {
		return _.max(this.numericValues) as number
	}

	@computed get isNumeric(): boolean {
		return this.hasNumericValues && !this.hasCategoricalValues		
	}

	@computed get shortUnit(): string|null {
		const {unit} = this
		if (!unit) return null

		if (unit.length < 3)
			return unit
		else {
			const commonShortUnits = ['$', '£', '€', '%']
			if (_.some(commonShortUnits, u => unit[0] == u))
				return unit[0]
			else
				return null
		}
	}
}

interface EntityMeta {
	id: number,
	name: string,
	code: string
}

export default class VariableData {
	chart: ChartConfig
	@observable.ref dataRequest: any
	@observable.ref variablesById: {[id: number]: Variable} = {}
	@observable.ref entityMetaById: {[id: number]: EntityMeta} = {}

	constructor(chart: ChartConfig) {
		this.chart = chart
		this.update()
	}

	@computed get variableIds() {
		return this.chart.dimensions.map(d => d.variableId)
	}

	@computed get entityMetaByKey() {
		return _.keyBy(this.entityMetaById, 'name')
	}

	@computed get cacheTag() {
		return this.chart.variableCacheTag
	}

	@computed get availableEntities() {
		return _.keys(this.entityMetaByKey)
	}

	@computed get variables(): Variable[] {
		return _.values(this.variablesById)
	}

	update() {
		const {variableIds, cacheTag} = this
		// If the requested data changes and we're already downloading a previous request, we
		// might as well cancel it since it won't be what we're after
		if (this.dataRequest) {
			this.dataRequest.abort()
			this.dataRequest = null
		}

		if (variableIds.length == 0) {
			// No data to download
			return
		}

		if (cacheTag)
			this.dataRequest = $.get(Global.rootUrl + "/data/variables/" + variableIds.join("+") + "?v=" + cacheTag);
		else {
			// Editor cachebusting
			this.dataRequest = $.get(Global.rootUrl + "/data/variables/" + variableIds.join("+") + "?v=" + Date.now());
		}

		this.dataRequest.done((rawData: string) => {
			this.dataRequest = null
			this.receiveData(rawData)
		})
	}

	@action.bound receiveData(rawData: string) {
		var lines = rawData.split("\r\n");

		let variablesById: {[id: string]: Variable} = {}
		let entityMetaById: {[key: string]: EntityMeta} = {}

		lines.forEach((line, i) => {
			if (i === 0) { // First line contains the basic variable metadata
				_(JSON.parse(line).variables).each((d: any) => {
					variablesById[d.id] = new Variable(d)
				})
			} else if (i == lines.length-1) { // Final line is entity id => name mapping
				entityMetaById = JSON.parse(line)
			} else {
				const points = line.split(";");
				let variable: Variable;
				points.forEach(function(d, j) {
					if (j === 0) {
						variable = variablesById[d];
					} else {
						var spl = d.split(",");
						variable.years.push(+spl[0]);
						variable.entities.push(spl[1]);
						const asNumber = parseFloat(spl[2])
						if (asNumber.toString() == spl[2])
							variable.values.push(asNumber)
						else
							variable.values.push(spl[2]);
					}
				});
			}
		});

		_.each(variablesById, v => v.entities = _.map(v.entities, id => entityMetaById[id].name))
		_.each(entityMetaById, (e, id) => e.id = +id)
		this.variablesById = variablesById
		this.entityMetaById = entityMetaById
	}
}