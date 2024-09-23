/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (C) 2024  Picorims <picorims.contact@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { describe, expect, it } from "vitest";
import { parseCSSTextShadow } from "./string";

describe("string", () => {
    describe("parseCSSTextShadow", () => {
        // https://developer.mozilla.org/fr/docs/Web/CSS/text-shadow
        it("parses: offset-x | offset-y | blur-radius | color", () => {
            const test = "10px 5px 5px black";
            const result = parseCSSTextShadow(test);
            console.log(JSON.stringify(result));
            
            expect(result).to.deep.equal({
                offsetX: 10,
                offsetY: 5,
                blurRadius: 5,
                color: "black"
            });
        });
        it("parses: color | offset-x | offset-y | blur-radius", () => {
            const test = "black 10px 5px 5px";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 10,
                offsetY: 5,
                blurRadius: 5,
                color: "black"
            });
        });
        it("parses: offset-x | offset-y | color", () => {
            const test = "10px 5px #000000";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 10,
                offsetY: 5,
                blurRadius: 0,
                color: "#000000"
            });
        });
        it("parses: color | offset-x | offset-y", () => {
            const test = "#000000 10px 5px";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 10,
                offsetY: 5,
                blurRadius: 0,
                color: "#000000"
            });
        });
        it("parses: offset-x | offset-y", () => {
            const test = "10px 5px";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 10,
                offsetY: 5,
                blurRadius: 0,
                color: "black"
            });
        });
        it("parses: none", () => {
            const test = "none";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 0,
                offsetY: 0,
                blurRadius: 0,
                color: "black"
            });
        });
        it("parses: empty string", () => {
            const test = "";
            const result = parseCSSTextShadow(test);
            expect(result).to.deep.equal({
                offsetX: 0,
                offsetY: 0,
                blurRadius: 0,
                color: "black"
            });
        });
    });
});