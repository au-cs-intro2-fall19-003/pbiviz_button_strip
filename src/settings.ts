/*
 *  Power BI Visualizations
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

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

import * as enums from "./enums"


export class ButtonSettings {
  public state : enums.State = enums.State.all;
  public hover: boolean = false
  
  public colorA: string = "";
  public colorS: string = "#252423";
  public colorU: string = "#252423";
  public colorH: string = "#252423";

  public strokeA: string = "";
  public strokeS: string = "#000";
  public strokeU: string = "#000";
  public strokeH: string = "#000"

  public strokeWidthA: number = null;
  public strokeWidthS: number = 0;
  public strokeWidthU: number = 0;
  public strokeWidthH: number = 0;

  public transparencyA: number = null;
  public transparencyS: number = 0;
  public transparencyU: number = 0;
  public transparencyH: number = 0;
}

export class TextSettings{
  public state : enums.State = enums.State.all;
  public hover: boolean = false

  public colorA: string = "";
  public colorS: string = "#fff";
  public colorU: string = "#fff";
  public colorH: string = "#fff";

  public alignmentA: enums.Align = enums.Align.center;
  public alignmentS: enums.Align = enums.Align.center;
  public alignmentU: enums.Align = enums.Align.center;
  public alignmentH: enums.Align = enums.Align.center;

  public fontSizeA: number = null;
  public fontSizeS: number = 14;
  public fontSizeU: number = 14;
  public fontSizeH: number = 14;

  public fontFamilyA: string = "";
  public fontFamilyS: string = "wf_standard-font, helvetica, arial, sans-serif";
  public fontFamilyU: string = "wf_standard-font, helvetica, arial, sans-serif";
  public fontFamilyH: string = "wf_standard-font, helvetica, arial, sans-serif";

  public hmarginA: number = null;
  public hmarginS: number = 0;
  public hmarginU: number = 0;
  public hmarginH: number = 0;

  public bmarginA: number = null;
  public bmarginS: number = 0;
  public bmarginU: number = 0;
  public bmarginH: number = 0;
  
  public transparencyA: number = null;
  public transparencyS: number = 0;
  public transparencyU: number = 0;
  public transparencyH: number = 0;
 
}

export class IconSettings{
  public icons: boolean = false;
  public state : enums.State = enums.State.all;
  public hover: boolean = false

  public placementA: enums.Icon_Placement = null;
  public placementS: enums.Icon_Placement = enums.Icon_Placement.left;
  public placementU: enums.Icon_Placement = enums.Icon_Placement.left;
  public placementH: enums.Icon_Placement = enums.Icon_Placement.left;

  public widthA: number = null;
  public widthS: number = 40;
  public widthU: number = 40;
  public widthH: number = 40;

  public hmarginA: number = null;
  public hmarginS: number = 10;
  public hmarginU: number = 10;
  public hmarginH: number = 10;

  public topMarginA: number = null;
  public topMarginS: number = 10;
  public topMarginU: number = 10;
  public topMarginH: number = 10;

  public bottomMarginA: number = null;
  public bottomMarginS: number = 10;
  public bottomMarginU: number = 10;
  public bottomMarginH: number = 10;

  public transparencyA: number = null;
  public transparencyS: number = 0;
  public transparencyU: number = 0;
  public transparencyH: number = 0;
}

export class LayoutSettings{
  public buttonShape: enums.Button_Shape = enums.Button_Shape.rectangle
  
  public parallelogramAngle: number = 80
  public chevronAngle: number = 60
  public pentagonAngle: number = 60
  public hexagonAngle: number = 60
  public tab_cutCornersLength: number = 20
  public tab_cutCornerLength: number = 20

  public sizingMethod: enums.Button_Sizing_Method = enums.Button_Sizing_Method.uniform;
  public buttonWidth: number = 150;
  public buttonHeight: number = 75;
  public buttonAlignment: enums.Align = enums.Align.left
  public buttonLayout: enums.Button_Layout = enums.Button_Layout.horizontal;
  public rowLength: number = 2;
  public padding: number = 10;
}

export class EffectsSettings{
  public shapeRoundedCornerRadius: number = 0 
  public state : enums.State = enums.State.all;
  public hover: boolean = false

  public shadow: boolean = false;

  public shadowColorA: string = ""
  public shadowColorS: string = "#000"
  public shadowColorU: string = "#000"
  // public shadowColorH: string = "#000"
  
  public shadowTransparencyA: number = null
  public shadowTransparencyS: number = 70
  public shadowTransparencyU: number = 70
  public shadowTransparencyH: number = 70

  public shadowDirectionA: enums.Direction = null
  public shadowDirectionS: enums.Direction = enums.Direction.bottom_right
  public shadowDirectionU: enums.Direction = enums.Direction.bottom_right
  public shadowDirectionH: enums.Direction = enums.Direction.bottom_right

  public shadowDistanceA: number = null
  public shadowDistanceS: number = 2
  public shadowDistanceU: number = 2
  public shadowDistanceH: number = 2

  public shadowStrengthA: number = null
  public shadowStrengthS: number = 4
  public shadowStrengthU: number = 4
  public shadowStrengthH: number = 4

  public glow: boolean = false;

  public glowColorA: string = ""
  public glowColorS: string = "#3380FF"
  public glowColorU: string = "#3380FF"
  // public glowColorH: string = "#3380FF"

  public glowTransparencyA: number = null
  public glowTransparencyS: number = 0 
  public glowTransparencyU: number = 0
  public glowTransparencyH: number = 0
  
  public glowStrengthA: number = null
  public glowStrengthS: number = 2
  public glowStrengthU: number = 2
  public glowStrengthH: number = 2
}

export class ContentSettings{
  public multiselect: boolean = false
  public source: enums.Content_Source = enums.Content_Source.databound

  public n: number = 5
  public icons: boolean = false
  public text1: string = "Text"
  public icon1: string = ""
  public text2: string = "Text"
  public icon2: string = ""
  public text3: string = "Text"
  public icon3: string = ""
  public text4: string = "Text"
  public icon4: string = ""
  public text5: string = "Text"
  public icon5: string = ""
  public text6: string = "Text"
  public icon6: string = ""
  public text7: string = "Text"
  public icon7: string = ""
  public text8: string = "Text"
  public icon8: string = ""
  public text9: string = "Text"
  public icon9: string = ""
  public text10: string = "Text"
  public icon10: string = ""
}

export class MeasuresSettings{
  public state : enums.State = enums.State.all;
  public hover: boolean = false

  public colorA: string = "";
  public colorS: string = "#252423";
  public colorU: string = "#252423";
  public colorH: string = "#252423";

  public alignmentA: enums.Align = enums.Align.center;
  public alignmentS: enums.Align = enums.Align.center;
  public alignmentU: enums.Align = enums.Align.center;
  public alignmentH: enums.Align = enums.Align.center;

  public fontSizeA: number = null;
  public fontSizeS: number = 45;
  public fontSizeU: number = 45;
  public fontSizeH: number = 45;

  public fontFamilyA: string = "";
  public fontFamilyS: string = "wf_standard-font, helvetica, arial, sans-serif";
  public fontFamilyU: string = "wf_standard-font, helvetica, arial, sans-serif";
  public fontFamilyH: string = "wf_standard-font, helvetica, arial, sans-serif";
  
  public vmarginA: number = null;
  public vmarginS: number = 0;
  public vmarginU: number = 0;
  public vmarginH: number = 0;
  
  public transparencyA: number = null;
  public transparencyS: number = 0;
  public transparencyU: number = 0;
  public transparencyH: number = 0;
}

export class VisualSettings extends DataViewObjectsParser {
  public button: ButtonSettings = new ButtonSettings();
  public text: TextSettings = new TextSettings();
  public icon: IconSettings = new IconSettings();
  public layout: LayoutSettings = new LayoutSettings();
  public effects: EffectsSettings = new EffectsSettings();
  public content: ContentSettings = new ContentSettings();
  public measures: MeasuresSettings = new MeasuresSettings();
}