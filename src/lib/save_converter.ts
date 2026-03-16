/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { CURRENT_SAVE_VERSION, MINIMUM_SAVE_VERSION, validateSave, type Save } from "./store/save_structure/save_latest";
import { validateSaveV4 } from "./store/save_structure/save_v4";
import type { Wav2BarSaveV5 } from "./types/schemas/save_v5";

interface ConversionResult<T extends Record<string, unknown> = Record<string, unknown>> {
    success: boolean;
    warnings: string[];
    errors: string[];
    convertedSave: T | null;
}
const convertTo: Record<number, (save: Record<string, unknown>) => ConversionResult> = {
    5: (_save) => {
        const result: ConversionResult<Wav2BarSaveV5> = {
            success: false,
            warnings: [],
            errors: [],
            convertedSave: null
        }
        return result;
    }
};

const validate: Record<number, (save: Record<string, unknown>) => boolean> = {
    4: validateSaveV4
};

export class SaveConverter {
    public static convert(save: {save_version: number} & Record<string, unknown>): ConversionResult {
        if (save.save_version === CURRENT_SAVE_VERSION) {
            // up to date, just validate
            const valid = validateSave(save);
            if (!valid) {
                return {
                    success: false,
                    warnings: [],
                    errors: ["Save is not valid according to the latest schema."]
                        .concat(validateSave.errors?.map(e => `- ${e.instancePath} ${e.message}`) || []),
                    convertedSave: null
                };
            }
            return {
                success: true,
                warnings: [],
                errors: [],
                convertedSave: save as Save
            };
        } else if (save.save_version < MINIMUM_SAVE_VERSION) {
            // too old, cannot convert
            return {
                success: false,
                warnings: [],
                errors: [`Failed to convert save: save version is too old. Expected minimum version is ${MINIMUM_SAVE_VERSION}, but got ${save.save_version}.`],
                convertedSave: null 
            }
        } else if (save.save_version > CURRENT_SAVE_VERSION) {
            // too new, cannot convert
            return {
                success: false,
                warnings: [],
                errors: [`Failed to convert save: save version is too new. Expected current version is ${CURRENT_SAVE_VERSION}, but got ${save.save_version}.`],
                convertedSave: null 
            }
        } else {
            const conversionResult: ConversionResult = {
                success: false,
                warnings: [],
                errors: [],
                convertedSave: null
            };

            let currentVersion = save.save_version;
            let currentSave: Record<string, unknown> = save;

            while (currentVersion < CURRENT_SAVE_VERSION) {
                const targetVersion = currentVersion + 1;
                const convertFunc = convertTo[targetVersion];
                if (!convertFunc) {
                    conversionResult.errors.push(`No conversion function available for version ${currentVersion} to ${targetVersion}.`);
                    break;
                }
                const result = convertFunc(currentSave);
                if (!result.success || result.convertedSave === null) {
                    conversionResult.errors.push(...result.errors);
                    conversionResult.warnings.push(...result.warnings);
                    break;
                }

                const validateFunc = validate[targetVersion];
                if (!validateFunc) {
                    conversionResult.errors.push(`No validation function available for version ${targetVersion}.`);
                    break;
                }
                const valid = validateFunc(result.convertedSave);
                if (!valid) {
                    conversionResult.errors.push(`Converted save for version ${targetVersion} is not valid.`);
                    break;
                }

                conversionResult.warnings.push(...result.warnings);
                conversionResult.errors.push(...result.errors);
                currentSave = result.convertedSave;
                currentVersion = targetVersion;
            }

            conversionResult.success = true;
            conversionResult.convertedSave = currentSave as Save;
            return conversionResult;
        }

    }
}