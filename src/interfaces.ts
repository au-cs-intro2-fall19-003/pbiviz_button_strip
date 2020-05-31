import powerbi from "powerbi-visuals-api";
import * as enums from "./enums"

export interface dataPoint {
    value: powerbi.PrimitiveValue,
    iconValue?: powerbi.PrimitiveValue,
    selectionId: powerbi.visuals.ISelectionId
}

export interface propertyStates {
    all: string | number,
    selected: string | number,
    unselected: string | number,
    defaultValue?: string | number
}

export interface propertyStatesInput extends propertyStates {
    state: enums.State
}

export interface propertyStatesOutput extends propertyStates {
    didChange: boolean
}