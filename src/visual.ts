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


import { VisualSettings } from "./settings";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import * as d3 from "d3";
import { Frame } from './frame'
import { Title } from './title'

import { dataPoint, propertyStates, propertyStatesInput, propertyStatesOutput } from './interfaces'
import { getGroupedKeyNames } from './functions'

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

        this.container = this.svg.append("g")
            .classed('container', true);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        console.log("enumerating")
        switch (settings.button.state) {
            case enums.State.all:
                delete settings.button.colorS
                delete settings.button.colorU
                break
            case enums.State.selected:
                delete settings.button.colorA
                delete settings.button.colorU
                break
            case enums.State.unselected:
                delete settings.button.colorA
                delete settings.button.colorS
                break
        }


        if (settings.button.sizingMethod != enums.Button_Sizing_Method.fixed) {
            delete settings.button.buttonWidth;
            delete settings.button.buttonHeight;
            delete settings.button.buttonAlignment;
        }
        if (settings.button.layout != enums.Button_Layout.grid) {
            delete settings.button.rowLength
        }
        if (!settings.icon.icons) {
            delete settings.icon.placement
            delete settings.icon.width
            delete settings.icon.padding
        }

        if (settings.icon.placement == enums.Icon_Placement.left) {
            delete settings.icon.hmargin
        } else {
            delete settings.icon.width
        }


        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    public levelProperties(propertyStates: propertyStatesInput): propertyStatesOutput {
        let _all = propertyStates.all
        let _selected = propertyStates.selected
        let _unselected = propertyStates.unselected
        if (!_all && !_selected && !_unselected)
            _all = '#fff'

        if (propertyStates.state == enums.State.all && _all)
            _selected = _unselected = _all

        if (!_selected != !_unselected) { //xor
            if (_selected)
                _unselected = _all
            else
                _selected = _all
            _all = ""
        }

        if (propertyStates.state != enums.State.all && _selected != _unselected)
            _all = ""

        return {
            all: _all,
            selected: _selected,
            unselected: _unselected,
            didChange: !(propertyStates.all == _all && propertyStates.selected == _selected && propertyStates.unselected == _unselected)
        }
    }


    public update(options: VisualUpdateOptions) {
        if (!(options && options.dataViews && options.dataViews[0]))
            return


        this.visualSettings = this.visualSettings = VisualSettings.parse(options.dataViews[0]) as VisualSettings

        let objects: powerbi.VisualObjectInstancesToPersist = {
            merge: []
        }

        let objKeys = Object.keys(this.visualSettings)
        for (let i = 0; i < objKeys.length; i++) {
            let objKey: string = objKeys[i]
            let propKeys: string[] = Object.keys(this.visualSettings[objKey])
            console.log("getting prop keys")
            console.log(propKeys)
            let groupedKeyNamesArr: propertyStates[] = getGroupedKeyNames(propKeys)

            let object: powerbi.VisualObjectInstance = {
                objectName: objKey,
                selector: undefined,
                properties:
                    {}
            }

            for (let j = 0; j < groupedKeyNamesArr.length; j++) {
                let groupedKeyNames: propertyStates = groupedKeyNamesArr[j]
                let propertyState: propertyStatesInput = {
                    all: this.visualSettings[objKey][groupedKeyNames.all],
                    selected: this.visualSettings[objKey][groupedKeyNames.selected],
                    unselected: this.visualSettings[objKey][groupedKeyNames.unselected],
                    state: this.visualSettings[objKey].state
                }
                let leveledPropertyState = this.levelProperties(propertyState)

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

        let frameData: Frame[] = [];
        let titleData: Title[] = []
        for (let i = 0; i < this.dataPoints.length; i++) {
            frameData.push(new Frame(i, this.dataPoints, this.visualSettings, this.selectionManager, options))
            titleData.push(new Title(i, this.dataPoints, this.visualSettings, this.selectionManager, options, frameData[i]))
        }


        this.svg
            .style('width', options.viewport.width)
            .style('height', options.viewport.height)


        let frames = this.container.selectAll('rect').data(frameData)
        frames.exit().remove()
        frames.enter().append('rect')
            .attr("class", "frame");

        frames = this.container.selectAll('rect').data(frameData)
        frames
            .attr("fill", function (d) { return d.fill })
            .style("fill-opacity", function (d) { return d.fill_opacity })
            .style("stroke", function (d) { return d.stroke })
            .style("stroke-width", function (d) { return d.strokeWidth })
            .attr("height", function (d) { return d.height })
            .attr("width", function (d) { return d.width })
            .attr("x", function (d) { return d.x_pos })
            .attr("y", function (d) { return d.y_pos })
            .on('click', (d, i) => {
                this.selectionManager.select(this.dataPoints[i].selectionId)
                this.update(options)
            })

        let titleFOs = this.container.selectAll('foreignObject').data(titleData)
        titleFOs.exit().remove()
        titleFOs.enter().append('foreignObject')
            .attr("class", "titleForeignObject")
            .append("xhtml:div")
            .attr("class", "titleTable")
            .append("xhtml:div")
            .attr("class", "titleTableCell")
            .append("xhtml:div")
            .attr("class", "titleContainer")

        titleFOs = this.container.selectAll('foreignObject').data(titleData)
            .attr("height", function (d, i) { return frameData[i].height })
            .attr("width", function (d, i) { return frameData[i].width })
            .attr("x", function (d, i) { return frameData[i].x_pos })
            .attr("y", function (d, i) { return frameData[i].y_pos })


        let titleTables = titleFOs.select('.titleTable')
            .style("height", "100%")
            .style("width", "100%")
            .style("display", "table")

        let titleTableCells = titleTables.select(".titleTableCell")
            .style("display", "table-cell")
            .style("vertical-align", "middle")
            .style("opacity", function (d) { return d.fill_opacity })
            .style("font-size", function (d) { return d.font_size + "pt" })
            .style("font-family", function (d) { return d.font_family })
            .style("text-align", function (d) { return d.align })
            .style("color", function (d) { return d.fill })
            .html("")
            .append(function (d) { return d.content })
            .on('click', (d, i) => {
                this.selectionManager.select(this.dataPoints[i].selectionId)
                this.update(options)
            })
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}   