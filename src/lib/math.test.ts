/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, expect, it } from "vitest";
import { clamp } from "./math";

describe("math", () => {
    describe("clamp", () => {
        it("clamps value within min and max", () => {
            expect(clamp(5, 1, 10)).toBe(5); // within range
            expect(clamp(-5, 1, 10)).toBe(1); // below min
            expect(clamp(15, 1, 10)).toBe(10); // above max
            expect(clamp(1, 1, 10)).toBe(1); // equal to min
            expect(clamp(10, 1, 10)).toBe(10); // equal to max
        });
    });
});