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

import { VisualSettings } from "./settings";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import * as d3 from "d3";
import {Frame} from './frame'
import {Title} from './title'

import {dataPoint} from './interfaces'

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import * as enums from "./enums"

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

        if(settings.icon.placement == enums.Icon_Placement.left){
            delete settings.icon.hmargin
        } else {
            delete settings.icon.width
        }


        return VisualSettings.enumerateObjectInstances(settings, options);
    }

    public update(options: VisualUpdateOptions) {
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
        this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        
        let frameData: Frame[] = [];
        let titleData: Title[] = []
        for (let i = 0; i < this.dataPoints.length; i++){   
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
            .style("stroke", function(d){return d.stroke})
            .style("stroke-width", function(d){return d.strokeWidth})
            .attr("height", function (d) { return d.height })
            .attr("width", function (d) { return d.width })
            .attr("x", function (d) { return d.x_pos })
            .attr("y", function (d) { return d.y_pos })
            .on('click', (d, i)=>{ 
                this.selectionManager.select(this.dataPoints[i].selectionId)
                // console.log(d)
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
            .on('click', (d, i)=>{ 
                this.selectionManager.select(this.dataPoints[i].selectionId)
                this.update(options)
             })
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
}   