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

import { describe, it, expect } from "vitest";
import { deepClone } from "./deep_clone";
import type { JsonLike } from "./types/common_types";

describe('deep_clone', () => {
    describe('deepClone', () => {
        it('clones simple values', () => {
            const tests: JsonLike[] = [
                null,
                5,
                8.9,
                "string stuff",
                true,
                false,
                [],
                {}
            ];
            for (const test of tests) {
                expect(deepClone(test)).to.deep.equal(test);
            }                
        });

        it('clones complex values', () => {
            const tests: JsonLike[] = [
                {
                    a: 5,
                    b: {
                        c: 4,
                        foo: {
                            bar: "different",
                            key: null,
                        },
                        d: "wow"
                    }
                },
                [8984, "foo", "bar", [
                        5, null, "stuff", {
                            some: "kind",
                            of: "obj",
                            its: true,
                            arr: [],
                            obj: {}
                        }
                    ], {
                        object: "here",
                        key: null,
                    }
                ],
                {
                    8984: 45,
                    "foo": "bar",
                    baz: [5, null, "stuff", {
                        some: "kind",
                        of: "obj",
                        its: true,
                    }],
                    someother: {
                        object: "here"
                    }
                }
            ];
            for (const test of tests) {
                expect(deepClone(test)).to.deep.equal(test);
            }                
        });    
    });
});
