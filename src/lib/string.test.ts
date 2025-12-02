/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, expect, it } from "vitest";
import { filenameWithExtensionFromPath, parseCSSTextShadow } from "./string";

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
    describe("filenameWithExtensionFromPath", () => {
        it("extracts filename from Unix-style path", () => {
            const test = "/home/user/documents/file.txt";
            const result = filenameWithExtensionFromPath(test);
            expect(result).to.equal("file.txt");
        });
        it("extracts filename from Windows-style path", () => {
            const test = "C:\\Users\\User\\Documents\\file.txt";
            const result = filenameWithExtensionFromPath(test);
            expect(result).to.equal("file.txt");
        });
        it("extracts filename from path without directories", () => {
            const test = "file.txt";
            const result = filenameWithExtensionFromPath(test);
            expect(result).to.equal("file.txt");
        });
    });
});