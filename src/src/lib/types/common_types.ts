type Opaque<T, K> = T & { __opaque__: K };

export type Int = Opaque<number, "Int">;
export type PositiveInt = Opaque<number, "PositiveInt">;
export type StrictlyPositiveInt = Opaque<number, "StrictlyPositiveInt">;
/** between 0 and 360 (allowing a different meaning for each), integer */
export type AngleDegreesInt = Opaque<number, "AngleDegrees">

export type Real = Opaque<number, "Real">;
export type PositiveReal = Opaque<number, "PositiveReal">;
/** between 0 and 2*PI, real */
export type AngleRadians = Opaque<number, "AngleRadians">;

export type UUIDv4 = Opaque<string, "UUID">
export type Color = Opaque<string, "Color">;

// from: https://stackoverflow.com/questions/38123222/proper-way-to-declare-json-object-in-typescript
type JsonPrimitive = string | number | boolean | null;
type JsonArray = (JsonPrimitive | JsonObject | JsonArray)[];
interface JsonObject {
    [key: string]: JsonPrimitive | JsonObject | JsonArray;
}

export type JsonLike = JsonArray | JsonObject | JsonPrimitive;
