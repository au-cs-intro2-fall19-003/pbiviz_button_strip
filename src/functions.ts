import { propertyStateName, propertyStatesInput, propertyStatesOutput } from './interfaces'
import * as enums from "./enums"
import { ProcessedVisualSettings } from "./processedvisualsettings";
import powerbi from "powerbi-visuals-api";
import { VisualSettings } from './settings';

export function calculateWordDimensions(text: string, fontFamily: string, fontSize: string, width?: string): { width: number, height: number } {
    var div = document.createElement('div');
    div.style.fontFamily = fontFamily
    div.style.fontSize = fontSize
    div.style.width = width || 'auto'
    div.style.whiteSpace = width ? "normal" : "nowrap"
    div.style.position = "absolute";
    div.innerHTML = text
    document.body.appendChild(div);
    var dimensions = {
        width: div.offsetWidth,
        height: div.offsetHeight
    }
    div.parentNode.removeChild(div);
    return dimensions;
}

export function getPropertyStateNameArr(propKeys: string[]): propertyStateName[] {
    let propertyStateNameArr: propertyStateName[] = []
    for (let i = 0; i < propKeys.length; i++)
        if (propKeys[i].endsWith('A')) 
            propertyStateNameArr.push(getPropertyStateNames(propKeys[i].slice(0, -1)))
    return propertyStateNameArr
}

export function getPropertyStateNames(propBase: string): propertyStateName{
    return {
            all: propBase+"A",
            selected: propBase+"S",
            unselected: propBase+"U",
            hover: propBase+"H"
        }
}

export function getObjectsToPersist(visualSettings: VisualSettings): powerbi.VisualObjectInstancesToPersist{
    let objKeys = Object.keys(visualSettings)
    let objects: powerbi.VisualObjectInstancesToPersist = {
        merge: []
    }
    for (let i = 0; i < objKeys.length; i++) {
        let objKey: string = objKeys[i]
        let propKeys: string[] = Object.keys(visualSettings[objKey])
        let groupedKeyNamesArr: propertyStateName[] = getPropertyStateNameArr(propKeys)
        let object: powerbi.VisualObjectInstance = {
            objectName: objKey,
            selector: undefined,
            properties:
                {}
        }

        for (let j = 0; j < groupedKeyNamesArr.length; j++) {
            let groupedKeyNames: propertyStateName = groupedKeyNamesArr[j]
            let type = typeof visualSettings[objKey][groupedKeyNames.all]
            let propertyState: propertyStatesInput = {
                all: visualSettings[objKey][groupedKeyNames.all],
                selected: visualSettings[objKey][groupedKeyNames.selected],
                unselected: visualSettings[objKey][groupedKeyNames.unselected],
                hover: visualSettings[objKey][groupedKeyNames.hover],
                state: visualSettings[objKey].state
            }
            let leveledPropertyState = levelProperties(propertyState)
            if (leveledPropertyState.didChange) {
                object.properties[groupedKeyNames.all] = leveledPropertyState.all
                object.properties[groupedKeyNames.selected] = leveledPropertyState.selected
                object.properties[groupedKeyNames.unselected] = leveledPropertyState.unselected
                object.properties[groupedKeyNames.hover] = leveledPropertyState.hover
            }
        }
        if (Object.keys(object.properties).length != 0)
            objects.merge.push(object)
    }
    return objects
}

export function levelProperties(propertyStates: propertyStatesInput): propertyStatesOutput {
    let _all = propertyStates.all
    let _selected = propertyStates.selected
    let _unselected = propertyStates.unselected
    let _hover = propertyStates.hover
    let _allExists: boolean = typeof _all == 'number' ? _all >= 0 : _all && _all.length > 0
    let _selectedExists: boolean = typeof _selected == 'number' ? _selected >= 0 : _selected && _selected.length > 0
    let _nullValue = typeof _all == 'number' ? null : ""
    if (propertyStates.state == enums.State.all && _allExists)
        _selected = _unselected = _hover = _all
    if (_selectedExists && _selected == _unselected)
        _all = _selected
    if (!(_selected == _unselected && _selected == _hover))
        _all = _nullValue
    return {
        all: _all,
        selected: _selected,
        unselected: _unselected,
        hover: _hover,
        didChange: !(propertyStates.all == _all && 
                    (propertyStates.selected == null || propertyStates.selected == _selected)  && 
                    (propertyStates.unselected == null || propertyStates.unselected == _unselected) &&
                    (propertyStates.hover == null || propertyStates.hover == _hover))
    }
}

export function addFilters(defs: d3.Selection<d3.BaseType, any, any, any>, pvs: ProcessedVisualSettings,): void {
    let filter = defs.append("filter")
        .attr("id", "filter" + pvs.i)
    if (pvs.settings.effects.shadow) {
        filter
            .append("feDropShadow")
            .attr("dx", pvs.shadowDirectionCoords.x * pvs.shadowDistance)
            .attr("dy", pvs.shadowDirectionCoords.y * pvs.shadowDistance)
            .attr("stdDeviation", pvs.shadowStrength)
            .attr("flood-color", pvs.shadowColor)
            .attr("flood-opacity", pvs.shadowTransparency)
            .attr("result", "dropshadow")
    }

    if (pvs.settings.effects.glow) {
        filter
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", pvs.glowStrength)
            .attr("flood-color", pvs.glowColor)
            .attr("flood-opacity", pvs.glowTransparency)
            .attr("result", "glow")

    }

    let feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "dropshadow")
    feMerge.append("feMergeNode").attr("in", "glow")
}