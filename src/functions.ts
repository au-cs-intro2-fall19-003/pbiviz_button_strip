import { propertyStateName, propertyStatesInput, propertyStatesOutput } from './interfaces'
import * as enums from "./enums"
import { ProcessedVisualSettings } from "./processedvisualsettings";

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

export function getGroupedKeyNames(propKeys: string[]): propertyStateName[] {
    let groupedKeyNames: propertyStateName[] = []

    for (let i = 0; i < propKeys.length; i++) {
        if (propKeys[i].endsWith('A')) {
            groupedKeyNames.push({
                all: propKeys[i],
                selected: propKeys[i].replace(/.$/, "S"),
                unselected: propKeys[i].replace(/.$/, "U"),
            })
        }
    }
    return groupedKeyNames
}

export function levelProperties(propertyStates: propertyStatesInput): propertyStatesOutput {
    let _all = propertyStates.all
    let _selected = propertyStates.selected
    let _unselected = propertyStates.unselected
    let _allExists: boolean = typeof _all == 'number' ? _all >= 0 : _all && _all.length > 0
    let _selectedExists: boolean = typeof _selected == 'number' ? _selected >= 0 : _selected && _selected.length > 0
    let _nullValue = typeof _all == 'number' ? null : ""
    if( _selectedExists && _selected == _unselected)
        _all = _selected
    if (propertyStates.state == enums.State.all && _allExists)
        _selected = _unselected = _all
    if (propertyStates.state != enums.State.all && _selected != _unselected)
        _all = _nullValue
    return {
        all: _all,
        selected: _selected,
        unselected: _unselected,
        didChange: !(propertyStates.all == _all && propertyStates.selected == _selected && propertyStates.unselected == _unselected)
    }
}

export function addFilters(defs: d3.Selection<d3.BaseType, any, any, any>, pvs: ProcessedVisualSettings): void{
    defs.html("")

    let shadowS = defs.append("filter")
            .attr("id", "drop-shadowS")
            .append("feDropShadow")
            .attr("dx", pvs.shadowDirectionCoordsS.x * pvs.shadowDistanceS)
            .attr("dy", pvs.shadowDirectionCoordsS.y * pvs.shadowDistanceS)
            .attr("stdDeviation", pvs.shadowStrengthS)
            .attr("flood-color", pvs.shadowColorS)
            .attr("flood-opacity", pvs.shadowTransparencyS)
    let shadowU = defs.append("filter")
            .attr("id", "drop-shadowU")
            .append("feDropShadow")
            .attr("dx", pvs.shadowDirectionCoordsU.x * pvs.shadowDistanceU)
            .attr("dy", pvs.shadowDirectionCoordsU.y * pvs.shadowDistanceU)
            .attr("stdDeviation", pvs.shadowStrengthU)
            .attr("flood-color", pvs.shadowColorU)
            .attr("flood-opacity", pvs.shadowTransparencyU)
}