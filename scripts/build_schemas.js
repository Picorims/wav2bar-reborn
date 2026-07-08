/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

/**
 * Runtime build of JSON-schemas by AJV requires 'unsafe-eval'
 * in the CSP. To avoid that, pre-compiling the schemas is required.
 * One option is using ajv-cli which seems unmaintained and has
 * unmerged security vulnerability fixes. The other option is doing so
 * using the library itself, which is what is done below.
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone/index.js';
import saveSchemaV4 from '../src/lib/schemas/save_v4.json' with { type: 'json' };
import saveSchemaV5 from '../src/lib/schemas/save_v5.json' with { type: 'json' };
import settingsSchemaV2 from '../src/lib/schemas/settings_v2.json' with { type: 'json' };

const dirName = import.meta.dirname;

function visualObjectSchema(schema) {
	return {
		$schema: 'http://json-schema.org/draft-07/schema#',
		definitions: schema.definitions,
		$ref: '#/definitions/visual_object'
	};
}

const schemas = {
	save_v4: saveSchemaV4,
	save_v4_visual_object: visualObjectSchema(saveSchemaV4),
	save_v5: saveSchemaV5,
	save_v5_visual_object: visualObjectSchema(saveSchemaV5),
	settings_v2: settingsSchemaV2
};

for (const [name, schema] of Object.entries(schemas)) {
	// The generated code will have a default export:
	// `module.exports = <validateFunctionCode>;module.exports.default = <validateFunctionCode>;`
	const ajv = new Ajv({ code: { source: true, esm: true }, useDefaults: true, allErrors: true });
	const validate = ajv.compile(schema);
	let moduleCode = '// @ts-nocheck\n' + standaloneCode(ajv, validate);

	// Now you can write the module code to file
	const filePath = path.join(dirName, `../src/lib/schemas/compiled/${name}_validate_esm.js`);
	fs.writeFileSync(filePath, moduleCode);
	console.log(`Compiled ${filePath}`);
}
