/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionIdBuilder = powerbi.extensibility.ISelectionIdBuilder;
import DataView = powerbi.DataView;
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist
import VisualObjectInstance = powerbi.VisualObjectInstance
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject


import { VisualSettings } from "./settings";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import * as d3 from "d3";
import { ProcessedVisualSettings } from "./processedvisualsettings";

import { dataPoint, propertyStateName, propertyStateValue, propertyStatesInput, propertyStatesOutput } from './interfaces'
import { getGroupedKeyNames, levelProperties } from './functions'

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
const propertiesOf = <TObj>(_obj: (TObj | undefined) = undefined) => <T extends keyof TObj>(name: T): T => name;

import * as enums from "./enums"
import { select, merge } from "d3";

export class Visual implements IVisual {
    private target: HTMLElement;
    private selectionManager: ISelectionManager;
    private selectionIds: any = {};
    private host: IVisualHost;
    private isEventUpdate: boolean = false;
    private visualSettings: VisualSettings;
    private selectionIdBuilder: ISelectionIdBuilder;

    private dataPoints: dataPoint[];
    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;



    constructor(options: VisualConstructorOptions) {
        this.selectionIdBuilder = options.host.createSelectionIdBuilder();
        this.selectionManager = options.host.createSelectionManager();
        this.host = options.host;
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('navigator', true);

        let defs = this.svg.append("defs");
        this.container = this.svg.append("g")
            .classed('container', true);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        let settingsKeys = Object.keys(settings)
        for (let i = 0; i < settingsKeys.length; i++) {
            let settingKey: string = settingsKeys[i]
            let groupedKeyNamesArr: propertyStateName[] = getGroupedKeyNames(Object.keys(settings[settingKey]))
            for (let j = 0; j < groupedKeyNamesArr.length; j++) {
                let groupedKeyNames: propertyStateName = groupedKeyNamesArr[j]
                switch (settings[settingKey].state) {
                    case enums.State.all:
                        delete settings[settingKey][groupedKeyNames.selected]
                        delete settings[settingKey][groupedKeyNames.unselected]
                        break
                    case enums.State.selected:
                        delete settings[settingKey][groupedKeyNames.all]
                        delete settings[settingKey][groupedKeyNames.unselected]
                        break
                    case enums.State.unselected:
                        delete settings[settingKey][groupedKeyNames.all]
                        delete settings[settingKey][groupedKeyNames.selected]
                        break
                }
            }
        }

        if (!settings.icon.icons) {
            let iconSettingsKeys: string[] = Object.keys(settings.icon)
            for (let i = 0; i < iconSettingsKeys.length; i++)
                if (iconSettingsKeys[i] != 'icons')
                    delete settings.icon[iconSettingsKeys[i]]
        }
        if (settings.icon.currentPlacement == enums.Icon_Placement.left) {
            delete settings.icon.hmarginA
            delete settings.icon.hmarginS
            delete settings.icon.hmarginU
        } else {
            delete settings.icon.widthA
            delete settings.icon.widthS
            delete settings.icon.widthU
        }

        if (settings.layout.sizingMethod != enums.Button_Sizing_Method.fixed) {
            delete settings.layout.buttonWidth;
            delete settings.layout.buttonHeight;
            delete settings.layout.buttonAlignment;
        }
        if (settings.layout.buttonLayout != enums.Button_Layout.grid) {
            delete settings.layout.rowLength
        }
        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    public update(options: VisualUpdateOptions) {
        if (!(options && options.dataViews && options.dataViews[0]))
            return
        this.visualSettings = VisualSettings.parse(options.dataViews[0]) as VisualSettings
        console.log("updating from...", this.visualSettings.icon.placementA, this.visualSettings.icon.placementS, this.visualSettings.icon.placementU)
        let objects: powerbi.VisualObjectInstancesToPersist = {
            merge: []
        }

        let objKeys = Object.keys(this.visualSettings)
        for (let i = 0; i < objKeys.length; i++) {
            let objKey: string = objKeys[i]
            let propKeys: string[] = Object.keys(this.visualSettings[objKey])
            let groupedKeyNamesArr: propertyStateName[] = getGroupedKeyNames(propKeys)

            let object: powerbi.VisualObjectInstance = {
                objectName: objKey,
                selector: undefined,
                properties:
                    {}
            }

            for (let j = 0; j < groupedKeyNamesArr.length; j++) {
                let groupedKeyNames: propertyStateName = groupedKeyNamesArr[j]
                let type = typeof this.visualSettings[objKey][groupedKeyNames.all]
                let propertyState: propertyStatesInput = {
                    all: this.visualSettings[objKey][groupedKeyNames.all],
                    selected: this.visualSettings[objKey][groupedKeyNames.selected],
                    unselected: this.visualSettings[objKey][groupedKeyNames.unselected],
                    defaultValue: this.visualSettings[objKey][groupedKeyNames.defaultValue],
                    state: this.visualSettings[objKey].state
                }
                let leveledPropertyState = levelProperties(propertyState)

                if (leveledPropertyState.didChange) {
                    object.properties[groupedKeyNames.all] = leveledPropertyState.all
                    object.properties[groupedKeyNames.selected] = leveledPropertyState.selected
                    object.properties[groupedKeyNames.unselected] = leveledPropertyState.unselected
                }
            }
            if (Object.keys(object.properties).length != 0)
                objects.merge.push(object)
        }
        if (objects.merge.length != 0)
            this.host.persistProperties(objects);



        this.dataPoints = []
        const dataView = options.dataViews[0]
        const categories = dataView.categorical.categories;

        for (let categoryIndex = 0; categoryIndex < categories[0].values.length; categoryIndex++) {
            const pageValue: powerbi.PrimitiveValue = categories[0].values[categoryIndex];
            const iconValue: powerbi.PrimitiveValue = categories[1].values[categoryIndex];
            const categorySelectionId = this.host.createSelectionIdBuilder()
                .withCategory(categories[0], categoryIndex) // we have only one category (`Page Name`)
                .createSelectionId();
            this.dataPoints.push({
                value: pageValue,
                iconValue: iconValue,
                selectionId: categorySelectionId
            });
        }

        let data: ProcessedVisualSettings[] = [];
        for (let i = 0; i < this.dataPoints.length; i++) 
            data.push(new ProcessedVisualSettings(i, this.dataPoints, this.visualSettings, this.selectionManager, options))
        

        this.svg
            .style('width', options.viewport.width)
            .style('height', options.viewport.height)

        let defs = this.svg.select("defs").html("")
        let shadow = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%")
            .append("feDropShadow")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("stdDeviation", 3)
            .attr("flood-color", this.visualSettings.effects.shadowColor)
            .attr("flood-opacity", 1 - this.visualSettings.effects.shadowTransparency/100)

        let frames = this.container.selectAll('rect').data(data)
        frames.exit().remove()
        frames.enter().append('rect')
            .attr("class", "frame");

        frames = this.container.selectAll('rect').data(data)
        frames
            .attr("fill", function (d) { return d.buttonFill })
            .style("fill-opacity", function (d) { return d.buttonFillOpacity })
            .style("stroke", function (d) { return d.buttonStroke })
            .style("stroke-width", function (d) { return d.buttonStrokeWidth })
            .style("filter", function(d){return d.filters})
            .attr("height", function (d) { return d.buttonHeight })
            .attr("width", function (d) { return d.buttonWidth })
            .attr("x", function (d) { return d.buttonXpos })
            .attr("y", function (d) { return d.buttonYpos})
            .on('click', (d, i) => {
                this.selectionManager.select(this.dataPoints[i].selectionId)
                this.update(options)
            })

        let titleFOs = this.container.selectAll('foreignObject').data(data)
        titleFOs.exit().remove()
        titleFOs.enter().append('foreignObject')
            .attr("class", "titleForeignObject")
            .append("xhtml:div")
            .attr("class", "titleTable")
            .append("xhtml:div")
            .attr("class", "titleTableCell")
            .append("xhtml:div")
            .attr("class", "titleContainer")

        titleFOs = this.container.selectAll('foreignObject').data(data)
            .attr("height", function (d) { return d.buttonHeight })
            .attr("width", function (d) { return d.buttonWidth })
            .attr("x", function (d) { return d.buttonXpos })
            .attr("y", function (d) { return d.buttonYpos })


        let titleTables = titleFOs.select('.titleTable')
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "table")

        let titleTableCells = titleTables.select(".titleTableCell")
            .style("display", "table-cell")
            .style("vertical-align", "middle")
            .style("opacity", function (d) { return d.textFillOpacity })
            .style("font-size", function (d) { return d.fontSize + "pt" })
            .style("font-family", function (d) { return d.fontFamily })
            .style("text-align", function (d) { return d.textAlign })
            .style("color", function (d) { return d.textFill })
            .on('click', (d, i) => {
                this.selectionManager.select(this.dataPoints[i].selectionId)
                this.update(options)
            })
            .html("")
            .append(function (d) { return d.titleContent })
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}   