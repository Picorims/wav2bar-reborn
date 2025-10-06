/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

// type Opaque<T, K> = T & { __opaque__: K };

// export type Int = Opaque<number, "Int">;
// export type PositiveInt = Opaque<number, "PositiveInt">;
// export type StrictlyPositiveInt = Opaque<number, "StrictlyPositiveInt">;
// /** between 0 and 360 (allowing a different meaning for each), integer */
// export type AngleDegreesInt = Opaque<number, "AngleDegrees">

// export type Real = Opaque<number, "Real">;
// export type PositiveReal = Opaque<number, "PositiveReal">;
// /** between 0 and 2*PI, real */
// export type AngleRadians = Opaque<number, "AngleRadians">;

// export type UUIDv4 = Opaque<string, "UUID">
// export type Color = Opaque<string, "Color">;
export type Int = number;
export type PositiveInt = number;
export type StrictlyPositiveInt = number;
/** between 0 and 360 (allowing a different meaning for each), integer */
export type AngleDegreesInt = number;

export type Real = number;
export type PositiveReal = number;
/** between 0 and 2*PI, real */
export type AngleRadians = number;

export type UUIDv4 = string;
export type Color = string;

// from: https://stackoverflow.com/questions/38123222/proper-way-to-declare-json-object-in-typescript
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = (JsonPrimitive | JsonObject | JsonArray)[];
export interface JsonObject {
    [key: string]: JsonPrimitive | JsonObject | JsonArray;
}

export type JsonLike = JsonArray | JsonObject | JsonPrimitive;
