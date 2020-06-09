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
                    propertyStates.selected == _selected && 
                    propertyStates.unselected == _unselected &&
                    (!propertyStates.hover || propertyStates.hover == _hover))
    }
}

export function addFilters(defs: d3.Selection<d3.BaseType, any, any, any>, pvs: ProcessedVisualSettings): void {
    defs.html("")

    let selected = defs.append("filter")
        .attr("id", "selected")
    let unselected = defs.append("filter")
        .attr("id", "unselected")
    if (pvs.settings.effects.shadow) {
        selected
            .append("feDropShadow")
            .attr("dx", pvs.shadowDirectionCoordsS.x * pvs.shadowDistanceS)
            .attr("dy", pvs.shadowDirectionCoordsS.y * pvs.shadowDistanceS)
            .attr("stdDeviation", pvs.shadowStrengthS)
            .attr("flood-color", pvs.shadowColorS)
            .attr("flood-opacity", pvs.shadowTransparencyS)
            .attr("result", "dropshadow")

        unselected
            .append("feDropShadow")
            .attr("dx", pvs.shadowDirectionCoordsU.x * pvs.shadowDistanceU)
            .attr("dy", pvs.shadowDirectionCoordsU.y * pvs.shadowDistanceU)
            .attr("stdDeviation", pvs.shadowStrengthU)
            .attr("flood-color", pvs.shadowColorU)
            .attr("flood-opacity", pvs.shadowTransparencyU)
            .attr("result", "dropshadow")
    }

    if (pvs.settings.effects.glow) {
        selected
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", pvs.glowStrengthS)
            .attr("flood-color", pvs.glowColorS)
            .attr("flood-opacity", pvs.glowTransparencyS)
            .attr("result", "glow")

        unselected
            .append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("stdDeviation", pvs.glowStrengthU)
            .attr("flood-color", pvs.glowColorU)
            .attr("flood-opacity", pvs.glowTransparencyU)
            .attr("result", "glow")
    }



    let feMergeS = selected.append("feMerge")
    feMergeS.append("feMergeNode").attr("in", "dropshadow")
    feMergeS.append("feMergeNode").attr("in", "glow")
    let feMergeU = unselected.append("feMerge")
    feMergeU.append("feMergeNode").attr("in", "dropshadow")
    feMergeU.append("feMergeNode").attr("in", "glow")

}