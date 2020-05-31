import {  propertyStates, propertyStatesInput, propertyStatesOutput } from './interfaces'
import * as enums from "./enums"


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

export function getGroupedKeyNames(propKeys: string[]): propertyStates[]{
    let groupedKeyNames: propertyStates[] = []

    for(let i = 0; i < propKeys.length; i++){
        if (propKeys[i].endsWith('A')){
            groupedKeyNames.push({
                all: propKeys[i],
                selected: propKeys[i].replace(/.$/,"S"),
                unselected: propKeys[i].replace(/.$/,"U"),
                defaultValue: propKeys[i].replace(/.$/,"Default")
            })
        }
    }

    return groupedKeyNames
}

export function levelProperties(propertyStates: propertyStatesInput): propertyStatesOutput {
    let _all = propertyStates.all
    let _selected = propertyStates.selected
    let _unselected = propertyStates.unselected
    if (!_all && !_selected && !_unselected)
        _all = propertyStates.defaultValue

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