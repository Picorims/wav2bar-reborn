/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { assert, describe, it } from "vitest";

describe("AudioSpectrumProcessor", () => {
    describe("mappedArray", () => {
        // tests relies on this exact array and the fact that it is sorted ascendingly.
        const a1 = new Uint16Array([10, 20, 30, 40, 50]);

        it("should map to a smaller length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 3);
            for (const val of mapped) {
                assert.isTrue(val >= 10 && val <= 50);
            }
            assert.equal(mapped.length, 3);
        });
        it("should map to a larger length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 10);
            assert.deepEqual(mapped, new Uint16Array([10, 10, 20, 20, 30, 30, 40, 40, 50, 50]));
        });
        it("should map with min and max", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 3, 1, 3);
            for (const val of mapped) {
                assert.isTrue(val >= 20 && val <= 40);
            }
            assert.equal(mapped.length, 3);
        });
        it("should handle edge case of min=max", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 4, 2, 2);
            assert.deepEqual(mapped, new Uint16Array([30, 30, 30, 30]));
        });
        it("should handle edge case of new_length=1", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 1);
            assert.deepEqual(mapped, new Uint16Array([10]));
        });
        it("should handle edge case of new_length=0", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 0);
            assert.deepEqual(mapped, new Uint16Array([]));
        });
        it("should map backwards if min>max", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 3, 3, 1);
            for (let i = 0; i < mapped.length; i++) {
                assert.isTrue(mapped[i] <= 40 && mapped[i] >= 20);
                assert.isTrue(mapped[i] <= mapped[Math.max(0, i-1)]);
            }
        });
        it("should throw error if min<0", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            assert.throws(() => {
                processor.mappedArray(a1, 3, -1, 3);
            });
        });
        it("should throw error if max>=array.length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            assert.throws(() => {
                processor.mappedArray(a1, 3, 0, 5);
            });
        });
        it("should throw if array is empty and new_length>0", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            assert.throws(() => {
                processor.mappedArray(new Uint16Array([]), 3);
            });
        });
        it("should return empty array if array is empty and new_length=0", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(new Uint16Array([]), 0);
            assert.deepEqual(mapped, new Uint16Array([]));
        });
        it("should return same array if new_length equals array length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, a1.length);
            assert.deepEqual(mapped, a1);
        });
        it("should handle single-element array", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const singleElementArray = new Uint16Array([42]);
            const mapped = processor.mappedArray(singleElementArray, 5);
            assert.deepEqual(mapped, new Uint16Array([42, 42, 42, 42, 42]));
        });
        it("should handle single-element array with new_length=1", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const singleElementArray = new Uint16Array([42]);
            const mapped = processor.mappedArray(singleElementArray, 1);
            assert.deepEqual(mapped, new Uint16Array([42]));
        });
        it("should handle both min max and smaller new_length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 2, 1, 3);
            for (const val of mapped) {
                assert.isTrue(val >= 20 && val <= 40);
            }
            assert.equal(mapped.length, 2);
        });
        it("should handle both min max and larger new_length", async () => {
            const processor = new (await import("./audio_spectrum_processor")).AudioSpectrumProcessor();
            const mapped = processor.mappedArray(a1, 6, 1, 3);
            assert.deepEqual(mapped, new Uint16Array([20, 20, 30, 30, 40, 40]));
        });
    });
});