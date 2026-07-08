'use strict';
export const validate = validate10;
export default validate10;
const schema11 = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Wav2Bar settings v2',
	description:
		'Schema for Wav2Bar settings, version 2. (For versions 1.0.0-beta.1 and above).\n\n Wav2Bar - Free software for creating audio visualization (motion design) videos.\n Copyright (C) 2025-2026  Picorims <picorims.contact@gmail.com>\n\n \n This program is free software: you can redistribute it and/or modify\n it under the terms of the GNU General Public License as published by\n the Free Software Foundation, either version 3 of the License, or\n any later version.\n \n This program is distributed in the hope that it will be useful,\n but WITHOUT ANY WARRANTY; without even the implied warranty of\n MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n GNU General Public License for more details.\n \n You should have received a copy of the GNU General Public License\n along with this program.  If not, see <https://www.gnu.org/licenses/>.',
	type: 'object',
	properties: {
		save_version: { type: 'number', const: 2 },
		software_version_used: {
			description: 'last version modifying this settings file',
			type: 'string'
		},
		software_version_first_created: {
			description: 'first version creating this settings file',
			type: 'string'
		},
		ffmpeg_path: { type: 'string', default: '' },
		theme: { enum: ['DEFAULT', 'DARK', 'LIGHT'], default: 'DARK' },
		language: { enum: ['EN'], default: 'EN' }
	},
	required: [
		'save_version',
		'software_version_used',
		'software_version_first_created',
		'ffmpeg_path',
		'theme',
		'language'
	]
};
function validate10(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.ffmpeg_path === undefined) {
			data.ffmpeg_path = '';
		}
		if (data.theme === undefined) {
			data.theme = 'DARK';
		}
		if (data.language === undefined) {
			data.language = 'EN';
		}
		if (data.save_version === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'save_version' },
				message: "must have required property '" + 'save_version' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.software_version_used === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'software_version_used' },
				message: "must have required property '" + 'software_version_used' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.software_version_first_created === undefined) {
			const err2 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'software_version_first_created' },
				message: "must have required property '" + 'software_version_first_created' + "'"
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.ffmpeg_path === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'ffmpeg_path' },
				message: "must have required property '" + 'ffmpeg_path' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.theme === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'theme' },
				message: "must have required property '" + 'theme' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.language === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'language' },
				message: "must have required property '" + 'language' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.save_version !== undefined) {
			let data0 = data.save_version;
			if (!(typeof data0 == 'number' && isFinite(data0))) {
				const err6 = {
					instancePath: instancePath + '/save_version',
					schemaPath: '#/properties/save_version/type',
					keyword: 'type',
					params: { type: 'number' },
					message: 'must be number'
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
			if (2 !== data0) {
				const err7 = {
					instancePath: instancePath + '/save_version',
					schemaPath: '#/properties/save_version/const',
					keyword: 'const',
					params: { allowedValue: 2 },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err7];
				} else {
					vErrors.push(err7);
				}
				errors++;
			}
		}
		if (data.software_version_used !== undefined) {
			if (typeof data.software_version_used !== 'string') {
				const err8 = {
					instancePath: instancePath + '/software_version_used',
					schemaPath: '#/properties/software_version_used/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		if (data.software_version_first_created !== undefined) {
			if (typeof data.software_version_first_created !== 'string') {
				const err9 = {
					instancePath: instancePath + '/software_version_first_created',
					schemaPath: '#/properties/software_version_first_created/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
		}
		if (typeof data.ffmpeg_path !== 'string') {
			const err10 = {
				instancePath: instancePath + '/ffmpeg_path',
				schemaPath: '#/properties/ffmpeg_path/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err10];
			} else {
				vErrors.push(err10);
			}
			errors++;
		}
		let data4 = data.theme;
		if (!(data4 === 'DEFAULT' || data4 === 'DARK' || data4 === 'LIGHT')) {
			const err11 = {
				instancePath: instancePath + '/theme',
				schemaPath: '#/properties/theme/enum',
				keyword: 'enum',
				params: { allowedValues: schema11.properties.theme.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err11];
			} else {
				vErrors.push(err11);
			}
			errors++;
		}
		if (!(data.language === 'EN')) {
			const err12 = {
				instancePath: instancePath + '/language',
				schemaPath: '#/properties/language/enum',
				keyword: 'enum',
				params: { allowedValues: schema11.properties.language.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err12];
			} else {
				vErrors.push(err12);
			}
			errors++;
		}
	} else {
		const err13 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err13];
		} else {
			vErrors.push(err13);
		}
		errors++;
	}
	validate10.errors = vErrors;
	return errors === 0;
}
