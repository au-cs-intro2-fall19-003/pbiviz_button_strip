import powerbi from "powerbi-visuals-api";
import * as enums from "./enums"

export interface dataPoint {
    value: powerbi.PrimitiveValue,
    iconValue?: powerbi.PrimitiveValue,
    selectionId?: powerbi.visuals.ISelectionId,
}

export interface propertyStateName {
    all: string,
    selected: string,
    unselected: string,
    hover: string
}

export interface propertyStateValue {
    all: string | number,
    selected: string | number,
    unselected: string | number,
    hover: string | number,
}

export interface propertyStatesInput extends propertyStateValue {
    state: enums.State
}

export interface propertyStatesOutput extends propertyStateValue {
    didChange: boolean
}

export interface containerProperties{
    xPos: number,
    yPos: number,
    width: number,
    height: number
}

export interface stateIds{
    hoveredIdKey: string,
    selectionIndexesUnbound: number[],
    hoveredIndexUnbound: number
}