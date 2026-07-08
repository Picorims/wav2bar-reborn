// @ts-nocheck
'use strict';
export const validate = validate10;
export default validate10;
const schema11 = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Wav2Bar save v5',
	description:
		'Schema for Wav2Bar save files, version 5. (For versions 1.0.0-beta.1 and above).\n\n Wav2Bar - Free software for creating audio visualization (motion design) videos.\n Copyright (C) 2025-2026  Picorims <picorims.contact@gmail.com>\n\n \n This program is free software: you can redistribute it and/or modify\n it under the terms of the GNU General Public License as published by\n the Free Software Foundation, either version 3 of the License, or\n any later version.\n \n This program is distributed in the hope that it will be useful,\n but WITHOUT ANY WARRANTY; without even the implied warranty of\n MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n GNU General Public License for more details.\n \n You should have received a copy of the GNU General Public License\n along with this program.  If not, see <https://www.gnu.org/licenses/>.',
	definitions: {
		angle_degrees_int: {
			description: 'degrees, clockwise. 0 and 360 may have a different meaning.',
			type: 'integer',
			minimum: 0,
			maximum: 360
		},
		point: {
			type: 'object',
			properties: { x: { type: 'number', default: 0 }, y: { type: 'number', default: 0 } },
			required: ['x', 'y']
		},
		color: {
			description: 'hex, rgb, rgba, hsv color, CSS syntax.',
			type: 'string',
			default: '#ffffff'
		},
		gradient: {
			type: 'object',
			properties: {
				type: { type: 'string', enum: ['linear', 'radial'], default: 'linear' },
				start_point: {
					description: 'Also represents the center of the radial gradient',
					$ref: '#/definitions/point'
				},
				end_point: { $ref: '#/definitions/point' },
				color_stops: {
					description: 'List of color stops. The position is between 0 and 1.',
					type: 'array',
					items: {
						type: 'object',
						properties: {
							offset: { type: 'number', minimum: 0, maximum: 1 },
							color: { $ref: '#/definitions/color' }
						},
						required: ['offset', 'color'],
						default: { offset: 0, color: '#000000' }
					},
					minItems: 2,
					default: [
						{ offset: 0, color: '#000000' },
						{ offset: 1, color: '#ffffff' }
					]
				}
			},
			required: ['type', 'color_stops']
		},
		shadow: {
			description: 'Used for both box-shadow and text-shadow.',
			type: 'object',
			properties: {
				inset: { type: 'boolean', default: false },
				offset: { $ref: '#/definitions/point' },
				blur_radius: { type: 'number', minimum: 0, default: 0 },
				spread_radius: { type: 'number', default: 0 },
				color: { $ref: '#/definitions/color' }
			},
			required: ['inset', 'offset', 'blur_radius', 'spread_radius', 'color']
		},
		visual_object_interface: {
			type: 'object',
			properties: {
				visual_object_type: { type: 'string' },
				name: { type: 'string', default: '' },
				layer: { type: 'integer', minimum: 0, default: 0 },
				coordinates: {
					type: 'object',
					properties: { x: { type: 'integer', default: 0 }, y: { type: 'integer', default: 0 } },
					default: { x: 0, y: 0 },
					required: ['x', 'y']
				},
				size: {
					type: 'object',
					properties: {
						width: { type: 'integer', minimum: 0, default: 0 },
						height: { type: 'integer', minimum: 0, default: 0 }
					},
					default: { width: 0, height: 0 },
					required: ['width', 'height']
				},
				rotation: { $ref: '#/definitions/angle_degrees_int', default: 0 },
				svg_filter: {
					description: 'List of `<filter>` tags separated by `[#]` with no `<script>` tag.',
					type: 'string',
					default: ''
				}
			},
			required: ['name', 'layer', 'coordinates', 'size', 'rotation', 'svg_filter']
		},
		supports_border_radius: {
			type: 'object',
			properties: {
				border_radius: {
					description:
						'order: top-left, top-right, bottom-right, bottom-left; before and after point clockwise.',
					type: 'array',
					items: {
						type: 'object',
						properties: {
							value: { type: 'integer', minimum: 0, default: 0 },
							unit: { type: 'string', enum: ['px', 'percent'], default: 'px' }
						},
						required: ['value', 'unit']
					},
					minItems: 8,
					maxItems: 8,
					default: [
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' },
						{ value: 0, unit: 'px' }
					]
				}
			},
			required: ['border_radius']
		},
		supports_box_shadows: {
			type: 'object',
			properties: {
				box_shadows: {
					description: 'list of box-shadows',
					type: 'array',
					items: { $ref: '#/definitions/shadow' },
					default: []
				}
			},
			required: ['box_shadows']
		},
		supports_background: {
			type: 'object',
			properties: {
				background: {
					type: 'object',
					properties: {
						type: { type: 'string', enum: ['color', 'gradient', 'image'], default: 'color' },
						last_color: {
							description: 'hex, rgb, rgba, hsv color, CSS syntax.',
							type: 'string',
							default: '#ffffff'
						},
						last_gradient: { $ref: '#/definitions/gradient' },
						last_image: {
							description:
								'Name of the image with the extension, stored in the background folder of the object.',
							type: 'string',
							default: ''
						},
						size: {
							type: 'object',
							properties: {
								type: {
									type: 'string',
									enum: ['contain', 'cover', 'percentage'],
									default: 'contain'
								},
								percentage: {
									description: 'Used only if the size type is percentage.',
									$ref: '#/definitions/point'
								}
							},
							required: ['type']
						},
						repeat: { enum: ['no_repeat', 'repeat', 'repeat_x', 'repeat_y'], default: 'no_repeat' }
					},
					default: { type: 'color', last_color: '', last_gradient: {}, last_image: '', size: {} },
					required: ['type', 'last_color', 'last_gradient', 'last_image', 'size', 'repeat']
				}
			},
			required: ['background']
		},
		supports_particle_props: {
			type: 'object',
			properties: {
				particle_radius_range: {
					type: 'array',
					items: { type: 'integer', minimum: 1 },
					minItems: 2,
					maxItems: 2,
					default: [1, 1]
				},
				flow_type: { enum: ['radial', 'directional'], default: 'radial' },
				flow_center: {
					type: 'array',
					items: { type: 'integer' },
					minItems: 2,
					maxItems: 2,
					default: [0, 0]
				},
				flow_direction: { $ref: '#/definitions/angle_degrees_int', default: 0 },
				particle_spawn_probability: { type: 'number', minimum: 0, maximum: 1, default: 0 },
				particle_spawn_tests: {
					description:
						'How many times per frame an attempt to spawn a particle is done. Thus, it also defines the maximum of spawned particles per frame',
					type: 'integer',
					minimum: 1,
					default: 1
				}
			},
			required: [
				'particle_radius_range',
				'flow_type',
				'flow_center',
				'flow_direction',
				'particle_spawn_probability',
				'particle_spawn_tests'
			]
		},
		supports_color: {
			type: 'object',
			properties: { color: { description: 'hex, rgb, rgba', type: 'string', default: '#ffffff' } },
			required: ['color']
		},
		supports_text_props: {
			type: 'object',
			properties: {
				text_type: { enum: ['any', 'time'], default: 'any' },
				text_content: { type: 'string', default: 'text' },
				font_size: { type: 'integer', minimum: 1, default: 18 },
				text_decoration: {
					type: 'object',
					properties: {
						italic: { type: 'boolean', default: false },
						bold: { type: 'boolean', default: false },
						underline: { type: 'boolean', default: false },
						overline: { type: 'boolean', default: false },
						line_through: { type: 'boolean', default: false }
					},
					default: {
						italic: false,
						bold: false,
						underline: false,
						overline: false,
						line_through: false
					},
					required: ['italic', 'bold', 'underline', 'overline', 'line_through']
				},
				text_align: {
					type: 'object',
					properties: { horizontal: { enum: ['left', 'center', 'right'], default: 'left' } },
					default: { horizontal: 'left' },
					required: ['horizontal']
				},
				text_shadows: {
					description: 'list of box-shadows',
					type: 'array',
					items: { $ref: '#/definitions/shadow' },
					default: []
				}
			},
			required: [
				'text_type',
				'text_content',
				'font_size',
				'text_decoration',
				'text_align',
				'text_shadows'
			]
		},
		supports_border_thickness: {
			type: 'object',
			properties: { border_thickness: { type: 'integer', minimum: 0, default: 1 } },
			required: ['border_thickness']
		},
		supports_timer_inner_spacing: {
			type: 'object',
			properties: { timer_inner_spacing: { type: 'integer', minimum: 0, default: 1 } },
			required: ['timer_inner_spacing']
		},
		supports_visualizer_props: {
			type: 'object',
			properties: {
				visualizer_points_count: { type: 'integer', minimum: 1, default: 100 },
				visualizer_analyzer_range: {
					description:
						'Drawn range for the visualizer. 0 maps to 20Hz and 1023 maps to 20000Hz. The scale is logarithmic.',
					type: 'array',
					items: { type: 'integer', minimum: 0 },
					minItems: 2,
					maxItems: 2,
					default: [0, 1023]
				},
				visualization_smoothing_type: {
					description: 'Interpolation type of the frequency array between frames.',
					enum: ['proportional_decrease', 'linear_decrease', 'average'],
					default: 'proportional_decrease'
				},
				visualization_smoothing_factor: {
					description:
						'Parameter for the visualization smoothing type. Its behaviour differs depending of the mode.',
					type: 'number',
					minimum: 0,
					default: 0.8
				}
			},
			required: [
				'visualizer_points_count',
				'visualizer_analyzer_range',
				'visualization_smoothing_type',
				'visualization_smoothing_factor'
			]
		},
		supports_visualizer_bar_props: {
			type: 'object',
			properties: { visualizer_bar_thickness: { type: 'integer', minimum: 0, default: 2 } },
			required: ['visualizer_bar_thickness']
		},
		supports_visualizer_circular_props: {
			type: 'object',
			properties: { visualizer_radius: { type: 'integer', minimum: 0, default: 50 } },
			required: ['visualizer_radius']
		},
		shape: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'shape' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_border_radius' },
				{ $ref: '#/definitions/supports_box_shadows' },
				{ $ref: '#/definitions/supports_background' }
			]
		},
		particle_flow: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'particle_flow' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_particle_props' },
				{ $ref: '#/definitions/supports_color' }
			]
		},
		text: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'text' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_text_props' },
				{ $ref: '#/definitions/supports_color' }
			]
		},
		timer_straight_bar: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'timer_straight_bar' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_color' },
				{ $ref: '#/definitions/supports_border_thickness' },
				{ $ref: '#/definitions/supports_border_radius' },
				{ $ref: '#/definitions/supports_box_shadows' },
				{ $ref: '#/definitions/supports_timer_inner_spacing' }
			]
		},
		timer_straight_line_point: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'timer_straight_line_point' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_color' },
				{ $ref: '#/definitions/supports_border_thickness' },
				{ $ref: '#/definitions/supports_border_radius' },
				{ $ref: '#/definitions/supports_box_shadows' }
			]
		},
		visualizer_straight_bar: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'visualizer_straight_bar' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_visualizer_props' },
				{ $ref: '#/definitions/supports_visualizer_bar_props' },
				{ $ref: '#/definitions/supports_color' },
				{ $ref: '#/definitions/supports_border_radius' },
				{ $ref: '#/definitions/supports_box_shadows' }
			]
		},
		visualizer_straight_wave: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'visualizer_straight_wave' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_visualizer_props' },
				{ $ref: '#/definitions/supports_color' }
			]
		},
		visualizer_circular_bar: {
			allOf: [
				{
					type: 'object',
					properties: { visual_object_type: { const: 'visualizer_circular_bar' } },
					required: ['visual_object_type']
				},
				{ $ref: '#/definitions/visual_object_interface' },
				{ $ref: '#/definitions/supports_visualizer_props' },
				{ $ref: '#/definitions/supports_color' },
				{ $ref: '#/definitions/supports_border_radius' },
				{ $ref: '#/definitions/supports_box_shadows' },
				{ $ref: '#/definitions/supports_visualizer_bar_props' },
				{ $ref: '#/definitions/supports_visualizer_circular_props' }
			]
		},
		visual_object: {
			anyOf: [
				{ $ref: '#/definitions/shape' },
				{ $ref: '#/definitions/particle_flow' },
				{ $ref: '#/definitions/text' },
				{ $ref: '#/definitions/timer_straight_bar' },
				{ $ref: '#/definitions/timer_straight_line_point' },
				{ $ref: '#/definitions/visualizer_straight_bar' },
				{ $ref: '#/definitions/visualizer_straight_wave' },
				{ $ref: '#/definitions/visualizer_circular_bar' }
			]
		}
	},
	type: 'object',
	properties: {
		save_version: { type: 'number', const: 5 },
		software_version_used: { description: 'last version modifying this save', type: 'string' },
		software_version_first_created: {
			description: 'first version creating this save',
			type: 'string'
		},
		screen: {
			description: 'video frame resolution',
			type: 'object',
			properties: {
				width: { type: 'number', minimum: 1, default: 1920 },
				height: { type: 'number', minimum: 1, default: 1080 }
			},
			default: { width: 1920, height: 1080 },
			required: ['width', 'height']
		},
		fps: { type: 'number', minimum: 1, default: 60 },
		audio_filename: { type: 'string', default: '' },
		objects: {
			description: 'Record of visual objects, indexed by a unique ID.',
			type: 'object',
			default: {},
			additionalProperties: { $ref: '#/definitions/visual_object' }
		}
	},
	required: [
		'save_version',
		'software_version_used',
		'software_version_first_created',
		'screen',
		'fps',
		'audio_filename',
		'objects'
	]
};
const schema12 = {
	anyOf: [
		{ $ref: '#/definitions/shape' },
		{ $ref: '#/definitions/particle_flow' },
		{ $ref: '#/definitions/text' },
		{ $ref: '#/definitions/timer_straight_bar' },
		{ $ref: '#/definitions/timer_straight_line_point' },
		{ $ref: '#/definitions/visualizer_straight_bar' },
		{ $ref: '#/definitions/visualizer_straight_wave' },
		{ $ref: '#/definitions/visualizer_circular_bar' }
	]
};
const schema13 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'shape' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_border_radius' },
		{ $ref: '#/definitions/supports_box_shadows' },
		{ $ref: '#/definitions/supports_background' }
	]
};
const schema16 = {
	type: 'object',
	properties: {
		border_radius: {
			description:
				'order: top-left, top-right, bottom-right, bottom-left; before and after point clockwise.',
			type: 'array',
			items: {
				type: 'object',
				properties: {
					value: { type: 'integer', minimum: 0, default: 0 },
					unit: { type: 'string', enum: ['px', 'percent'], default: 'px' }
				},
				required: ['value', 'unit']
			},
			minItems: 8,
			maxItems: 8,
			default: [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			]
		}
	},
	required: ['border_radius']
};
const schema14 = {
	type: 'object',
	properties: {
		visual_object_type: { type: 'string' },
		name: { type: 'string', default: '' },
		layer: { type: 'integer', minimum: 0, default: 0 },
		coordinates: {
			type: 'object',
			properties: { x: { type: 'integer', default: 0 }, y: { type: 'integer', default: 0 } },
			default: { x: 0, y: 0 },
			required: ['x', 'y']
		},
		size: {
			type: 'object',
			properties: {
				width: { type: 'integer', minimum: 0, default: 0 },
				height: { type: 'integer', minimum: 0, default: 0 }
			},
			default: { width: 0, height: 0 },
			required: ['width', 'height']
		},
		rotation: { $ref: '#/definitions/angle_degrees_int', default: 0 },
		svg_filter: {
			description: 'List of `<filter>` tags separated by `[#]` with no `<script>` tag.',
			type: 'string',
			default: ''
		}
	},
	required: ['name', 'layer', 'coordinates', 'size', 'rotation', 'svg_filter']
};
const schema15 = {
	description: 'degrees, clockwise. 0 and 360 may have a different meaning.',
	type: 'integer',
	minimum: 0,
	maximum: 360
};
function validate13(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.name === undefined) {
			data.name = '';
		}
		if (data.layer === undefined) {
			data.layer = 0;
		}
		if (data.coordinates === undefined) {
			data.coordinates = { x: 0, y: 0 };
		}
		if (data.size === undefined) {
			data.size = { width: 0, height: 0 };
		}
		if (data.rotation === undefined) {
			data.rotation = 0;
		}
		if (data.svg_filter === undefined) {
			data.svg_filter = '';
		}
		if (data.name === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'name' },
				message: "must have required property '" + 'name' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.layer === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'layer' },
				message: "must have required property '" + 'layer' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.coordinates === undefined) {
			const err2 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'coordinates' },
				message: "must have required property '" + 'coordinates' + "'"
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.size === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'size' },
				message: "must have required property '" + 'size' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.rotation === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'rotation' },
				message: "must have required property '" + 'rotation' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.svg_filter === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'svg_filter' },
				message: "must have required property '" + 'svg_filter' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if (typeof data.visual_object_type !== 'string') {
				const err6 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/properties/visual_object_type/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
		}
		if (typeof data.name !== 'string') {
			const err7 = {
				instancePath: instancePath + '/name',
				schemaPath: '#/properties/name/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		let data2 = data.layer;
		if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
			const err8 = {
				instancePath: instancePath + '/layer',
				schemaPath: '#/properties/layer/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err8];
			} else {
				vErrors.push(err8);
			}
			errors++;
		}
		if (typeof data2 == 'number' && isFinite(data2)) {
			if (data2 < 0 || isNaN(data2)) {
				const err9 = {
					instancePath: instancePath + '/layer',
					schemaPath: '#/properties/layer/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
		}
		let data3 = data.coordinates;
		if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
			if (data3.x === undefined) {
				data3.x = 0;
			}
			if (data3.y === undefined) {
				data3.y = 0;
			}
			if (data3.x === undefined) {
				const err10 = {
					instancePath: instancePath + '/coordinates',
					schemaPath: '#/properties/coordinates/required',
					keyword: 'required',
					params: { missingProperty: 'x' },
					message: "must have required property '" + 'x' + "'"
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			if (data3.y === undefined) {
				const err11 = {
					instancePath: instancePath + '/coordinates',
					schemaPath: '#/properties/coordinates/required',
					keyword: 'required',
					params: { missingProperty: 'y' },
					message: "must have required property '" + 'y' + "'"
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			let data4 = data3.x;
			if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
				const err12 = {
					instancePath: instancePath + '/coordinates/x',
					schemaPath: '#/properties/coordinates/properties/x/type',
					keyword: 'type',
					params: { type: 'integer' },
					message: 'must be integer'
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			let data5 = data3.y;
			if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
				const err13 = {
					instancePath: instancePath + '/coordinates/y',
					schemaPath: '#/properties/coordinates/properties/y/type',
					keyword: 'type',
					params: { type: 'integer' },
					message: 'must be integer'
				};
				if (vErrors === null) {
					vErrors = [err13];
				} else {
					vErrors.push(err13);
				}
				errors++;
			}
		} else {
			const err14 = {
				instancePath: instancePath + '/coordinates',
				schemaPath: '#/properties/coordinates/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err14];
			} else {
				vErrors.push(err14);
			}
			errors++;
		}
		let data6 = data.size;
		if (data6 && typeof data6 == 'object' && !Array.isArray(data6)) {
			if (data6.width === undefined) {
				data6.width = 0;
			}
			if (data6.height === undefined) {
				data6.height = 0;
			}
			if (data6.width === undefined) {
				const err15 = {
					instancePath: instancePath + '/size',
					schemaPath: '#/properties/size/required',
					keyword: 'required',
					params: { missingProperty: 'width' },
					message: "must have required property '" + 'width' + "'"
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
			if (data6.height === undefined) {
				const err16 = {
					instancePath: instancePath + '/size',
					schemaPath: '#/properties/size/required',
					keyword: 'required',
					params: { missingProperty: 'height' },
					message: "must have required property '" + 'height' + "'"
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
			let data7 = data6.width;
			if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7) && isFinite(data7))) {
				const err17 = {
					instancePath: instancePath + '/size/width',
					schemaPath: '#/properties/size/properties/width/type',
					keyword: 'type',
					params: { type: 'integer' },
					message: 'must be integer'
				};
				if (vErrors === null) {
					vErrors = [err17];
				} else {
					vErrors.push(err17);
				}
				errors++;
			}
			if (typeof data7 == 'number' && isFinite(data7)) {
				if (data7 < 0 || isNaN(data7)) {
					const err18 = {
						instancePath: instancePath + '/size/width',
						schemaPath: '#/properties/size/properties/width/minimum',
						keyword: 'minimum',
						params: { comparison: '>=', limit: 0 },
						message: 'must be >= 0'
					};
					if (vErrors === null) {
						vErrors = [err18];
					} else {
						vErrors.push(err18);
					}
					errors++;
				}
			}
			let data8 = data6.height;
			if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
				const err19 = {
					instancePath: instancePath + '/size/height',
					schemaPath: '#/properties/size/properties/height/type',
					keyword: 'type',
					params: { type: 'integer' },
					message: 'must be integer'
				};
				if (vErrors === null) {
					vErrors = [err19];
				} else {
					vErrors.push(err19);
				}
				errors++;
			}
			if (typeof data8 == 'number' && isFinite(data8)) {
				if (data8 < 0 || isNaN(data8)) {
					const err20 = {
						instancePath: instancePath + '/size/height',
						schemaPath: '#/properties/size/properties/height/minimum',
						keyword: 'minimum',
						params: { comparison: '>=', limit: 0 },
						message: 'must be >= 0'
					};
					if (vErrors === null) {
						vErrors = [err20];
					} else {
						vErrors.push(err20);
					}
					errors++;
				}
			}
		} else {
			const err21 = {
				instancePath: instancePath + '/size',
				schemaPath: '#/properties/size/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err21];
			} else {
				vErrors.push(err21);
			}
			errors++;
		}
		let data9 = data.rotation;
		if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
			const err22 = {
				instancePath: instancePath + '/rotation',
				schemaPath: '#/definitions/angle_degrees_int/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
		if (typeof data9 == 'number' && isFinite(data9)) {
			if (data9 > 360 || isNaN(data9)) {
				const err23 = {
					instancePath: instancePath + '/rotation',
					schemaPath: '#/definitions/angle_degrees_int/maximum',
					keyword: 'maximum',
					params: { comparison: '<=', limit: 360 },
					message: 'must be <= 360'
				};
				if (vErrors === null) {
					vErrors = [err23];
				} else {
					vErrors.push(err23);
				}
				errors++;
			}
			if (data9 < 0 || isNaN(data9)) {
				const err24 = {
					instancePath: instancePath + '/rotation',
					schemaPath: '#/definitions/angle_degrees_int/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err24];
				} else {
					vErrors.push(err24);
				}
				errors++;
			}
		}
		if (typeof data.svg_filter !== 'string') {
			const err25 = {
				instancePath: instancePath + '/svg_filter',
				schemaPath: '#/properties/svg_filter/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err25];
			} else {
				vErrors.push(err25);
			}
			errors++;
		}
	} else {
		const err26 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err26];
		} else {
			vErrors.push(err26);
		}
		errors++;
	}
	validate13.errors = vErrors;
	return errors === 0;
}
const schema17 = {
	type: 'object',
	properties: {
		box_shadows: {
			description: 'list of box-shadows',
			type: 'array',
			items: { $ref: '#/definitions/shadow' },
			default: []
		}
	},
	required: ['box_shadows']
};
const schema18 = {
	description: 'Used for both box-shadow and text-shadow.',
	type: 'object',
	properties: {
		inset: { type: 'boolean', default: false },
		offset: { $ref: '#/definitions/point' },
		blur_radius: { type: 'number', minimum: 0, default: 0 },
		spread_radius: { type: 'number', default: 0 },
		color: { $ref: '#/definitions/color' }
	},
	required: ['inset', 'offset', 'blur_radius', 'spread_radius', 'color']
};
const schema19 = {
	type: 'object',
	properties: { x: { type: 'number', default: 0 }, y: { type: 'number', default: 0 } },
	required: ['x', 'y']
};
const schema20 = {
	description: 'hex, rgb, rgba, hsv color, CSS syntax.',
	type: 'string',
	default: '#ffffff'
};
function validate16(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.inset === undefined) {
			data.inset = false;
		}
		if (data.blur_radius === undefined) {
			data.blur_radius = 0;
		}
		if (data.spread_radius === undefined) {
			data.spread_radius = 0;
		}
		if (data.inset === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'inset' },
				message: "must have required property '" + 'inset' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.offset === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'offset' },
				message: "must have required property '" + 'offset' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.blur_radius === undefined) {
			const err2 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'blur_radius' },
				message: "must have required property '" + 'blur_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.spread_radius === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'spread_radius' },
				message: "must have required property '" + 'spread_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.color === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (typeof data.inset !== 'boolean') {
			const err5 = {
				instancePath: instancePath + '/inset',
				schemaPath: '#/properties/inset/type',
				keyword: 'type',
				params: { type: 'boolean' },
				message: 'must be boolean'
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.offset !== undefined) {
			let data1 = data.offset;
			if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
				if (data1.x === undefined) {
					data1.x = 0;
				}
				if (data1.y === undefined) {
					data1.y = 0;
				}
				if (data1.x === undefined) {
					const err6 = {
						instancePath: instancePath + '/offset',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'x' },
						message: "must have required property '" + 'x' + "'"
					};
					if (vErrors === null) {
						vErrors = [err6];
					} else {
						vErrors.push(err6);
					}
					errors++;
				}
				if (data1.y === undefined) {
					const err7 = {
						instancePath: instancePath + '/offset',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'y' },
						message: "must have required property '" + 'y' + "'"
					};
					if (vErrors === null) {
						vErrors = [err7];
					} else {
						vErrors.push(err7);
					}
					errors++;
				}
				let data2 = data1.x;
				if (!(typeof data2 == 'number' && isFinite(data2))) {
					const err8 = {
						instancePath: instancePath + '/offset/x',
						schemaPath: '#/definitions/point/properties/x/type',
						keyword: 'type',
						params: { type: 'number' },
						message: 'must be number'
					};
					if (vErrors === null) {
						vErrors = [err8];
					} else {
						vErrors.push(err8);
					}
					errors++;
				}
				let data3 = data1.y;
				if (!(typeof data3 == 'number' && isFinite(data3))) {
					const err9 = {
						instancePath: instancePath + '/offset/y',
						schemaPath: '#/definitions/point/properties/y/type',
						keyword: 'type',
						params: { type: 'number' },
						message: 'must be number'
					};
					if (vErrors === null) {
						vErrors = [err9];
					} else {
						vErrors.push(err9);
					}
					errors++;
				}
			} else {
				const err10 = {
					instancePath: instancePath + '/offset',
					schemaPath: '#/definitions/point/type',
					keyword: 'type',
					params: { type: 'object' },
					message: 'must be object'
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
		}
		let data4 = data.blur_radius;
		if (typeof data4 == 'number' && isFinite(data4)) {
			if (data4 < 0 || isNaN(data4)) {
				const err11 = {
					instancePath: instancePath + '/blur_radius',
					schemaPath: '#/properties/blur_radius/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
		} else {
			const err12 = {
				instancePath: instancePath + '/blur_radius',
				schemaPath: '#/properties/blur_radius/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err12];
			} else {
				vErrors.push(err12);
			}
			errors++;
		}
		let data5 = data.spread_radius;
		if (!(typeof data5 == 'number' && isFinite(data5))) {
			const err13 = {
				instancePath: instancePath + '/spread_radius',
				schemaPath: '#/properties/spread_radius/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		if (data.color !== undefined) {
			if (typeof data.color !== 'string') {
				const err14 = {
					instancePath: instancePath + '/color',
					schemaPath: '#/definitions/color/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
		}
	} else {
		const err15 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err15];
		} else {
			vErrors.push(err15);
		}
		errors++;
	}
	validate16.errors = vErrors;
	return errors === 0;
}
function validate15(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.box_shadows === undefined) {
			data.box_shadows = [];
		}
		if (data.box_shadows === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadows' },
				message: "must have required property '" + 'box_shadows' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		let data0 = data.box_shadows;
		if (Array.isArray(data0)) {
			const len0 = data0.length;
			for (let i0 = 0; i0 < len0; i0++) {
				if (
					!validate16(data0[i0], {
						instancePath: instancePath + '/box_shadows/' + i0,
						parentData: data0,
						parentDataProperty: i0,
						rootData
					})
				) {
					vErrors = vErrors === null ? validate16.errors : vErrors.concat(validate16.errors);
					errors = vErrors.length;
				}
			}
		} else {
			const err1 = {
				instancePath: instancePath + '/box_shadows',
				schemaPath: '#/properties/box_shadows/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	validate15.errors = vErrors;
	return errors === 0;
}
const schema21 = {
	type: 'object',
	properties: {
		background: {
			type: 'object',
			properties: {
				type: { type: 'string', enum: ['color', 'gradient', 'image'], default: 'color' },
				last_color: {
					description: 'hex, rgb, rgba, hsv color, CSS syntax.',
					type: 'string',
					default: '#ffffff'
				},
				last_gradient: { $ref: '#/definitions/gradient' },
				last_image: {
					description:
						'Name of the image with the extension, stored in the background folder of the object.',
					type: 'string',
					default: ''
				},
				size: {
					type: 'object',
					properties: {
						type: { type: 'string', enum: ['contain', 'cover', 'percentage'], default: 'contain' },
						percentage: {
							description: 'Used only if the size type is percentage.',
							$ref: '#/definitions/point'
						}
					},
					required: ['type']
				},
				repeat: { enum: ['no_repeat', 'repeat', 'repeat_x', 'repeat_y'], default: 'no_repeat' }
			},
			default: { type: 'color', last_color: '', last_gradient: {}, last_image: '', size: {} },
			required: ['type', 'last_color', 'last_gradient', 'last_image', 'size', 'repeat']
		}
	},
	required: ['background']
};
const schema22 = {
	type: 'object',
	properties: {
		type: { type: 'string', enum: ['linear', 'radial'], default: 'linear' },
		start_point: {
			description: 'Also represents the center of the radial gradient',
			$ref: '#/definitions/point'
		},
		end_point: { $ref: '#/definitions/point' },
		color_stops: {
			description: 'List of color stops. The position is between 0 and 1.',
			type: 'array',
			items: {
				type: 'object',
				properties: {
					offset: { type: 'number', minimum: 0, maximum: 1 },
					color: { $ref: '#/definitions/color' }
				},
				required: ['offset', 'color'],
				default: { offset: 0, color: '#000000' }
			},
			minItems: 2,
			default: [
				{ offset: 0, color: '#000000' },
				{ offset: 1, color: '#ffffff' }
			]
		}
	},
	required: ['type', 'color_stops']
};
function validate20(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.type === undefined) {
			data.type = 'linear';
		}
		if (data.color_stops === undefined) {
			data.color_stops = [
				{ offset: 0, color: '#000000' },
				{ offset: 1, color: '#ffffff' }
			];
		}
		if (data.type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'type' },
				message: "must have required property '" + 'type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.color_stops === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'color_stops' },
				message: "must have required property '" + 'color_stops' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		let data0 = data.type;
		if (typeof data0 !== 'string') {
			const err2 = {
				instancePath: instancePath + '/type',
				schemaPath: '#/properties/type/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (!(data0 === 'linear' || data0 === 'radial')) {
			const err3 = {
				instancePath: instancePath + '/type',
				schemaPath: '#/properties/type/enum',
				keyword: 'enum',
				params: { allowedValues: schema22.properties.type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.start_point !== undefined) {
			let data1 = data.start_point;
			if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
				if (data1.x === undefined) {
					data1.x = 0;
				}
				if (data1.y === undefined) {
					data1.y = 0;
				}
				if (data1.x === undefined) {
					const err4 = {
						instancePath: instancePath + '/start_point',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'x' },
						message: "must have required property '" + 'x' + "'"
					};
					if (vErrors === null) {
						vErrors = [err4];
					} else {
						vErrors.push(err4);
					}
					errors++;
				}
				if (data1.y === undefined) {
					const err5 = {
						instancePath: instancePath + '/start_point',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'y' },
						message: "must have required property '" + 'y' + "'"
					};
					if (vErrors === null) {
						vErrors = [err5];
					} else {
						vErrors.push(err5);
					}
					errors++;
				}
				let data2 = data1.x;
				if (!(typeof data2 == 'number' && isFinite(data2))) {
					const err6 = {
						instancePath: instancePath + '/start_point/x',
						schemaPath: '#/definitions/point/properties/x/type',
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
				let data3 = data1.y;
				if (!(typeof data3 == 'number' && isFinite(data3))) {
					const err7 = {
						instancePath: instancePath + '/start_point/y',
						schemaPath: '#/definitions/point/properties/y/type',
						keyword: 'type',
						params: { type: 'number' },
						message: 'must be number'
					};
					if (vErrors === null) {
						vErrors = [err7];
					} else {
						vErrors.push(err7);
					}
					errors++;
				}
			} else {
				const err8 = {
					instancePath: instancePath + '/start_point',
					schemaPath: '#/definitions/point/type',
					keyword: 'type',
					params: { type: 'object' },
					message: 'must be object'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		if (data.end_point !== undefined) {
			let data4 = data.end_point;
			if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
				if (data4.x === undefined) {
					data4.x = 0;
				}
				if (data4.y === undefined) {
					data4.y = 0;
				}
				if (data4.x === undefined) {
					const err9 = {
						instancePath: instancePath + '/end_point',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'x' },
						message: "must have required property '" + 'x' + "'"
					};
					if (vErrors === null) {
						vErrors = [err9];
					} else {
						vErrors.push(err9);
					}
					errors++;
				}
				if (data4.y === undefined) {
					const err10 = {
						instancePath: instancePath + '/end_point',
						schemaPath: '#/definitions/point/required',
						keyword: 'required',
						params: { missingProperty: 'y' },
						message: "must have required property '" + 'y' + "'"
					};
					if (vErrors === null) {
						vErrors = [err10];
					} else {
						vErrors.push(err10);
					}
					errors++;
				}
				let data5 = data4.x;
				if (!(typeof data5 == 'number' && isFinite(data5))) {
					const err11 = {
						instancePath: instancePath + '/end_point/x',
						schemaPath: '#/definitions/point/properties/x/type',
						keyword: 'type',
						params: { type: 'number' },
						message: 'must be number'
					};
					if (vErrors === null) {
						vErrors = [err11];
					} else {
						vErrors.push(err11);
					}
					errors++;
				}
				let data6 = data4.y;
				if (!(typeof data6 == 'number' && isFinite(data6))) {
					const err12 = {
						instancePath: instancePath + '/end_point/y',
						schemaPath: '#/definitions/point/properties/y/type',
						keyword: 'type',
						params: { type: 'number' },
						message: 'must be number'
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
					instancePath: instancePath + '/end_point',
					schemaPath: '#/definitions/point/type',
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
		}
		let data7 = data.color_stops;
		if (Array.isArray(data7)) {
			if (data7.length < 2) {
				const err14 = {
					instancePath: instancePath + '/color_stops',
					schemaPath: '#/properties/color_stops/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
			const len0 = data7.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data8 = data7[i0];
				if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
					if (data8.offset === undefined) {
						const err15 = {
							instancePath: instancePath + '/color_stops/' + i0,
							schemaPath: '#/properties/color_stops/items/required',
							keyword: 'required',
							params: { missingProperty: 'offset' },
							message: "must have required property '" + 'offset' + "'"
						};
						if (vErrors === null) {
							vErrors = [err15];
						} else {
							vErrors.push(err15);
						}
						errors++;
					}
					if (data8.color === undefined) {
						const err16 = {
							instancePath: instancePath + '/color_stops/' + i0,
							schemaPath: '#/properties/color_stops/items/required',
							keyword: 'required',
							params: { missingProperty: 'color' },
							message: "must have required property '" + 'color' + "'"
						};
						if (vErrors === null) {
							vErrors = [err16];
						} else {
							vErrors.push(err16);
						}
						errors++;
					}
					if (data8.offset !== undefined) {
						let data9 = data8.offset;
						if (typeof data9 == 'number' && isFinite(data9)) {
							if (data9 > 1 || isNaN(data9)) {
								const err17 = {
									instancePath: instancePath + '/color_stops/' + i0 + '/offset',
									schemaPath: '#/properties/color_stops/items/properties/offset/maximum',
									keyword: 'maximum',
									params: { comparison: '<=', limit: 1 },
									message: 'must be <= 1'
								};
								if (vErrors === null) {
									vErrors = [err17];
								} else {
									vErrors.push(err17);
								}
								errors++;
							}
							if (data9 < 0 || isNaN(data9)) {
								const err18 = {
									instancePath: instancePath + '/color_stops/' + i0 + '/offset',
									schemaPath: '#/properties/color_stops/items/properties/offset/minimum',
									keyword: 'minimum',
									params: { comparison: '>=', limit: 0 },
									message: 'must be >= 0'
								};
								if (vErrors === null) {
									vErrors = [err18];
								} else {
									vErrors.push(err18);
								}
								errors++;
							}
						} else {
							const err19 = {
								instancePath: instancePath + '/color_stops/' + i0 + '/offset',
								schemaPath: '#/properties/color_stops/items/properties/offset/type',
								keyword: 'type',
								params: { type: 'number' },
								message: 'must be number'
							};
							if (vErrors === null) {
								vErrors = [err19];
							} else {
								vErrors.push(err19);
							}
							errors++;
						}
					}
					if (data8.color !== undefined) {
						if (typeof data8.color !== 'string') {
							const err20 = {
								instancePath: instancePath + '/color_stops/' + i0 + '/color',
								schemaPath: '#/definitions/color/type',
								keyword: 'type',
								params: { type: 'string' },
								message: 'must be string'
							};
							if (vErrors === null) {
								vErrors = [err20];
							} else {
								vErrors.push(err20);
							}
							errors++;
						}
					}
				} else {
					const err21 = {
						instancePath: instancePath + '/color_stops/' + i0,
						schemaPath: '#/properties/color_stops/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err21];
					} else {
						vErrors.push(err21);
					}
					errors++;
				}
			}
		} else {
			const err22 = {
				instancePath: instancePath + '/color_stops',
				schemaPath: '#/properties/color_stops/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
	} else {
		const err23 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err23];
		} else {
			vErrors.push(err23);
		}
		errors++;
	}
	validate20.errors = vErrors;
	return errors === 0;
}
function validate19(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.background === undefined) {
			data.background = {
				type: 'color',
				last_color: '',
				last_gradient: {},
				last_image: '',
				size: {}
			};
		}
		if (data.background === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'background' },
				message: "must have required property '" + 'background' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		let data0 = data.background;
		if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
			if (data0.type === undefined) {
				data0.type = 'color';
			}
			if (data0.last_color === undefined) {
				data0.last_color = '#ffffff';
			}
			if (data0.last_image === undefined) {
				data0.last_image = '';
			}
			if (data0.repeat === undefined) {
				data0.repeat = 'no_repeat';
			}
			if (data0.type === undefined) {
				const err1 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'type' },
					message: "must have required property '" + 'type' + "'"
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
			if (data0.last_color === undefined) {
				const err2 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_color' },
					message: "must have required property '" + 'last_color' + "'"
				};
				if (vErrors === null) {
					vErrors = [err2];
				} else {
					vErrors.push(err2);
				}
				errors++;
			}
			if (data0.last_gradient === undefined) {
				const err3 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_gradient' },
					message: "must have required property '" + 'last_gradient' + "'"
				};
				if (vErrors === null) {
					vErrors = [err3];
				} else {
					vErrors.push(err3);
				}
				errors++;
			}
			if (data0.last_image === undefined) {
				const err4 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_image' },
					message: "must have required property '" + 'last_image' + "'"
				};
				if (vErrors === null) {
					vErrors = [err4];
				} else {
					vErrors.push(err4);
				}
				errors++;
			}
			if (data0.size === undefined) {
				const err5 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'size' },
					message: "must have required property '" + 'size' + "'"
				};
				if (vErrors === null) {
					vErrors = [err5];
				} else {
					vErrors.push(err5);
				}
				errors++;
			}
			if (data0.repeat === undefined) {
				const err6 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'repeat' },
					message: "must have required property '" + 'repeat' + "'"
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
			let data1 = data0.type;
			if (typeof data1 !== 'string') {
				const err7 = {
					instancePath: instancePath + '/background/type',
					schemaPath: '#/properties/background/properties/type/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err7];
				} else {
					vErrors.push(err7);
				}
				errors++;
			}
			if (!(data1 === 'color' || data1 === 'gradient' || data1 === 'image')) {
				const err8 = {
					instancePath: instancePath + '/background/type',
					schemaPath: '#/properties/background/properties/type/enum',
					keyword: 'enum',
					params: { allowedValues: schema21.properties.background.properties.type.enum },
					message: 'must be equal to one of the allowed values'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
			if (typeof data0.last_color !== 'string') {
				const err9 = {
					instancePath: instancePath + '/background/last_color',
					schemaPath: '#/properties/background/properties/last_color/type',
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
			if (data0.last_gradient !== undefined) {
				if (
					!validate20(data0.last_gradient, {
						instancePath: instancePath + '/background/last_gradient',
						parentData: data0,
						parentDataProperty: 'last_gradient',
						rootData
					})
				) {
					vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
					errors = vErrors.length;
				}
			}
			if (typeof data0.last_image !== 'string') {
				const err10 = {
					instancePath: instancePath + '/background/last_image',
					schemaPath: '#/properties/background/properties/last_image/type',
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
			if (data0.size !== undefined) {
				let data5 = data0.size;
				if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
					if (data5.type === undefined) {
						data5.type = 'contain';
					}
					if (data5.type === undefined) {
						const err11 = {
							instancePath: instancePath + '/background/size',
							schemaPath: '#/properties/background/properties/size/required',
							keyword: 'required',
							params: { missingProperty: 'type' },
							message: "must have required property '" + 'type' + "'"
						};
						if (vErrors === null) {
							vErrors = [err11];
						} else {
							vErrors.push(err11);
						}
						errors++;
					}
					let data6 = data5.type;
					if (typeof data6 !== 'string') {
						const err12 = {
							instancePath: instancePath + '/background/size/type',
							schemaPath: '#/properties/background/properties/size/properties/type/type',
							keyword: 'type',
							params: { type: 'string' },
							message: 'must be string'
						};
						if (vErrors === null) {
							vErrors = [err12];
						} else {
							vErrors.push(err12);
						}
						errors++;
					}
					if (!(data6 === 'contain' || data6 === 'cover' || data6 === 'percentage')) {
						const err13 = {
							instancePath: instancePath + '/background/size/type',
							schemaPath: '#/properties/background/properties/size/properties/type/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema21.properties.background.properties.size.properties.type.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err13];
						} else {
							vErrors.push(err13);
						}
						errors++;
					}
					if (data5.percentage !== undefined) {
						let data7 = data5.percentage;
						if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
							if (data7.x === undefined) {
								data7.x = 0;
							}
							if (data7.y === undefined) {
								data7.y = 0;
							}
							if (data7.x === undefined) {
								const err14 = {
									instancePath: instancePath + '/background/size/percentage',
									schemaPath: '#/definitions/point/required',
									keyword: 'required',
									params: { missingProperty: 'x' },
									message: "must have required property '" + 'x' + "'"
								};
								if (vErrors === null) {
									vErrors = [err14];
								} else {
									vErrors.push(err14);
								}
								errors++;
							}
							if (data7.y === undefined) {
								const err15 = {
									instancePath: instancePath + '/background/size/percentage',
									schemaPath: '#/definitions/point/required',
									keyword: 'required',
									params: { missingProperty: 'y' },
									message: "must have required property '" + 'y' + "'"
								};
								if (vErrors === null) {
									vErrors = [err15];
								} else {
									vErrors.push(err15);
								}
								errors++;
							}
							let data8 = data7.x;
							if (!(typeof data8 == 'number' && isFinite(data8))) {
								const err16 = {
									instancePath: instancePath + '/background/size/percentage/x',
									schemaPath: '#/definitions/point/properties/x/type',
									keyword: 'type',
									params: { type: 'number' },
									message: 'must be number'
								};
								if (vErrors === null) {
									vErrors = [err16];
								} else {
									vErrors.push(err16);
								}
								errors++;
							}
							let data9 = data7.y;
							if (!(typeof data9 == 'number' && isFinite(data9))) {
								const err17 = {
									instancePath: instancePath + '/background/size/percentage/y',
									schemaPath: '#/definitions/point/properties/y/type',
									keyword: 'type',
									params: { type: 'number' },
									message: 'must be number'
								};
								if (vErrors === null) {
									vErrors = [err17];
								} else {
									vErrors.push(err17);
								}
								errors++;
							}
						} else {
							const err18 = {
								instancePath: instancePath + '/background/size/percentage',
								schemaPath: '#/definitions/point/type',
								keyword: 'type',
								params: { type: 'object' },
								message: 'must be object'
							};
							if (vErrors === null) {
								vErrors = [err18];
							} else {
								vErrors.push(err18);
							}
							errors++;
						}
					}
				} else {
					const err19 = {
						instancePath: instancePath + '/background/size',
						schemaPath: '#/properties/background/properties/size/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err19];
					} else {
						vErrors.push(err19);
					}
					errors++;
				}
			}
			let data10 = data0.repeat;
			if (
				!(
					data10 === 'no_repeat' ||
					data10 === 'repeat' ||
					data10 === 'repeat_x' ||
					data10 === 'repeat_y'
				)
			) {
				const err20 = {
					instancePath: instancePath + '/background/repeat',
					schemaPath: '#/properties/background/properties/repeat/enum',
					keyword: 'enum',
					params: { allowedValues: schema21.properties.background.properties.repeat.enum },
					message: 'must be equal to one of the allowed values'
				};
				if (vErrors === null) {
					vErrors = [err20];
				} else {
					vErrors.push(err20);
				}
				errors++;
			}
		} else {
			const err21 = {
				instancePath: instancePath + '/background',
				schemaPath: '#/properties/background/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err21];
			} else {
				vErrors.push(err21);
			}
			errors++;
		}
	} else {
		const err22 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err22];
		} else {
			vErrors.push(err22);
		}
		errors++;
	}
	validate19.errors = vErrors;
	return errors === 0;
}
function validate12(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('shape' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'shape' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_radius === undefined) {
			data.border_radius = [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			];
		}
		if (data.border_radius === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_radius/required',
				keyword: 'required',
				params: { missingProperty: 'border_radius' },
				message: "must have required property '" + 'border_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		let data1 = data.border_radius;
		if (Array.isArray(data1)) {
			if (data1.length > 8) {
				const err4 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/maxItems',
					keyword: 'maxItems',
					params: { limit: 8 },
					message: 'must NOT have more than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err4];
				} else {
					vErrors.push(err4);
				}
				errors++;
			}
			if (data1.length < 8) {
				const err5 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/minItems',
					keyword: 'minItems',
					params: { limit: 8 },
					message: 'must NOT have fewer than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err5];
				} else {
					vErrors.push(err5);
				}
				errors++;
			}
			const len0 = data1.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data2 = data1[i0];
				if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
					if (data2.value === undefined) {
						data2.value = 0;
					}
					if (data2.unit === undefined) {
						data2.unit = 'px';
					}
					if (data2.value === undefined) {
						const err6 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'value' },
							message: "must have required property '" + 'value' + "'"
						};
						if (vErrors === null) {
							vErrors = [err6];
						} else {
							vErrors.push(err6);
						}
						errors++;
					}
					if (data2.unit === undefined) {
						const err7 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'unit' },
							message: "must have required property '" + 'unit' + "'"
						};
						if (vErrors === null) {
							vErrors = [err7];
						} else {
							vErrors.push(err7);
						}
						errors++;
					}
					let data3 = data2.value;
					if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
						const err8 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/value',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/type',
							keyword: 'type',
							params: { type: 'integer' },
							message: 'must be integer'
						};
						if (vErrors === null) {
							vErrors = [err8];
						} else {
							vErrors.push(err8);
						}
						errors++;
					}
					if (typeof data3 == 'number' && isFinite(data3)) {
						if (data3 < 0 || isNaN(data3)) {
							const err9 = {
								instancePath: instancePath + '/border_radius/' + i0 + '/value',
								schemaPath:
									'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/minimum',
								keyword: 'minimum',
								params: { comparison: '>=', limit: 0 },
								message: 'must be >= 0'
							};
							if (vErrors === null) {
								vErrors = [err9];
							} else {
								vErrors.push(err9);
							}
							errors++;
						}
					}
					let data4 = data2.unit;
					if (typeof data4 !== 'string') {
						const err10 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/type',
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
					if (!(data4 === 'px' || data4 === 'percent')) {
						const err11 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema16.properties.border_radius.items.properties.unit.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err11];
						} else {
							vErrors.push(err11);
						}
						errors++;
					}
				} else {
					const err12 = {
						instancePath: instancePath + '/border_radius/' + i0,
						schemaPath: '#/definitions/supports_border_radius/properties/border_radius/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err12];
					} else {
						vErrors.push(err12);
					}
					errors++;
				}
			}
		} else {
			const err13 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
	} else {
		const err14 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err14];
		} else {
			vErrors.push(err14);
		}
		errors++;
	}
	if (!validate15(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
		errors = vErrors.length;
	}
	if (!validate19(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate19.errors : vErrors.concat(validate19.errors);
		errors = vErrors.length;
	}
	validate12.errors = vErrors;
	return errors === 0;
}
const schema27 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'particle_flow' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_particle_props' },
		{ $ref: '#/definitions/supports_color' }
	]
};
const schema30 = {
	type: 'object',
	properties: { color: { description: 'hex, rgb, rgba', type: 'string', default: '#ffffff' } },
	required: ['color']
};
const schema28 = {
	type: 'object',
	properties: {
		particle_radius_range: {
			type: 'array',
			items: { type: 'integer', minimum: 1 },
			minItems: 2,
			maxItems: 2,
			default: [1, 1]
		},
		flow_type: { enum: ['radial', 'directional'], default: 'radial' },
		flow_center: {
			type: 'array',
			items: { type: 'integer' },
			minItems: 2,
			maxItems: 2,
			default: [0, 0]
		},
		flow_direction: { $ref: '#/definitions/angle_degrees_int', default: 0 },
		particle_spawn_probability: { type: 'number', minimum: 0, maximum: 1, default: 0 },
		particle_spawn_tests: {
			description:
				'How many times per frame an attempt to spawn a particle is done. Thus, it also defines the maximum of spawned particles per frame',
			type: 'integer',
			minimum: 1,
			default: 1
		}
	},
	required: [
		'particle_radius_range',
		'flow_type',
		'flow_center',
		'flow_direction',
		'particle_spawn_probability',
		'particle_spawn_tests'
	]
};
function validate26(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.particle_radius_range === undefined) {
			data.particle_radius_range = [1, 1];
		}
		if (data.flow_type === undefined) {
			data.flow_type = 'radial';
		}
		if (data.flow_center === undefined) {
			data.flow_center = [0, 0];
		}
		if (data.flow_direction === undefined) {
			data.flow_direction = 0;
		}
		if (data.particle_spawn_probability === undefined) {
			data.particle_spawn_probability = 0;
		}
		if (data.particle_spawn_tests === undefined) {
			data.particle_spawn_tests = 1;
		}
		if (data.particle_radius_range === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'particle_radius_range' },
				message: "must have required property '" + 'particle_radius_range' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.flow_type === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'flow_type' },
				message: "must have required property '" + 'flow_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.flow_center === undefined) {
			const err2 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'flow_center' },
				message: "must have required property '" + 'flow_center' + "'"
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.flow_direction === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'flow_direction' },
				message: "must have required property '" + 'flow_direction' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.particle_spawn_probability === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'particle_spawn_probability' },
				message: "must have required property '" + 'particle_spawn_probability' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.particle_spawn_tests === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'particle_spawn_tests' },
				message: "must have required property '" + 'particle_spawn_tests' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		let data0 = data.particle_radius_range;
		if (Array.isArray(data0)) {
			if (data0.length > 2) {
				const err6 = {
					instancePath: instancePath + '/particle_radius_range',
					schemaPath: '#/properties/particle_radius_range/maxItems',
					keyword: 'maxItems',
					params: { limit: 2 },
					message: 'must NOT have more than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
			if (data0.length < 2) {
				const err7 = {
					instancePath: instancePath + '/particle_radius_range',
					schemaPath: '#/properties/particle_radius_range/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err7];
				} else {
					vErrors.push(err7);
				}
				errors++;
			}
			const len0 = data0.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data1 = data0[i0];
				if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
					const err8 = {
						instancePath: instancePath + '/particle_radius_range/' + i0,
						schemaPath: '#/properties/particle_radius_range/items/type',
						keyword: 'type',
						params: { type: 'integer' },
						message: 'must be integer'
					};
					if (vErrors === null) {
						vErrors = [err8];
					} else {
						vErrors.push(err8);
					}
					errors++;
				}
				if (typeof data1 == 'number' && isFinite(data1)) {
					if (data1 < 1 || isNaN(data1)) {
						const err9 = {
							instancePath: instancePath + '/particle_radius_range/' + i0,
							schemaPath: '#/properties/particle_radius_range/items/minimum',
							keyword: 'minimum',
							params: { comparison: '>=', limit: 1 },
							message: 'must be >= 1'
						};
						if (vErrors === null) {
							vErrors = [err9];
						} else {
							vErrors.push(err9);
						}
						errors++;
					}
				}
			}
		} else {
			const err10 = {
				instancePath: instancePath + '/particle_radius_range',
				schemaPath: '#/properties/particle_radius_range/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err10];
			} else {
				vErrors.push(err10);
			}
			errors++;
		}
		let data2 = data.flow_type;
		if (!(data2 === 'radial' || data2 === 'directional')) {
			const err11 = {
				instancePath: instancePath + '/flow_type',
				schemaPath: '#/properties/flow_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema28.properties.flow_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err11];
			} else {
				vErrors.push(err11);
			}
			errors++;
		}
		let data3 = data.flow_center;
		if (Array.isArray(data3)) {
			if (data3.length > 2) {
				const err12 = {
					instancePath: instancePath + '/flow_center',
					schemaPath: '#/properties/flow_center/maxItems',
					keyword: 'maxItems',
					params: { limit: 2 },
					message: 'must NOT have more than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			if (data3.length < 2) {
				const err13 = {
					instancePath: instancePath + '/flow_center',
					schemaPath: '#/properties/flow_center/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err13];
				} else {
					vErrors.push(err13);
				}
				errors++;
			}
			const len1 = data3.length;
			for (let i1 = 0; i1 < len1; i1++) {
				let data4 = data3[i1];
				if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
					const err14 = {
						instancePath: instancePath + '/flow_center/' + i1,
						schemaPath: '#/properties/flow_center/items/type',
						keyword: 'type',
						params: { type: 'integer' },
						message: 'must be integer'
					};
					if (vErrors === null) {
						vErrors = [err14];
					} else {
						vErrors.push(err14);
					}
					errors++;
				}
			}
		} else {
			const err15 = {
				instancePath: instancePath + '/flow_center',
				schemaPath: '#/properties/flow_center/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err15];
			} else {
				vErrors.push(err15);
			}
			errors++;
		}
		let data5 = data.flow_direction;
		if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
			const err16 = {
				instancePath: instancePath + '/flow_direction',
				schemaPath: '#/definitions/angle_degrees_int/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err16];
			} else {
				vErrors.push(err16);
			}
			errors++;
		}
		if (typeof data5 == 'number' && isFinite(data5)) {
			if (data5 > 360 || isNaN(data5)) {
				const err17 = {
					instancePath: instancePath + '/flow_direction',
					schemaPath: '#/definitions/angle_degrees_int/maximum',
					keyword: 'maximum',
					params: { comparison: '<=', limit: 360 },
					message: 'must be <= 360'
				};
				if (vErrors === null) {
					vErrors = [err17];
				} else {
					vErrors.push(err17);
				}
				errors++;
			}
			if (data5 < 0 || isNaN(data5)) {
				const err18 = {
					instancePath: instancePath + '/flow_direction',
					schemaPath: '#/definitions/angle_degrees_int/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err18];
				} else {
					vErrors.push(err18);
				}
				errors++;
			}
		}
		let data6 = data.particle_spawn_probability;
		if (typeof data6 == 'number' && isFinite(data6)) {
			if (data6 > 1 || isNaN(data6)) {
				const err19 = {
					instancePath: instancePath + '/particle_spawn_probability',
					schemaPath: '#/properties/particle_spawn_probability/maximum',
					keyword: 'maximum',
					params: { comparison: '<=', limit: 1 },
					message: 'must be <= 1'
				};
				if (vErrors === null) {
					vErrors = [err19];
				} else {
					vErrors.push(err19);
				}
				errors++;
			}
			if (data6 < 0 || isNaN(data6)) {
				const err20 = {
					instancePath: instancePath + '/particle_spawn_probability',
					schemaPath: '#/properties/particle_spawn_probability/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err20];
				} else {
					vErrors.push(err20);
				}
				errors++;
			}
		} else {
			const err21 = {
				instancePath: instancePath + '/particle_spawn_probability',
				schemaPath: '#/properties/particle_spawn_probability/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err21];
			} else {
				vErrors.push(err21);
			}
			errors++;
		}
		let data7 = data.particle_spawn_tests;
		if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7) && isFinite(data7))) {
			const err22 = {
				instancePath: instancePath + '/particle_spawn_tests',
				schemaPath: '#/properties/particle_spawn_tests/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
		if (typeof data7 == 'number' && isFinite(data7)) {
			if (data7 < 1 || isNaN(data7)) {
				const err23 = {
					instancePath: instancePath + '/particle_spawn_tests',
					schemaPath: '#/properties/particle_spawn_tests/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err23];
				} else {
					vErrors.push(err23);
				}
				errors++;
			}
		}
	} else {
		const err24 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err24];
		} else {
			vErrors.push(err24);
		}
		errors++;
	}
	validate26.errors = vErrors;
	return errors === 0;
}
function validate24(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('particle_flow' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'particle_flow' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (!validate26(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate26.errors : vErrors.concat(validate26.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err4 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
	} else {
		const err5 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err5];
		} else {
			vErrors.push(err5);
		}
		errors++;
	}
	validate24.errors = vErrors;
	return errors === 0;
}
const schema31 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'text' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_text_props' },
		{ $ref: '#/definitions/supports_color' }
	]
};
const schema32 = {
	type: 'object',
	properties: {
		text_type: { enum: ['any', 'time'], default: 'any' },
		text_content: { type: 'string', default: 'text' },
		font_size: { type: 'integer', minimum: 1, default: 18 },
		text_decoration: {
			type: 'object',
			properties: {
				italic: { type: 'boolean', default: false },
				bold: { type: 'boolean', default: false },
				underline: { type: 'boolean', default: false },
				overline: { type: 'boolean', default: false },
				line_through: { type: 'boolean', default: false }
			},
			default: {
				italic: false,
				bold: false,
				underline: false,
				overline: false,
				line_through: false
			},
			required: ['italic', 'bold', 'underline', 'overline', 'line_through']
		},
		text_align: {
			type: 'object',
			properties: { horizontal: { enum: ['left', 'center', 'right'], default: 'left' } },
			default: { horizontal: 'left' },
			required: ['horizontal']
		},
		text_shadows: {
			description: 'list of box-shadows',
			type: 'array',
			items: { $ref: '#/definitions/shadow' },
			default: []
		}
	},
	required: [
		'text_type',
		'text_content',
		'font_size',
		'text_decoration',
		'text_align',
		'text_shadows'
	]
};
function validate31(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.text_type === undefined) {
			data.text_type = 'any';
		}
		if (data.text_content === undefined) {
			data.text_content = 'text';
		}
		if (data.font_size === undefined) {
			data.font_size = 18;
		}
		if (data.text_decoration === undefined) {
			data.text_decoration = {
				italic: false,
				bold: false,
				underline: false,
				overline: false,
				line_through: false
			};
		}
		if (data.text_align === undefined) {
			data.text_align = { horizontal: 'left' };
		}
		if (data.text_shadows === undefined) {
			data.text_shadows = [];
		}
		if (data.text_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'text_type' },
				message: "must have required property '" + 'text_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.text_content === undefined) {
			const err1 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'text_content' },
				message: "must have required property '" + 'text_content' + "'"
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.font_size === undefined) {
			const err2 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'font_size' },
				message: "must have required property '" + 'font_size' + "'"
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.text_decoration === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'text_decoration' },
				message: "must have required property '" + 'text_decoration' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.text_align === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'text_align' },
				message: "must have required property '" + 'text_align' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.text_shadows === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'text_shadows' },
				message: "must have required property '" + 'text_shadows' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		let data0 = data.text_type;
		if (!(data0 === 'any' || data0 === 'time')) {
			const err6 = {
				instancePath: instancePath + '/text_type',
				schemaPath: '#/properties/text_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema32.properties.text_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		if (typeof data.text_content !== 'string') {
			const err7 = {
				instancePath: instancePath + '/text_content',
				schemaPath: '#/properties/text_content/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		let data2 = data.font_size;
		if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
			const err8 = {
				instancePath: instancePath + '/font_size',
				schemaPath: '#/properties/font_size/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err8];
			} else {
				vErrors.push(err8);
			}
			errors++;
		}
		if (typeof data2 == 'number' && isFinite(data2)) {
			if (data2 < 1 || isNaN(data2)) {
				const err9 = {
					instancePath: instancePath + '/font_size',
					schemaPath: '#/properties/font_size/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
		}
		let data3 = data.text_decoration;
		if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
			if (data3.italic === undefined) {
				data3.italic = false;
			}
			if (data3.bold === undefined) {
				data3.bold = false;
			}
			if (data3.underline === undefined) {
				data3.underline = false;
			}
			if (data3.overline === undefined) {
				data3.overline = false;
			}
			if (data3.line_through === undefined) {
				data3.line_through = false;
			}
			if (data3.italic === undefined) {
				const err10 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'italic' },
					message: "must have required property '" + 'italic' + "'"
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			if (data3.bold === undefined) {
				const err11 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'bold' },
					message: "must have required property '" + 'bold' + "'"
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			if (data3.underline === undefined) {
				const err12 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'underline' },
					message: "must have required property '" + 'underline' + "'"
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			if (data3.overline === undefined) {
				const err13 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'overline' },
					message: "must have required property '" + 'overline' + "'"
				};
				if (vErrors === null) {
					vErrors = [err13];
				} else {
					vErrors.push(err13);
				}
				errors++;
			}
			if (data3.line_through === undefined) {
				const err14 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'line_through' },
					message: "must have required property '" + 'line_through' + "'"
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
			if (typeof data3.italic !== 'boolean') {
				const err15 = {
					instancePath: instancePath + '/text_decoration/italic',
					schemaPath: '#/properties/text_decoration/properties/italic/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
			if (typeof data3.bold !== 'boolean') {
				const err16 = {
					instancePath: instancePath + '/text_decoration/bold',
					schemaPath: '#/properties/text_decoration/properties/bold/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
			if (typeof data3.underline !== 'boolean') {
				const err17 = {
					instancePath: instancePath + '/text_decoration/underline',
					schemaPath: '#/properties/text_decoration/properties/underline/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err17];
				} else {
					vErrors.push(err17);
				}
				errors++;
			}
			if (typeof data3.overline !== 'boolean') {
				const err18 = {
					instancePath: instancePath + '/text_decoration/overline',
					schemaPath: '#/properties/text_decoration/properties/overline/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err18];
				} else {
					vErrors.push(err18);
				}
				errors++;
			}
			if (typeof data3.line_through !== 'boolean') {
				const err19 = {
					instancePath: instancePath + '/text_decoration/line_through',
					schemaPath: '#/properties/text_decoration/properties/line_through/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err19];
				} else {
					vErrors.push(err19);
				}
				errors++;
			}
		} else {
			const err20 = {
				instancePath: instancePath + '/text_decoration',
				schemaPath: '#/properties/text_decoration/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err20];
			} else {
				vErrors.push(err20);
			}
			errors++;
		}
		let data9 = data.text_align;
		if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
			if (data9.horizontal === undefined) {
				data9.horizontal = 'left';
			}
			if (data9.horizontal === undefined) {
				const err21 = {
					instancePath: instancePath + '/text_align',
					schemaPath: '#/properties/text_align/required',
					keyword: 'required',
					params: { missingProperty: 'horizontal' },
					message: "must have required property '" + 'horizontal' + "'"
				};
				if (vErrors === null) {
					vErrors = [err21];
				} else {
					vErrors.push(err21);
				}
				errors++;
			}
			let data10 = data9.horizontal;
			if (!(data10 === 'left' || data10 === 'center' || data10 === 'right')) {
				const err22 = {
					instancePath: instancePath + '/text_align/horizontal',
					schemaPath: '#/properties/text_align/properties/horizontal/enum',
					keyword: 'enum',
					params: { allowedValues: schema32.properties.text_align.properties.horizontal.enum },
					message: 'must be equal to one of the allowed values'
				};
				if (vErrors === null) {
					vErrors = [err22];
				} else {
					vErrors.push(err22);
				}
				errors++;
			}
		} else {
			const err23 = {
				instancePath: instancePath + '/text_align',
				schemaPath: '#/properties/text_align/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err23];
			} else {
				vErrors.push(err23);
			}
			errors++;
		}
		let data11 = data.text_shadows;
		if (Array.isArray(data11)) {
			const len0 = data11.length;
			for (let i0 = 0; i0 < len0; i0++) {
				if (
					!validate16(data11[i0], {
						instancePath: instancePath + '/text_shadows/' + i0,
						parentData: data11,
						parentDataProperty: i0,
						rootData
					})
				) {
					vErrors = vErrors === null ? validate16.errors : vErrors.concat(validate16.errors);
					errors = vErrors.length;
				}
			}
		} else {
			const err24 = {
				instancePath: instancePath + '/text_shadows',
				schemaPath: '#/properties/text_shadows/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err24];
			} else {
				vErrors.push(err24);
			}
			errors++;
		}
	} else {
		const err25 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err25];
		} else {
			vErrors.push(err25);
		}
		errors++;
	}
	validate31.errors = vErrors;
	return errors === 0;
}
function validate29(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('text' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'text' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (!validate31(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err4 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
	} else {
		const err5 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err5];
		} else {
			vErrors.push(err5);
		}
		errors++;
	}
	validate29.errors = vErrors;
	return errors === 0;
}
const schema34 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'timer_straight_bar' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_color' },
		{ $ref: '#/definitions/supports_border_thickness' },
		{ $ref: '#/definitions/supports_border_radius' },
		{ $ref: '#/definitions/supports_box_shadows' },
		{ $ref: '#/definitions/supports_timer_inner_spacing' }
	]
};
const schema36 = {
	type: 'object',
	properties: { border_thickness: { type: 'integer', minimum: 0, default: 1 } },
	required: ['border_thickness']
};
const schema38 = {
	type: 'object',
	properties: { timer_inner_spacing: { type: 'integer', minimum: 0, default: 1 } },
	required: ['timer_inner_spacing']
};
function validate35(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('timer_straight_bar' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'timer_straight_bar' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err4 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
	} else {
		const err5 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err5];
		} else {
			vErrors.push(err5);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_thickness === undefined) {
			data.border_thickness = 1;
		}
		if (data.border_thickness === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_thickness/required',
				keyword: 'required',
				params: { missingProperty: 'border_thickness' },
				message: "must have required property '" + 'border_thickness' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		let data2 = data.border_thickness;
		if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
			const err7 = {
				instancePath: instancePath + '/border_thickness',
				schemaPath: '#/definitions/supports_border_thickness/properties/border_thickness/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (typeof data2 == 'number' && isFinite(data2)) {
			if (data2 < 0 || isNaN(data2)) {
				const err8 = {
					instancePath: instancePath + '/border_thickness',
					schemaPath: '#/definitions/supports_border_thickness/properties/border_thickness/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
	} else {
		const err9 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_thickness/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err9];
		} else {
			vErrors.push(err9);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_radius === undefined) {
			data.border_radius = [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			];
		}
		if (data.border_radius === undefined) {
			const err10 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_radius/required',
				keyword: 'required',
				params: { missingProperty: 'border_radius' },
				message: "must have required property '" + 'border_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err10];
			} else {
				vErrors.push(err10);
			}
			errors++;
		}
		let data3 = data.border_radius;
		if (Array.isArray(data3)) {
			if (data3.length > 8) {
				const err11 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/maxItems',
					keyword: 'maxItems',
					params: { limit: 8 },
					message: 'must NOT have more than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			if (data3.length < 8) {
				const err12 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/minItems',
					keyword: 'minItems',
					params: { limit: 8 },
					message: 'must NOT have fewer than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			const len0 = data3.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data4 = data3[i0];
				if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
					if (data4.value === undefined) {
						data4.value = 0;
					}
					if (data4.unit === undefined) {
						data4.unit = 'px';
					}
					if (data4.value === undefined) {
						const err13 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'value' },
							message: "must have required property '" + 'value' + "'"
						};
						if (vErrors === null) {
							vErrors = [err13];
						} else {
							vErrors.push(err13);
						}
						errors++;
					}
					if (data4.unit === undefined) {
						const err14 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'unit' },
							message: "must have required property '" + 'unit' + "'"
						};
						if (vErrors === null) {
							vErrors = [err14];
						} else {
							vErrors.push(err14);
						}
						errors++;
					}
					let data5 = data4.value;
					if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
						const err15 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/value',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/type',
							keyword: 'type',
							params: { type: 'integer' },
							message: 'must be integer'
						};
						if (vErrors === null) {
							vErrors = [err15];
						} else {
							vErrors.push(err15);
						}
						errors++;
					}
					if (typeof data5 == 'number' && isFinite(data5)) {
						if (data5 < 0 || isNaN(data5)) {
							const err16 = {
								instancePath: instancePath + '/border_radius/' + i0 + '/value',
								schemaPath:
									'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/minimum',
								keyword: 'minimum',
								params: { comparison: '>=', limit: 0 },
								message: 'must be >= 0'
							};
							if (vErrors === null) {
								vErrors = [err16];
							} else {
								vErrors.push(err16);
							}
							errors++;
						}
					}
					let data6 = data4.unit;
					if (typeof data6 !== 'string') {
						const err17 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/type',
							keyword: 'type',
							params: { type: 'string' },
							message: 'must be string'
						};
						if (vErrors === null) {
							vErrors = [err17];
						} else {
							vErrors.push(err17);
						}
						errors++;
					}
					if (!(data6 === 'px' || data6 === 'percent')) {
						const err18 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema16.properties.border_radius.items.properties.unit.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err18];
						} else {
							vErrors.push(err18);
						}
						errors++;
					}
				} else {
					const err19 = {
						instancePath: instancePath + '/border_radius/' + i0,
						schemaPath: '#/definitions/supports_border_radius/properties/border_radius/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err19];
					} else {
						vErrors.push(err19);
					}
					errors++;
				}
			}
		} else {
			const err20 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err20];
			} else {
				vErrors.push(err20);
			}
			errors++;
		}
	} else {
		const err21 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err21];
		} else {
			vErrors.push(err21);
		}
		errors++;
	}
	if (!validate15(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.timer_inner_spacing === undefined) {
			data.timer_inner_spacing = 1;
		}
		if (data.timer_inner_spacing === undefined) {
			const err22 = {
				instancePath,
				schemaPath: '#/definitions/supports_timer_inner_spacing/required',
				keyword: 'required',
				params: { missingProperty: 'timer_inner_spacing' },
				message: "must have required property '" + 'timer_inner_spacing' + "'"
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
		let data7 = data.timer_inner_spacing;
		if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7) && isFinite(data7))) {
			const err23 = {
				instancePath: instancePath + '/timer_inner_spacing',
				schemaPath:
					'#/definitions/supports_timer_inner_spacing/properties/timer_inner_spacing/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err23];
			} else {
				vErrors.push(err23);
			}
			errors++;
		}
		if (typeof data7 == 'number' && isFinite(data7)) {
			if (data7 < 0 || isNaN(data7)) {
				const err24 = {
					instancePath: instancePath + '/timer_inner_spacing',
					schemaPath:
						'#/definitions/supports_timer_inner_spacing/properties/timer_inner_spacing/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err24];
				} else {
					vErrors.push(err24);
				}
				errors++;
			}
		}
	} else {
		const err25 = {
			instancePath,
			schemaPath: '#/definitions/supports_timer_inner_spacing/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err25];
		} else {
			vErrors.push(err25);
		}
		errors++;
	}
	validate35.errors = vErrors;
	return errors === 0;
}
const schema39 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'timer_straight_line_point' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_color' },
		{ $ref: '#/definitions/supports_border_thickness' },
		{ $ref: '#/definitions/supports_border_radius' },
		{ $ref: '#/definitions/supports_box_shadows' }
	]
};
function validate39(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('timer_straight_line_point' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'timer_straight_line_point' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err4 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
	} else {
		const err5 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err5];
		} else {
			vErrors.push(err5);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_thickness === undefined) {
			data.border_thickness = 1;
		}
		if (data.border_thickness === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_thickness/required',
				keyword: 'required',
				params: { missingProperty: 'border_thickness' },
				message: "must have required property '" + 'border_thickness' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		let data2 = data.border_thickness;
		if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
			const err7 = {
				instancePath: instancePath + '/border_thickness',
				schemaPath: '#/definitions/supports_border_thickness/properties/border_thickness/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (typeof data2 == 'number' && isFinite(data2)) {
			if (data2 < 0 || isNaN(data2)) {
				const err8 = {
					instancePath: instancePath + '/border_thickness',
					schemaPath: '#/definitions/supports_border_thickness/properties/border_thickness/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
	} else {
		const err9 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_thickness/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err9];
		} else {
			vErrors.push(err9);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_radius === undefined) {
			data.border_radius = [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			];
		}
		if (data.border_radius === undefined) {
			const err10 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_radius/required',
				keyword: 'required',
				params: { missingProperty: 'border_radius' },
				message: "must have required property '" + 'border_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err10];
			} else {
				vErrors.push(err10);
			}
			errors++;
		}
		let data3 = data.border_radius;
		if (Array.isArray(data3)) {
			if (data3.length > 8) {
				const err11 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/maxItems',
					keyword: 'maxItems',
					params: { limit: 8 },
					message: 'must NOT have more than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			if (data3.length < 8) {
				const err12 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/minItems',
					keyword: 'minItems',
					params: { limit: 8 },
					message: 'must NOT have fewer than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			const len0 = data3.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data4 = data3[i0];
				if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
					if (data4.value === undefined) {
						data4.value = 0;
					}
					if (data4.unit === undefined) {
						data4.unit = 'px';
					}
					if (data4.value === undefined) {
						const err13 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'value' },
							message: "must have required property '" + 'value' + "'"
						};
						if (vErrors === null) {
							vErrors = [err13];
						} else {
							vErrors.push(err13);
						}
						errors++;
					}
					if (data4.unit === undefined) {
						const err14 = {
							instancePath: instancePath + '/border_radius/' + i0,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'unit' },
							message: "must have required property '" + 'unit' + "'"
						};
						if (vErrors === null) {
							vErrors = [err14];
						} else {
							vErrors.push(err14);
						}
						errors++;
					}
					let data5 = data4.value;
					if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
						const err15 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/value',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/type',
							keyword: 'type',
							params: { type: 'integer' },
							message: 'must be integer'
						};
						if (vErrors === null) {
							vErrors = [err15];
						} else {
							vErrors.push(err15);
						}
						errors++;
					}
					if (typeof data5 == 'number' && isFinite(data5)) {
						if (data5 < 0 || isNaN(data5)) {
							const err16 = {
								instancePath: instancePath + '/border_radius/' + i0 + '/value',
								schemaPath:
									'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/minimum',
								keyword: 'minimum',
								params: { comparison: '>=', limit: 0 },
								message: 'must be >= 0'
							};
							if (vErrors === null) {
								vErrors = [err16];
							} else {
								vErrors.push(err16);
							}
							errors++;
						}
					}
					let data6 = data4.unit;
					if (typeof data6 !== 'string') {
						const err17 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/type',
							keyword: 'type',
							params: { type: 'string' },
							message: 'must be string'
						};
						if (vErrors === null) {
							vErrors = [err17];
						} else {
							vErrors.push(err17);
						}
						errors++;
					}
					if (!(data6 === 'px' || data6 === 'percent')) {
						const err18 = {
							instancePath: instancePath + '/border_radius/' + i0 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema16.properties.border_radius.items.properties.unit.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err18];
						} else {
							vErrors.push(err18);
						}
						errors++;
					}
				} else {
					const err19 = {
						instancePath: instancePath + '/border_radius/' + i0,
						schemaPath: '#/definitions/supports_border_radius/properties/border_radius/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err19];
					} else {
						vErrors.push(err19);
					}
					errors++;
				}
			}
		} else {
			const err20 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err20];
			} else {
				vErrors.push(err20);
			}
			errors++;
		}
	} else {
		const err21 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err21];
		} else {
			vErrors.push(err21);
		}
		errors++;
	}
	if (!validate15(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
		errors = vErrors.length;
	}
	validate39.errors = vErrors;
	return errors === 0;
}
const schema43 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'visualizer_straight_bar' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_visualizer_props' },
		{ $ref: '#/definitions/supports_visualizer_bar_props' },
		{ $ref: '#/definitions/supports_color' },
		{ $ref: '#/definitions/supports_border_radius' },
		{ $ref: '#/definitions/supports_box_shadows' }
	]
};
const schema44 = {
	type: 'object',
	properties: {
		visualizer_points_count: { type: 'integer', minimum: 1, default: 100 },
		visualizer_analyzer_range: {
			description:
				'Drawn range for the visualizer. 0 maps to 20Hz and 1023 maps to 20000Hz. The scale is logarithmic.',
			type: 'array',
			items: { type: 'integer', minimum: 0 },
			minItems: 2,
			maxItems: 2,
			default: [0, 1023]
		},
		visualization_smoothing_type: {
			description: 'Interpolation type of the frequency array between frames.',
			enum: ['proportional_decrease', 'linear_decrease', 'average'],
			default: 'proportional_decrease'
		},
		visualization_smoothing_factor: {
			description:
				'Parameter for the visualization smoothing type. Its behaviour differs depending of the mode.',
			type: 'number',
			minimum: 0,
			default: 0.8
		}
	},
	required: [
		'visualizer_points_count',
		'visualizer_analyzer_range',
		'visualization_smoothing_type',
		'visualization_smoothing_factor'
	]
};
const schema45 = {
	type: 'object',
	properties: { visualizer_bar_thickness: { type: 'integer', minimum: 0, default: 2 } },
	required: ['visualizer_bar_thickness']
};
function validate43(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('visualizer_straight_bar' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'visualizer_straight_bar' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_points_count === undefined) {
			data.visualizer_points_count = 100;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0.8;
		}
		if (data.visualizer_points_count === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_points_count' },
				message: "must have required property '" + 'visualizer_points_count' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.visualizer_analyzer_range === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_analyzer_range' },
				message: "must have required property '" + 'visualizer_analyzer_range' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.visualization_smoothing_type === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_type' },
				message: "must have required property '" + 'visualization_smoothing_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.visualization_smoothing_factor === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_factor' },
				message: "must have required property '" + 'visualization_smoothing_factor' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		let data1 = data.visualizer_points_count;
		if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
			const err7 = {
				instancePath: instancePath + '/visualizer_points_count',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_points_count/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (typeof data1 == 'number' && isFinite(data1)) {
			if (data1 < 1 || isNaN(data1)) {
				const err8 = {
					instancePath: instancePath + '/visualizer_points_count',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_points_count/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		let data2 = data.visualizer_analyzer_range;
		if (Array.isArray(data2)) {
			if (data2.length > 2) {
				const err9 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/maxItems',
					keyword: 'maxItems',
					params: { limit: 2 },
					message: 'must NOT have more than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
			if (data2.length < 2) {
				const err10 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			const len0 = data2.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data3 = data2[i0];
				if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
					const err11 = {
						instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
						schemaPath:
							'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/type',
						keyword: 'type',
						params: { type: 'integer' },
						message: 'must be integer'
					};
					if (vErrors === null) {
						vErrors = [err11];
					} else {
						vErrors.push(err11);
					}
					errors++;
				}
				if (typeof data3 == 'number' && isFinite(data3)) {
					if (data3 < 0 || isNaN(data3)) {
						const err12 = {
							instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
							schemaPath:
								'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/minimum',
							keyword: 'minimum',
							params: { comparison: '>=', limit: 0 },
							message: 'must be >= 0'
						};
						if (vErrors === null) {
							vErrors = [err12];
						} else {
							vErrors.push(err12);
						}
						errors++;
					}
				}
			}
		} else {
			const err13 = {
				instancePath: instancePath + '/visualizer_analyzer_range',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		let data4 = data.visualization_smoothing_type;
		if (
			!(data4 === 'proportional_decrease' || data4 === 'linear_decrease' || data4 === 'average')
		) {
			const err14 = {
				instancePath: instancePath + '/visualization_smoothing_type',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema44.properties.visualization_smoothing_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err14];
			} else {
				vErrors.push(err14);
			}
			errors++;
		}
		let data5 = data.visualization_smoothing_factor;
		if (typeof data5 == 'number' && isFinite(data5)) {
			if (data5 < 0 || isNaN(data5)) {
				const err15 = {
					instancePath: instancePath + '/visualization_smoothing_factor',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
		} else {
			const err16 = {
				instancePath: instancePath + '/visualization_smoothing_factor',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err16];
			} else {
				vErrors.push(err16);
			}
			errors++;
		}
	} else {
		const err17 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err17];
		} else {
			vErrors.push(err17);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_bar_thickness === undefined) {
			data.visualizer_bar_thickness = 2;
		}
		if (data.visualizer_bar_thickness === undefined) {
			const err18 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_bar_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_bar_thickness' },
				message: "must have required property '" + 'visualizer_bar_thickness' + "'"
			};
			if (vErrors === null) {
				vErrors = [err18];
			} else {
				vErrors.push(err18);
			}
			errors++;
		}
		let data6 = data.visualizer_bar_thickness;
		if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
			const err19 = {
				instancePath: instancePath + '/visualizer_bar_thickness',
				schemaPath:
					'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err19];
			} else {
				vErrors.push(err19);
			}
			errors++;
		}
		if (typeof data6 == 'number' && isFinite(data6)) {
			if (data6 < 0 || isNaN(data6)) {
				const err20 = {
					instancePath: instancePath + '/visualizer_bar_thickness',
					schemaPath:
						'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err20];
				} else {
					vErrors.push(err20);
				}
				errors++;
			}
		}
	} else {
		const err21 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_bar_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err21];
		} else {
			vErrors.push(err21);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err22 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err23 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err23];
			} else {
				vErrors.push(err23);
			}
			errors++;
		}
	} else {
		const err24 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err24];
		} else {
			vErrors.push(err24);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_radius === undefined) {
			data.border_radius = [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			];
		}
		if (data.border_radius === undefined) {
			const err25 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_radius/required',
				keyword: 'required',
				params: { missingProperty: 'border_radius' },
				message: "must have required property '" + 'border_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err25];
			} else {
				vErrors.push(err25);
			}
			errors++;
		}
		let data8 = data.border_radius;
		if (Array.isArray(data8)) {
			if (data8.length > 8) {
				const err26 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/maxItems',
					keyword: 'maxItems',
					params: { limit: 8 },
					message: 'must NOT have more than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err26];
				} else {
					vErrors.push(err26);
				}
				errors++;
			}
			if (data8.length < 8) {
				const err27 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/minItems',
					keyword: 'minItems',
					params: { limit: 8 },
					message: 'must NOT have fewer than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err27];
				} else {
					vErrors.push(err27);
				}
				errors++;
			}
			const len1 = data8.length;
			for (let i1 = 0; i1 < len1; i1++) {
				let data9 = data8[i1];
				if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
					if (data9.value === undefined) {
						data9.value = 0;
					}
					if (data9.unit === undefined) {
						data9.unit = 'px';
					}
					if (data9.value === undefined) {
						const err28 = {
							instancePath: instancePath + '/border_radius/' + i1,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'value' },
							message: "must have required property '" + 'value' + "'"
						};
						if (vErrors === null) {
							vErrors = [err28];
						} else {
							vErrors.push(err28);
						}
						errors++;
					}
					if (data9.unit === undefined) {
						const err29 = {
							instancePath: instancePath + '/border_radius/' + i1,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'unit' },
							message: "must have required property '" + 'unit' + "'"
						};
						if (vErrors === null) {
							vErrors = [err29];
						} else {
							vErrors.push(err29);
						}
						errors++;
					}
					let data10 = data9.value;
					if (!(typeof data10 == 'number' && !(data10 % 1) && !isNaN(data10) && isFinite(data10))) {
						const err30 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/value',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/type',
							keyword: 'type',
							params: { type: 'integer' },
							message: 'must be integer'
						};
						if (vErrors === null) {
							vErrors = [err30];
						} else {
							vErrors.push(err30);
						}
						errors++;
					}
					if (typeof data10 == 'number' && isFinite(data10)) {
						if (data10 < 0 || isNaN(data10)) {
							const err31 = {
								instancePath: instancePath + '/border_radius/' + i1 + '/value',
								schemaPath:
									'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/minimum',
								keyword: 'minimum',
								params: { comparison: '>=', limit: 0 },
								message: 'must be >= 0'
							};
							if (vErrors === null) {
								vErrors = [err31];
							} else {
								vErrors.push(err31);
							}
							errors++;
						}
					}
					let data11 = data9.unit;
					if (typeof data11 !== 'string') {
						const err32 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/type',
							keyword: 'type',
							params: { type: 'string' },
							message: 'must be string'
						};
						if (vErrors === null) {
							vErrors = [err32];
						} else {
							vErrors.push(err32);
						}
						errors++;
					}
					if (!(data11 === 'px' || data11 === 'percent')) {
						const err33 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema16.properties.border_radius.items.properties.unit.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err33];
						} else {
							vErrors.push(err33);
						}
						errors++;
					}
				} else {
					const err34 = {
						instancePath: instancePath + '/border_radius/' + i1,
						schemaPath: '#/definitions/supports_border_radius/properties/border_radius/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err34];
					} else {
						vErrors.push(err34);
					}
					errors++;
				}
			}
		} else {
			const err35 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err35];
			} else {
				vErrors.push(err35);
			}
			errors++;
		}
	} else {
		const err36 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err36];
		} else {
			vErrors.push(err36);
		}
		errors++;
	}
	if (!validate15(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
		errors = vErrors.length;
	}
	validate43.errors = vErrors;
	return errors === 0;
}
const schema48 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'visualizer_straight_wave' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_visualizer_props' },
		{ $ref: '#/definitions/supports_color' }
	]
};
function validate47(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('visualizer_straight_wave' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'visualizer_straight_wave' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_points_count === undefined) {
			data.visualizer_points_count = 100;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0.8;
		}
		if (data.visualizer_points_count === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_points_count' },
				message: "must have required property '" + 'visualizer_points_count' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.visualizer_analyzer_range === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_analyzer_range' },
				message: "must have required property '" + 'visualizer_analyzer_range' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.visualization_smoothing_type === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_type' },
				message: "must have required property '" + 'visualization_smoothing_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.visualization_smoothing_factor === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_factor' },
				message: "must have required property '" + 'visualization_smoothing_factor' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		let data1 = data.visualizer_points_count;
		if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
			const err7 = {
				instancePath: instancePath + '/visualizer_points_count',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_points_count/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (typeof data1 == 'number' && isFinite(data1)) {
			if (data1 < 1 || isNaN(data1)) {
				const err8 = {
					instancePath: instancePath + '/visualizer_points_count',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_points_count/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		let data2 = data.visualizer_analyzer_range;
		if (Array.isArray(data2)) {
			if (data2.length > 2) {
				const err9 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/maxItems',
					keyword: 'maxItems',
					params: { limit: 2 },
					message: 'must NOT have more than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
			if (data2.length < 2) {
				const err10 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			const len0 = data2.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data3 = data2[i0];
				if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
					const err11 = {
						instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
						schemaPath:
							'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/type',
						keyword: 'type',
						params: { type: 'integer' },
						message: 'must be integer'
					};
					if (vErrors === null) {
						vErrors = [err11];
					} else {
						vErrors.push(err11);
					}
					errors++;
				}
				if (typeof data3 == 'number' && isFinite(data3)) {
					if (data3 < 0 || isNaN(data3)) {
						const err12 = {
							instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
							schemaPath:
								'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/minimum',
							keyword: 'minimum',
							params: { comparison: '>=', limit: 0 },
							message: 'must be >= 0'
						};
						if (vErrors === null) {
							vErrors = [err12];
						} else {
							vErrors.push(err12);
						}
						errors++;
					}
				}
			}
		} else {
			const err13 = {
				instancePath: instancePath + '/visualizer_analyzer_range',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		let data4 = data.visualization_smoothing_type;
		if (
			!(data4 === 'proportional_decrease' || data4 === 'linear_decrease' || data4 === 'average')
		) {
			const err14 = {
				instancePath: instancePath + '/visualization_smoothing_type',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema44.properties.visualization_smoothing_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err14];
			} else {
				vErrors.push(err14);
			}
			errors++;
		}
		let data5 = data.visualization_smoothing_factor;
		if (typeof data5 == 'number' && isFinite(data5)) {
			if (data5 < 0 || isNaN(data5)) {
				const err15 = {
					instancePath: instancePath + '/visualization_smoothing_factor',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
		} else {
			const err16 = {
				instancePath: instancePath + '/visualization_smoothing_factor',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err16];
			} else {
				vErrors.push(err16);
			}
			errors++;
		}
	} else {
		const err17 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err17];
		} else {
			vErrors.push(err17);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err18 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err18];
			} else {
				vErrors.push(err18);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err19 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err19];
			} else {
				vErrors.push(err19);
			}
			errors++;
		}
	} else {
		const err20 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err20];
		} else {
			vErrors.push(err20);
		}
		errors++;
	}
	validate47.errors = vErrors;
	return errors === 0;
}
const schema51 = {
	allOf: [
		{
			type: 'object',
			properties: { visual_object_type: { const: 'visualizer_circular_bar' } },
			required: ['visual_object_type']
		},
		{ $ref: '#/definitions/visual_object_interface' },
		{ $ref: '#/definitions/supports_visualizer_props' },
		{ $ref: '#/definitions/supports_color' },
		{ $ref: '#/definitions/supports_border_radius' },
		{ $ref: '#/definitions/supports_box_shadows' },
		{ $ref: '#/definitions/supports_visualizer_bar_props' },
		{ $ref: '#/definitions/supports_visualizer_circular_props' }
	]
};
const schema56 = {
	type: 'object',
	properties: { visualizer_radius: { type: 'integer', minimum: 0, default: 50 } },
	required: ['visualizer_radius']
};
function validate50(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visual_object_type === undefined) {
			const err0 = {
				instancePath,
				schemaPath: '#/allOf/0/required',
				keyword: 'required',
				params: { missingProperty: 'visual_object_type' },
				message: "must have required property '" + 'visual_object_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.visual_object_type !== undefined) {
			if ('visualizer_circular_bar' !== data.visual_object_type) {
				const err1 = {
					instancePath: instancePath + '/visual_object_type',
					schemaPath: '#/allOf/0/properties/visual_object_type/const',
					keyword: 'const',
					params: { allowedValue: 'visualizer_circular_bar' },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err1];
				} else {
					vErrors.push(err1);
				}
				errors++;
			}
		}
	} else {
		const err2 = {
			instancePath,
			schemaPath: '#/allOf/0/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err2];
		} else {
			vErrors.push(err2);
		}
		errors++;
	}
	if (!validate13(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_points_count === undefined) {
			data.visualizer_points_count = 100;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0.8;
		}
		if (data.visualizer_points_count === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_points_count' },
				message: "must have required property '" + 'visualizer_points_count' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.visualizer_analyzer_range === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_analyzer_range' },
				message: "must have required property '" + 'visualizer_analyzer_range' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.visualization_smoothing_type === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_type' },
				message: "must have required property '" + 'visualization_smoothing_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.visualization_smoothing_factor === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualization_smoothing_factor' },
				message: "must have required property '" + 'visualization_smoothing_factor' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		let data1 = data.visualizer_points_count;
		if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
			const err7 = {
				instancePath: instancePath + '/visualizer_points_count',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_points_count/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (typeof data1 == 'number' && isFinite(data1)) {
			if (data1 < 1 || isNaN(data1)) {
				const err8 = {
					instancePath: instancePath + '/visualizer_points_count',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_points_count/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		let data2 = data.visualizer_analyzer_range;
		if (Array.isArray(data2)) {
			if (data2.length > 2) {
				const err9 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/maxItems',
					keyword: 'maxItems',
					params: { limit: 2 },
					message: 'must NOT have more than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err9];
				} else {
					vErrors.push(err9);
				}
				errors++;
			}
			if (data2.length < 2) {
				const err10 = {
					instancePath: instancePath + '/visualizer_analyzer_range',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/minItems',
					keyword: 'minItems',
					params: { limit: 2 },
					message: 'must NOT have fewer than 2 items'
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			const len0 = data2.length;
			for (let i0 = 0; i0 < len0; i0++) {
				let data3 = data2[i0];
				if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
					const err11 = {
						instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
						schemaPath:
							'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/type',
						keyword: 'type',
						params: { type: 'integer' },
						message: 'must be integer'
					};
					if (vErrors === null) {
						vErrors = [err11];
					} else {
						vErrors.push(err11);
					}
					errors++;
				}
				if (typeof data3 == 'number' && isFinite(data3)) {
					if (data3 < 0 || isNaN(data3)) {
						const err12 = {
							instancePath: instancePath + '/visualizer_analyzer_range/' + i0,
							schemaPath:
								'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/items/minimum',
							keyword: 'minimum',
							params: { comparison: '>=', limit: 0 },
							message: 'must be >= 0'
						};
						if (vErrors === null) {
							vErrors = [err12];
						} else {
							vErrors.push(err12);
						}
						errors++;
					}
				}
			}
		} else {
			const err13 = {
				instancePath: instancePath + '/visualizer_analyzer_range',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualizer_analyzer_range/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		let data4 = data.visualization_smoothing_type;
		if (
			!(data4 === 'proportional_decrease' || data4 === 'linear_decrease' || data4 === 'average')
		) {
			const err14 = {
				instancePath: instancePath + '/visualization_smoothing_type',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema44.properties.visualization_smoothing_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err14];
			} else {
				vErrors.push(err14);
			}
			errors++;
		}
		let data5 = data.visualization_smoothing_factor;
		if (typeof data5 == 'number' && isFinite(data5)) {
			if (data5 < 0 || isNaN(data5)) {
				const err15 = {
					instancePath: instancePath + '/visualization_smoothing_factor',
					schemaPath:
						'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
		} else {
			const err16 = {
				instancePath: instancePath + '/visualization_smoothing_factor',
				schemaPath:
					'#/definitions/supports_visualizer_props/properties/visualization_smoothing_factor/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err16];
			} else {
				vErrors.push(err16);
			}
			errors++;
		}
	} else {
		const err17 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err17];
		} else {
			vErrors.push(err17);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err18 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err18];
			} else {
				vErrors.push(err18);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err19 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err19];
			} else {
				vErrors.push(err19);
			}
			errors++;
		}
	} else {
		const err20 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err20];
		} else {
			vErrors.push(err20);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.border_radius === undefined) {
			data.border_radius = [
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' },
				{ value: 0, unit: 'px' }
			];
		}
		if (data.border_radius === undefined) {
			const err21 = {
				instancePath,
				schemaPath: '#/definitions/supports_border_radius/required',
				keyword: 'required',
				params: { missingProperty: 'border_radius' },
				message: "must have required property '" + 'border_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err21];
			} else {
				vErrors.push(err21);
			}
			errors++;
		}
		let data7 = data.border_radius;
		if (Array.isArray(data7)) {
			if (data7.length > 8) {
				const err22 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/maxItems',
					keyword: 'maxItems',
					params: { limit: 8 },
					message: 'must NOT have more than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err22];
				} else {
					vErrors.push(err22);
				}
				errors++;
			}
			if (data7.length < 8) {
				const err23 = {
					instancePath: instancePath + '/border_radius',
					schemaPath: '#/definitions/supports_border_radius/properties/border_radius/minItems',
					keyword: 'minItems',
					params: { limit: 8 },
					message: 'must NOT have fewer than 8 items'
				};
				if (vErrors === null) {
					vErrors = [err23];
				} else {
					vErrors.push(err23);
				}
				errors++;
			}
			const len1 = data7.length;
			for (let i1 = 0; i1 < len1; i1++) {
				let data8 = data7[i1];
				if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
					if (data8.value === undefined) {
						data8.value = 0;
					}
					if (data8.unit === undefined) {
						data8.unit = 'px';
					}
					if (data8.value === undefined) {
						const err24 = {
							instancePath: instancePath + '/border_radius/' + i1,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'value' },
							message: "must have required property '" + 'value' + "'"
						};
						if (vErrors === null) {
							vErrors = [err24];
						} else {
							vErrors.push(err24);
						}
						errors++;
					}
					if (data8.unit === undefined) {
						const err25 = {
							instancePath: instancePath + '/border_radius/' + i1,
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/required',
							keyword: 'required',
							params: { missingProperty: 'unit' },
							message: "must have required property '" + 'unit' + "'"
						};
						if (vErrors === null) {
							vErrors = [err25];
						} else {
							vErrors.push(err25);
						}
						errors++;
					}
					let data9 = data8.value;
					if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
						const err26 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/value',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/type',
							keyword: 'type',
							params: { type: 'integer' },
							message: 'must be integer'
						};
						if (vErrors === null) {
							vErrors = [err26];
						} else {
							vErrors.push(err26);
						}
						errors++;
					}
					if (typeof data9 == 'number' && isFinite(data9)) {
						if (data9 < 0 || isNaN(data9)) {
							const err27 = {
								instancePath: instancePath + '/border_radius/' + i1 + '/value',
								schemaPath:
									'#/definitions/supports_border_radius/properties/border_radius/items/properties/value/minimum',
								keyword: 'minimum',
								params: { comparison: '>=', limit: 0 },
								message: 'must be >= 0'
							};
							if (vErrors === null) {
								vErrors = [err27];
							} else {
								vErrors.push(err27);
							}
							errors++;
						}
					}
					let data10 = data8.unit;
					if (typeof data10 !== 'string') {
						const err28 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/type',
							keyword: 'type',
							params: { type: 'string' },
							message: 'must be string'
						};
						if (vErrors === null) {
							vErrors = [err28];
						} else {
							vErrors.push(err28);
						}
						errors++;
					}
					if (!(data10 === 'px' || data10 === 'percent')) {
						const err29 = {
							instancePath: instancePath + '/border_radius/' + i1 + '/unit',
							schemaPath:
								'#/definitions/supports_border_radius/properties/border_radius/items/properties/unit/enum',
							keyword: 'enum',
							params: {
								allowedValues: schema16.properties.border_radius.items.properties.unit.enum
							},
							message: 'must be equal to one of the allowed values'
						};
						if (vErrors === null) {
							vErrors = [err29];
						} else {
							vErrors.push(err29);
						}
						errors++;
					}
				} else {
					const err30 = {
						instancePath: instancePath + '/border_radius/' + i1,
						schemaPath: '#/definitions/supports_border_radius/properties/border_radius/items/type',
						keyword: 'type',
						params: { type: 'object' },
						message: 'must be object'
					};
					if (vErrors === null) {
						vErrors = [err30];
					} else {
						vErrors.push(err30);
					}
					errors++;
				}
			}
		} else {
			const err31 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'array' },
				message: 'must be array'
			};
			if (vErrors === null) {
				vErrors = [err31];
			} else {
				vErrors.push(err31);
			}
			errors++;
		}
	} else {
		const err32 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err32];
		} else {
			vErrors.push(err32);
		}
		errors++;
	}
	if (!validate15(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
		errors = vErrors.length;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_bar_thickness === undefined) {
			data.visualizer_bar_thickness = 2;
		}
		if (data.visualizer_bar_thickness === undefined) {
			const err33 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_bar_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_bar_thickness' },
				message: "must have required property '" + 'visualizer_bar_thickness' + "'"
			};
			if (vErrors === null) {
				vErrors = [err33];
			} else {
				vErrors.push(err33);
			}
			errors++;
		}
		let data11 = data.visualizer_bar_thickness;
		if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
			const err34 = {
				instancePath: instancePath + '/visualizer_bar_thickness',
				schemaPath:
					'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err34];
			} else {
				vErrors.push(err34);
			}
			errors++;
		}
		if (typeof data11 == 'number' && isFinite(data11)) {
			if (data11 < 0 || isNaN(data11)) {
				const err35 = {
					instancePath: instancePath + '/visualizer_bar_thickness',
					schemaPath:
						'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err35];
				} else {
					vErrors.push(err35);
				}
				errors++;
			}
		}
	} else {
		const err36 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_bar_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err36];
		} else {
			vErrors.push(err36);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_radius === undefined) {
			data.visualizer_radius = 50;
		}
		if (data.visualizer_radius === undefined) {
			const err37 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_circular_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_radius' },
				message: "must have required property '" + 'visualizer_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err37];
			} else {
				vErrors.push(err37);
			}
			errors++;
		}
		let data12 = data.visualizer_radius;
		if (!(typeof data12 == 'number' && !(data12 % 1) && !isNaN(data12) && isFinite(data12))) {
			const err38 = {
				instancePath: instancePath + '/visualizer_radius',
				schemaPath:
					'#/definitions/supports_visualizer_circular_props/properties/visualizer_radius/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err38];
			} else {
				vErrors.push(err38);
			}
			errors++;
		}
		if (typeof data12 == 'number' && isFinite(data12)) {
			if (data12 < 0 || isNaN(data12)) {
				const err39 = {
					instancePath: instancePath + '/visualizer_radius',
					schemaPath:
						'#/definitions/supports_visualizer_circular_props/properties/visualizer_radius/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err39];
				} else {
					vErrors.push(err39);
				}
				errors++;
			}
		}
	} else {
		const err40 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_circular_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err40];
		} else {
			vErrors.push(err40);
		}
		errors++;
	}
	validate50.errors = vErrors;
	return errors === 0;
}
function validate11(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	const _errs0 = errors;
	let valid0 = false;
	const _errs1 = errors;
	if (!validate12(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate12.errors : vErrors.concat(validate12.errors);
		errors = vErrors.length;
	}
	var _valid0 = _errs1 === errors;
	valid0 = valid0 || _valid0;
	if (!valid0) {
		const _errs2 = errors;
		if (!validate24(data, { instancePath, parentData, parentDataProperty, rootData })) {
			vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
			errors = vErrors.length;
		}
		var _valid0 = _errs2 === errors;
		valid0 = valid0 || _valid0;
		if (!valid0) {
			const _errs3 = errors;
			if (!validate29(data, { instancePath, parentData, parentDataProperty, rootData })) {
				vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
				errors = vErrors.length;
			}
			var _valid0 = _errs3 === errors;
			valid0 = valid0 || _valid0;
			if (!valid0) {
				const _errs4 = errors;
				if (!validate35(data, { instancePath, parentData, parentDataProperty, rootData })) {
					vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
					errors = vErrors.length;
				}
				var _valid0 = _errs4 === errors;
				valid0 = valid0 || _valid0;
				if (!valid0) {
					const _errs5 = errors;
					if (!validate39(data, { instancePath, parentData, parentDataProperty, rootData })) {
						vErrors = vErrors === null ? validate39.errors : vErrors.concat(validate39.errors);
						errors = vErrors.length;
					}
					var _valid0 = _errs5 === errors;
					valid0 = valid0 || _valid0;
					if (!valid0) {
						const _errs6 = errors;
						if (!validate43(data, { instancePath, parentData, parentDataProperty, rootData })) {
							vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
							errors = vErrors.length;
						}
						var _valid0 = _errs6 === errors;
						valid0 = valid0 || _valid0;
						if (!valid0) {
							const _errs7 = errors;
							if (!validate47(data, { instancePath, parentData, parentDataProperty, rootData })) {
								vErrors = vErrors === null ? validate47.errors : vErrors.concat(validate47.errors);
								errors = vErrors.length;
							}
							var _valid0 = _errs7 === errors;
							valid0 = valid0 || _valid0;
							if (!valid0) {
								const _errs8 = errors;
								if (!validate50(data, { instancePath, parentData, parentDataProperty, rootData })) {
									vErrors =
										vErrors === null ? validate50.errors : vErrors.concat(validate50.errors);
									errors = vErrors.length;
								}
								var _valid0 = _errs8 === errors;
								valid0 = valid0 || _valid0;
							}
						}
					}
				}
			}
		}
	}
	if (!valid0) {
		const err0 = {
			instancePath,
			schemaPath: '#/anyOf',
			keyword: 'anyOf',
			params: {},
			message: 'must match a schema in anyOf'
		};
		if (vErrors === null) {
			vErrors = [err0];
		} else {
			vErrors.push(err0);
		}
		errors++;
	} else {
		errors = _errs0;
		if (vErrors !== null) {
			if (_errs0) {
				vErrors.length = _errs0;
			} else {
				vErrors = null;
			}
		}
	}
	validate11.errors = vErrors;
	return errors === 0;
}
function validate10(
	data,
	{ instancePath = '', parentData, parentDataProperty, rootData = data } = {}
) {
	let vErrors = null;
	let errors = 0;
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.screen === undefined) {
			data.screen = { width: 1920, height: 1080 };
		}
		if (data.fps === undefined) {
			data.fps = 60;
		}
		if (data.audio_filename === undefined) {
			data.audio_filename = '';
		}
		if (data.objects === undefined) {
			data.objects = {};
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
		if (data.screen === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'screen' },
				message: "must have required property '" + 'screen' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.fps === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'fps' },
				message: "must have required property '" + 'fps' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.audio_filename === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'audio_filename' },
				message: "must have required property '" + 'audio_filename' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.objects === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/required',
				keyword: 'required',
				params: { missingProperty: 'objects' },
				message: "must have required property '" + 'objects' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		if (data.save_version !== undefined) {
			let data0 = data.save_version;
			if (!(typeof data0 == 'number' && isFinite(data0))) {
				const err7 = {
					instancePath: instancePath + '/save_version',
					schemaPath: '#/properties/save_version/type',
					keyword: 'type',
					params: { type: 'number' },
					message: 'must be number'
				};
				if (vErrors === null) {
					vErrors = [err7];
				} else {
					vErrors.push(err7);
				}
				errors++;
			}
			if (5 !== data0) {
				const err8 = {
					instancePath: instancePath + '/save_version',
					schemaPath: '#/properties/save_version/const',
					keyword: 'const',
					params: { allowedValue: 5 },
					message: 'must be equal to constant'
				};
				if (vErrors === null) {
					vErrors = [err8];
				} else {
					vErrors.push(err8);
				}
				errors++;
			}
		}
		if (data.software_version_used !== undefined) {
			if (typeof data.software_version_used !== 'string') {
				const err9 = {
					instancePath: instancePath + '/software_version_used',
					schemaPath: '#/properties/software_version_used/type',
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
		if (data.software_version_first_created !== undefined) {
			if (typeof data.software_version_first_created !== 'string') {
				const err10 = {
					instancePath: instancePath + '/software_version_first_created',
					schemaPath: '#/properties/software_version_first_created/type',
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
		}
		let data3 = data.screen;
		if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
			if (data3.width === undefined) {
				data3.width = 1920;
			}
			if (data3.height === undefined) {
				data3.height = 1080;
			}
			if (data3.width === undefined) {
				const err11 = {
					instancePath: instancePath + '/screen',
					schemaPath: '#/properties/screen/required',
					keyword: 'required',
					params: { missingProperty: 'width' },
					message: "must have required property '" + 'width' + "'"
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			if (data3.height === undefined) {
				const err12 = {
					instancePath: instancePath + '/screen',
					schemaPath: '#/properties/screen/required',
					keyword: 'required',
					params: { missingProperty: 'height' },
					message: "must have required property '" + 'height' + "'"
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			let data4 = data3.width;
			if (typeof data4 == 'number' && isFinite(data4)) {
				if (data4 < 1 || isNaN(data4)) {
					const err13 = {
						instancePath: instancePath + '/screen/width',
						schemaPath: '#/properties/screen/properties/width/minimum',
						keyword: 'minimum',
						params: { comparison: '>=', limit: 1 },
						message: 'must be >= 1'
					};
					if (vErrors === null) {
						vErrors = [err13];
					} else {
						vErrors.push(err13);
					}
					errors++;
				}
			} else {
				const err14 = {
					instancePath: instancePath + '/screen/width',
					schemaPath: '#/properties/screen/properties/width/type',
					keyword: 'type',
					params: { type: 'number' },
					message: 'must be number'
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
			let data5 = data3.height;
			if (typeof data5 == 'number' && isFinite(data5)) {
				if (data5 < 1 || isNaN(data5)) {
					const err15 = {
						instancePath: instancePath + '/screen/height',
						schemaPath: '#/properties/screen/properties/height/minimum',
						keyword: 'minimum',
						params: { comparison: '>=', limit: 1 },
						message: 'must be >= 1'
					};
					if (vErrors === null) {
						vErrors = [err15];
					} else {
						vErrors.push(err15);
					}
					errors++;
				}
			} else {
				const err16 = {
					instancePath: instancePath + '/screen/height',
					schemaPath: '#/properties/screen/properties/height/type',
					keyword: 'type',
					params: { type: 'number' },
					message: 'must be number'
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
		} else {
			const err17 = {
				instancePath: instancePath + '/screen',
				schemaPath: '#/properties/screen/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err17];
			} else {
				vErrors.push(err17);
			}
			errors++;
		}
		let data6 = data.fps;
		if (typeof data6 == 'number' && isFinite(data6)) {
			if (data6 < 1 || isNaN(data6)) {
				const err18 = {
					instancePath: instancePath + '/fps',
					schemaPath: '#/properties/fps/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err18];
				} else {
					vErrors.push(err18);
				}
				errors++;
			}
		} else {
			const err19 = {
				instancePath: instancePath + '/fps',
				schemaPath: '#/properties/fps/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err19];
			} else {
				vErrors.push(err19);
			}
			errors++;
		}
		if (typeof data.audio_filename !== 'string') {
			const err20 = {
				instancePath: instancePath + '/audio_filename',
				schemaPath: '#/properties/audio_filename/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err20];
			} else {
				vErrors.push(err20);
			}
			errors++;
		}
		let data8 = data.objects;
		if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
			for (const key0 in data8) {
				if (
					!validate11(data8[key0], {
						instancePath:
							instancePath + '/objects/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
						parentData: data8,
						parentDataProperty: key0,
						rootData
					})
				) {
					vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
					errors = vErrors.length;
				}
			}
		} else {
			const err21 = {
				instancePath: instancePath + '/objects',
				schemaPath: '#/properties/objects/type',
				keyword: 'type',
				params: { type: 'object' },
				message: 'must be object'
			};
			if (vErrors === null) {
				vErrors = [err21];
			} else {
				vErrors.push(err21);
			}
			errors++;
		}
	} else {
		const err22 = {
			instancePath,
			schemaPath: '#/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err22];
		} else {
			vErrors.push(err22);
		}
		errors++;
	}
	validate10.errors = vErrors;
	return errors === 0;
}
