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

import { dataPoint, propertyStateName, stateIds} from './interfaces'
import { getPropertyStateNameArr, addFilters, getObjectsToPersist, levelProperties } from './functions'

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import * as enums from "./enums"
import { select, merge } from "d3";

export class Visual implements IVisual {
    private target: HTMLElement;
    private selectionManager: ISelectionManager;
    private selectionManagerHover: ISelectionManager;
    private selectionIds: any = {};
    private host: IVisualHost;
    private isEventUpdate: boolean = false;
    private visualSettings: VisualSettings;
    private selectionIdBuilder: ISelectionIdBuilder;

    private dataPoints: dataPoint[];
    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;
    private hoveredIdKey: string;
    private hoveredIndexUnbound: number;
    private selectionIndexUnbound: number;



    constructor(options: VisualConstructorOptions) {
        this.selectionIdBuilder = options.host.createSelectionIdBuilder();
        this.selectionManager = options.host.createSelectionManager();
        this.selectionManagerHover = options.host.createSelectionManager();
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
            let groupedKeyNamesArr: propertyStateName[] = getPropertyStateNameArr(Object.keys(settings[settingKey]))
            for (let j = 0; j < groupedKeyNamesArr.length; j++) {
                let groupedKeyNames: propertyStateName = groupedKeyNamesArr[j]
                switch (settings[settingKey].state) {
                    case enums.State.all:
                        delete settings[settingKey][groupedKeyNames.selected]
                        delete settings[settingKey][groupedKeyNames.unselected]
                        delete settings[settingKey][groupedKeyNames.hover]
                        break
                    case enums.State.selected:
                        delete settings[settingKey][groupedKeyNames.all]
                        delete settings[settingKey][groupedKeyNames.unselected]
                        delete settings[settingKey][groupedKeyNames.hover]
                        break
                    case enums.State.unselected:
                        delete settings[settingKey][groupedKeyNames.all]
                        delete settings[settingKey][groupedKeyNames.selected]
                        delete settings[settingKey][groupedKeyNames.hover]
                        break
                    case enums.State.hover:
                        delete settings[settingKey][groupedKeyNames.all]
                        delete settings[settingKey][groupedKeyNames.selected]
                        delete settings[settingKey][groupedKeyNames.unselected]
                        break
                }
            }
        }
        let iconSettingsKeys: string[] = Object.keys(settings.icon)
        if (!settings.icon.icons) 
            for (let i = 0; i < iconSettingsKeys.length; i++)
                if (iconSettingsKeys[i] != 'icons')
                    delete settings.icon[iconSettingsKeys[i]]
        let effectSettingsKeys: string[] = Object.keys(settings.effects)
        if(!settings.effects.shadow)
            for (let i = 0; i < effectSettingsKeys.length; i++)
                if (effectSettingsKeys[i].startsWith("shadow") && effectSettingsKeys[i] != "shadow")
                    delete settings.effects[effectSettingsKeys[i]]
       if(!settings.effects.glow)
            for (let i = 0; i < effectSettingsKeys.length; i++)
                if (effectSettingsKeys[i].startsWith("glow") && effectSettingsKeys[i] != "glow")
                    delete settings.effects[effectSettingsKeys[i]]
        
        switch(settings.content.source){
            case enums.Content_Source.databound:
                delete settings.content.n
                for(let i = 1; i < 11; i++){
                    delete settings.content['text' + i]
                    delete settings.content['icon' + i]
                }
                break
            case enums.Content_Source.fixed:
                for(let i = 10; i > settings.content.n; i--){
                    delete settings.content['text' + i]
                    delete settings.content['icon' + i]
                }
                if(!this.visualSettings.content.icons)
                    for(let i = 1; i < 11; i++)
                        delete settings.content['icon' + i]
                break
        }

        if (settings.layout.sizingMethod != enums.Button_Sizing_Method.fixed) {
            delete settings.layout.buttonWidth;
            delete settings.layout.buttonHeight;
            delete settings.layout.buttonAlignment;
        }
        if (settings.layout.buttonLayout != enums.Button_Layout.grid) {
            delete settings.layout.rowLength
        }

        if(settings.layout.buttonShape != enums.Button_Shape.parallelogram){
            delete settings.layout.parallelogramAngle
        }
        if(settings.layout.buttonShape != enums.Button_Shape.chevron){
            delete settings.layout.chevronAngle
        }
        if(settings.layout.buttonShape != enums.Button_Shape.pentagon){
            delete settings.layout.pentagonAngle
        }
        if(settings.layout.buttonShape != enums.Button_Shape.hexagon){
            delete settings.layout.hexagonAngle
        }
        if(settings.layout.buttonShape != enums.Button_Shape.tab_cutCorners){
            delete settings.layout.tab_cutCornersLength
        }
        if(settings.layout.buttonShape != enums.Button_Shape.tab_cutCorner){
            delete settings.layout.tab_cutCornerLength
        }

        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    public update(options: VisualUpdateOptions) {
        if (!(options && options.dataViews && options.dataViews[0]))
            return
        this.visualSettings = VisualSettings.parse(options.dataViews[0]) as VisualSettings
        let objects: powerbi.VisualObjectInstancesToPersist = getObjectsToPersist(this.visualSettings)
        if (objects.merge.length != 0)
            this.host.persistProperties(objects);
        

        this.dataPoints = []
        const dataView = options.dataViews[0]
        const categories = dataView.categorical.categories;
        switch(this.visualSettings.content.source){
            case enums.Content_Source.databound:
                for (let categoryIndex = 0; categoryIndex < categories[0].values.length; categoryIndex++) {
                    const pageValue: powerbi.PrimitiveValue = categories[0].values[categoryIndex];
                    const iconValue: powerbi.PrimitiveValue = categories[1].values[categoryIndex];
                    const categorySelectionId = this.host.createSelectionIdBuilder()
                        .withCategory(categories[0], categoryIndex)
                        .createSelectionId();
                    this.dataPoints.push({
                        value: pageValue,
                        iconValue: iconValue,
                        selectionId: categorySelectionId,
                    });
                }
                break
            case enums.Content_Source.fixed:
                for(let i = 0; i < this.visualSettings.content.n; i++) {
                    this.dataPoints.push({
                        value: this.visualSettings.content['text'+(i+1)],
                        iconValue: this.visualSettings.content.icons ? this.visualSettings.content['icon'+(i+1)] : "",
                    });
                }
        }

        let stateIds: stateIds = {
            hoveredIdKey: this.hoveredIdKey,
            selectionIndexUnbound: this.selectionIndexUnbound,
            hoveredIndexUnbound: this.hoveredIndexUnbound
        }
        
        this.svg.select("defs").html("")
        let data: ProcessedVisualSettings[] = [];
        for (let i = 0; i < this.dataPoints.length; i++){
            data.push(new ProcessedVisualSettings(i, this.dataPoints, this.visualSettings, this.selectionManager, stateIds, options))
            addFilters(this.svg.select("defs"), data[i])
        }

        this.svg
            .style('width', options.viewport.width)
            .style('height', options.viewport.height)
        
        

        this.container.selectAll(".frameContainer, .titleForeignObject, .cover").filter((d, i, nodes: Element[]) => {
            return !nodes[i].classList.contains(this.visualSettings.layout.buttonShape)
        }).remove()


        let framesContainer = this.container.selectAll('.frameContainer').data(data)
        framesContainer.exit().remove()
        let framesContainerEnter = framesContainer.enter().append('g')
            .attr("class", "frameContainer " + this.visualSettings.layout.buttonShape)

        framesContainerEnter.append('path').attr("class", "fill")
        framesContainerEnter.append('path').attr("class", "stroke")
        framesContainer = this.container.selectAll('.frameContainer').data(data)
        
        framesContainer.select(".fill")
            .attr("d", function (d) { return d.shapePath })
            .attr("fill", function (d) { return d.buttonFill })
            .style("fill-opacity", function (d) { return d.buttonFillOpacity })
            .style("filter", function (d) { return d.filter })
            

        framesContainer.select(".stroke")
            .attr("d", function (d) { return d.strokePath })
            .style("fill-opacity", 0)
            .style("stroke", function (d) { return d.buttonStroke })
            .style("stroke-width", function (d) { return d.buttonStrokeWidth })

        let titleFOs = this.container.selectAll('foreignObject').data(data)
        titleFOs.exit().remove()
        titleFOs.enter().append('foreignObject')
            .attr("class", "titleForeignObject " + this.visualSettings.layout.buttonShape)
            .append("xhtml:div")
            .attr("class", "titleTable")
            .append("xhtml:div")
            .attr("class", "titleTableCell")
            .append("xhtml:div")
            .attr("class", "titleContainer")

        titleFOs = this.container.selectAll('foreignObject').data(data)
            .attr("height", function (d) { return d.titleFOHeight })
            .attr("width", function (d) { return d.titleFOWidth })
            .attr("x", function (d) { return d.titleFOXPos })
            .attr("y", function (d) { return d.titleFOYPos })


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
            .html("")
            .append(function (d) { return d.titleContent })
            
        let covers = this.container.selectAll('.cover').data(data)
        covers.exit().remove()
        covers.enter().append('path')
            .attr("class", "cover " + this.visualSettings.layout.buttonShape)
        covers = this.container.selectAll('.cover').data(data) 
            .attr("d", function (d) { return d.shapePath })
            .style("fill-opacity", function (d) { return 0})
            .on('mouseover', (d, i)=>{
                switch(this.visualSettings.content.source){
                    case enums.Content_Source.databound:
                        this.hoveredIdKey = this.dataPoints[i].selectionId.getKey()
                        break
                    case enums.Content_Source.fixed:
                        this.hoveredIndexUnbound = i
                        break
                }
                this.update(options)
            })
            .on('mouseout', (d, i)=>{
                switch(this.visualSettings.content.source){
                    case enums.Content_Source.databound:
                        this.hoveredIdKey = null
                        break
                    case enums.Content_Source.fixed:
                        this.hoveredIndexUnbound = null
                        break
                }
                this.update(options)
            })
            .on('click', (d, i) => {
                switch(this.visualSettings.content.source){
                    case enums.Content_Source.databound:
                        this.selectionManager.select(this.dataPoints[i].selectionId)
                        break
                    case enums.Content_Source.fixed:
                        this.selectionIndexUnbound = i
                        break
                }
                this.update(options)
            })
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}   