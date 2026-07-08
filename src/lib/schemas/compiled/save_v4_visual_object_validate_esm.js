'use strict';
export const validate = validate10;
export default validate10;
const schema11 = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	definitions: {
		angle_degrees_int: {
			description: 'degrees, clockwise. 0 and 360 may have a different meaning.',
			type: 'integer',
			minimum: 0,
			maximum: 360
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
				border_radius: { description: 'CSS border-radius', type: 'string', default: '' }
			},
			required: ['border_radius']
		},
		supports_box_shadow: {
			type: 'object',
			properties: { box_shadow: { description: 'CSS box-shadow', type: 'string', default: '' } },
			required: ['box_shadow']
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
							default: ''
						},
						last_gradient: { description: 'CSS gradient syntax.', type: 'string', default: '' },
						last_image: {
							description:
								'Name of the image with the extension, stored in the background folder of the object.',
							type: 'string',
							default: ''
						},
						size: { description: 'contain | cover | x% | x% y%', type: 'string', default: '' },
						repeat: { enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], default: 'no-repeat' }
					},
					default: {
						type: 'color',
						last_color: '',
						last_gradient: '',
						last_image: '',
						size: '',
						repeat: 'no-repeat'
					},
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
					type: 'object',
					properties: { x: { type: 'integer', default: 0 }, y: { type: 'integer', default: 0 } },
					required: ['x', 'y']
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
				text_shadow: { description: 'CSS text-shadow', type: 'string', default: '' }
			},
			required: [
				'text_type',
				'text_content',
				'font_size',
				'text_decoration',
				'text_align',
				'text_shadow'
			]
		},
		supports_border_thickness: {
			type: 'object',
			properties: { border_thickness: { type: 'integer', minimum: 0, default: 0 } },
			required: ['border_thickness']
		},
		supports_timer_inner_spacing: {
			type: 'object',
			properties: { timer_inner_spacing: { type: 'integer', minimum: 0, default: 0 } },
			required: ['timer_inner_spacing']
		},
		supports_visualizer_props: {
			type: 'object',
			properties: {
				visualizer_points_count: { type: 'integer', minimum: 1, default: 1 },
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
					default: 0
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
			properties: { visualizer_bar_thickness: { type: 'integer', minimum: 0, default: 0 } },
			required: ['visualizer_bar_thickness']
		},
		supports_visualizer_circular_props: {
			type: 'object',
			properties: { visualizer_radius: { type: 'integer', minimum: 0, default: 0 } },
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
				{ $ref: '#/definitions/supports_box_shadow' },
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
				{ $ref: '#/definitions/supports_box_shadow' },
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
				{ $ref: '#/definitions/supports_box_shadow' }
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
				{ $ref: '#/definitions/supports_box_shadow' }
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
				{ $ref: '#/definitions/supports_box_shadow' },
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
	$ref: '#/definitions/visual_object'
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
		{ $ref: '#/definitions/supports_box_shadow' },
		{ $ref: '#/definitions/supports_background' }
	]
};
const schema16 = {
	type: 'object',
	properties: { border_radius: { description: 'CSS border-radius', type: 'string', default: '' } },
	required: ['border_radius']
};
const schema17 = {
	type: 'object',
	properties: { box_shadow: { description: 'CSS box-shadow', type: 'string', default: '' } },
	required: ['box_shadow']
};
const schema18 = {
	type: 'object',
	properties: {
		background: {
			type: 'object',
			properties: {
				type: { type: 'string', enum: ['color', 'gradient', 'image'], default: 'color' },
				last_color: {
					description: 'hex, rgb, rgba, hsv color, CSS syntax.',
					type: 'string',
					default: ''
				},
				last_gradient: { description: 'CSS gradient syntax.', type: 'string', default: '' },
				last_image: {
					description:
						'Name of the image with the extension, stored in the background folder of the object.',
					type: 'string',
					default: ''
				},
				size: { description: 'contain | cover | x% | x% y%', type: 'string', default: '' },
				repeat: { enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], default: 'no-repeat' }
			},
			default: {
				type: 'color',
				last_color: '',
				last_gradient: '',
				last_image: '',
				size: '',
				repeat: 'no-repeat'
			},
			required: ['type', 'last_color', 'last_gradient', 'last_image', 'size', 'repeat']
		}
	},
	required: ['background']
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
			data.border_radius = '';
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
		if (typeof data.border_radius !== 'string') {
			const err4 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
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
			schemaPath: '#/definitions/supports_border_radius/type',
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
		if (data.box_shadow === undefined) {
			data.box_shadow = '';
		}
		if (data.box_shadow === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_box_shadow/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadow' },
				message: "must have required property '" + 'box_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		if (typeof data.box_shadow !== 'string') {
			const err7 = {
				instancePath: instancePath + '/box_shadow',
				schemaPath: '#/definitions/supports_box_shadow/properties/box_shadow/type',
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
	} else {
		const err8 = {
			instancePath,
			schemaPath: '#/definitions/supports_box_shadow/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.background === undefined) {
			data.background = {
				type: 'color',
				last_color: '',
				last_gradient: '',
				last_image: '',
				size: '',
				repeat: 'no-repeat'
			};
		}
		if (data.background === undefined) {
			const err9 = {
				instancePath,
				schemaPath: '#/definitions/supports_background/required',
				keyword: 'required',
				params: { missingProperty: 'background' },
				message: "must have required property '" + 'background' + "'"
			};
			if (vErrors === null) {
				vErrors = [err9];
			} else {
				vErrors.push(err9);
			}
			errors++;
		}
		let data3 = data.background;
		if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
			if (data3.type === undefined) {
				data3.type = 'color';
			}
			if (data3.last_color === undefined) {
				data3.last_color = '';
			}
			if (data3.last_gradient === undefined) {
				data3.last_gradient = '';
			}
			if (data3.last_image === undefined) {
				data3.last_image = '';
			}
			if (data3.size === undefined) {
				data3.size = '';
			}
			if (data3.repeat === undefined) {
				data3.repeat = 'no-repeat';
			}
			if (data3.type === undefined) {
				const err10 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'type' },
					message: "must have required property '" + 'type' + "'"
				};
				if (vErrors === null) {
					vErrors = [err10];
				} else {
					vErrors.push(err10);
				}
				errors++;
			}
			if (data3.last_color === undefined) {
				const err11 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_color' },
					message: "must have required property '" + 'last_color' + "'"
				};
				if (vErrors === null) {
					vErrors = [err11];
				} else {
					vErrors.push(err11);
				}
				errors++;
			}
			if (data3.last_gradient === undefined) {
				const err12 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_gradient' },
					message: "must have required property '" + 'last_gradient' + "'"
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
			if (data3.last_image === undefined) {
				const err13 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'last_image' },
					message: "must have required property '" + 'last_image' + "'"
				};
				if (vErrors === null) {
					vErrors = [err13];
				} else {
					vErrors.push(err13);
				}
				errors++;
			}
			if (data3.size === undefined) {
				const err14 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'size' },
					message: "must have required property '" + 'size' + "'"
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
			if (data3.repeat === undefined) {
				const err15 = {
					instancePath: instancePath + '/background',
					schemaPath: '#/definitions/supports_background/properties/background/required',
					keyword: 'required',
					params: { missingProperty: 'repeat' },
					message: "must have required property '" + 'repeat' + "'"
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
			let data4 = data3.type;
			if (typeof data4 !== 'string') {
				const err16 = {
					instancePath: instancePath + '/background/type',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/type/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
			if (!(data4 === 'color' || data4 === 'gradient' || data4 === 'image')) {
				const err17 = {
					instancePath: instancePath + '/background/type',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/type/enum',
					keyword: 'enum',
					params: { allowedValues: schema18.properties.background.properties.type.enum },
					message: 'must be equal to one of the allowed values'
				};
				if (vErrors === null) {
					vErrors = [err17];
				} else {
					vErrors.push(err17);
				}
				errors++;
			}
			if (typeof data3.last_color !== 'string') {
				const err18 = {
					instancePath: instancePath + '/background/last_color',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/last_color/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err18];
				} else {
					vErrors.push(err18);
				}
				errors++;
			}
			if (typeof data3.last_gradient !== 'string') {
				const err19 = {
					instancePath: instancePath + '/background/last_gradient',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/last_gradient/type',
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
			if (typeof data3.last_image !== 'string') {
				const err20 = {
					instancePath: instancePath + '/background/last_image',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/last_image/type',
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
			if (typeof data3.size !== 'string') {
				const err21 = {
					instancePath: instancePath + '/background/size',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/size/type',
					keyword: 'type',
					params: { type: 'string' },
					message: 'must be string'
				};
				if (vErrors === null) {
					vErrors = [err21];
				} else {
					vErrors.push(err21);
				}
				errors++;
			}
			let data9 = data3.repeat;
			if (
				!(
					data9 === 'no-repeat' ||
					data9 === 'repeat' ||
					data9 === 'repeat-x' ||
					data9 === 'repeat-y'
				)
			) {
				const err22 = {
					instancePath: instancePath + '/background/repeat',
					schemaPath:
						'#/definitions/supports_background/properties/background/properties/repeat/enum',
					keyword: 'enum',
					params: { allowedValues: schema18.properties.background.properties.repeat.enum },
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
				instancePath: instancePath + '/background',
				schemaPath: '#/definitions/supports_background/properties/background/type',
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
	} else {
		const err24 = {
			instancePath,
			schemaPath: '#/definitions/supports_background/type',
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
	validate12.errors = vErrors;
	return errors === 0;
}
const schema19 = {
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
const schema22 = {
	type: 'object',
	properties: { color: { description: 'hex, rgb, rgba', type: 'string', default: '#ffffff' } },
	required: ['color']
};
const schema20 = {
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
			type: 'object',
			properties: { x: { type: 'integer', default: 0 }, y: { type: 'integer', default: 0 } },
			required: ['x', 'y']
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
function validate18(
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
				params: { allowedValues: schema20.properties.flow_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err11];
			} else {
				vErrors.push(err11);
			}
			errors++;
		}
		if (data.flow_center !== undefined) {
			let data3 = data.flow_center;
			if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
				if (data3.x === undefined) {
					data3.x = 0;
				}
				if (data3.y === undefined) {
					data3.y = 0;
				}
				if (data3.x === undefined) {
					const err12 = {
						instancePath: instancePath + '/flow_center',
						schemaPath: '#/properties/flow_center/required',
						keyword: 'required',
						params: { missingProperty: 'x' },
						message: "must have required property '" + 'x' + "'"
					};
					if (vErrors === null) {
						vErrors = [err12];
					} else {
						vErrors.push(err12);
					}
					errors++;
				}
				if (data3.y === undefined) {
					const err13 = {
						instancePath: instancePath + '/flow_center',
						schemaPath: '#/properties/flow_center/required',
						keyword: 'required',
						params: { missingProperty: 'y' },
						message: "must have required property '" + 'y' + "'"
					};
					if (vErrors === null) {
						vErrors = [err13];
					} else {
						vErrors.push(err13);
					}
					errors++;
				}
				let data4 = data3.x;
				if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
					const err14 = {
						instancePath: instancePath + '/flow_center/x',
						schemaPath: '#/properties/flow_center/properties/x/type',
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
				let data5 = data3.y;
				if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
					const err15 = {
						instancePath: instancePath + '/flow_center/y',
						schemaPath: '#/properties/flow_center/properties/y/type',
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
			} else {
				const err16 = {
					instancePath: instancePath + '/flow_center',
					schemaPath: '#/properties/flow_center/type',
					keyword: 'type',
					params: { type: 'object' },
					message: 'must be object'
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
		}
		let data6 = data.flow_direction;
		if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
			const err17 = {
				instancePath: instancePath + '/flow_direction',
				schemaPath: '#/definitions/angle_degrees_int/type',
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
		if (typeof data6 == 'number' && isFinite(data6)) {
			if (data6 > 360 || isNaN(data6)) {
				const err18 = {
					instancePath: instancePath + '/flow_direction',
					schemaPath: '#/definitions/angle_degrees_int/maximum',
					keyword: 'maximum',
					params: { comparison: '<=', limit: 360 },
					message: 'must be <= 360'
				};
				if (vErrors === null) {
					vErrors = [err18];
				} else {
					vErrors.push(err18);
				}
				errors++;
			}
			if (data6 < 0 || isNaN(data6)) {
				const err19 = {
					instancePath: instancePath + '/flow_direction',
					schemaPath: '#/definitions/angle_degrees_int/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err19];
				} else {
					vErrors.push(err19);
				}
				errors++;
			}
		}
		let data7 = data.particle_spawn_probability;
		if (typeof data7 == 'number' && isFinite(data7)) {
			if (data7 > 1 || isNaN(data7)) {
				const err20 = {
					instancePath: instancePath + '/particle_spawn_probability',
					schemaPath: '#/properties/particle_spawn_probability/maximum',
					keyword: 'maximum',
					params: { comparison: '<=', limit: 1 },
					message: 'must be <= 1'
				};
				if (vErrors === null) {
					vErrors = [err20];
				} else {
					vErrors.push(err20);
				}
				errors++;
			}
			if (data7 < 0 || isNaN(data7)) {
				const err21 = {
					instancePath: instancePath + '/particle_spawn_probability',
					schemaPath: '#/properties/particle_spawn_probability/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
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
				instancePath: instancePath + '/particle_spawn_probability',
				schemaPath: '#/properties/particle_spawn_probability/type',
				keyword: 'type',
				params: { type: 'number' },
				message: 'must be number'
			};
			if (vErrors === null) {
				vErrors = [err22];
			} else {
				vErrors.push(err22);
			}
			errors++;
		}
		let data8 = data.particle_spawn_tests;
		if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
			const err23 = {
				instancePath: instancePath + '/particle_spawn_tests',
				schemaPath: '#/properties/particle_spawn_tests/type',
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
		if (typeof data8 == 'number' && isFinite(data8)) {
			if (data8 < 1 || isNaN(data8)) {
				const err24 = {
					instancePath: instancePath + '/particle_spawn_tests',
					schemaPath: '#/properties/particle_spawn_tests/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
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
	validate18.errors = vErrors;
	return errors === 0;
}
function validate16(
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
	if (!validate18(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate18.errors : vErrors.concat(validate18.errors);
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
	validate16.errors = vErrors;
	return errors === 0;
}
const schema23 = {
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
const schema24 = {
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
		text_shadow: { description: 'CSS text-shadow', type: 'string', default: '' }
	},
	required: [
		'text_type',
		'text_content',
		'font_size',
		'text_decoration',
		'text_align',
		'text_shadow'
	]
};
function validate21(
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
		if (data.text_shadow === undefined) {
			data.text_shadow = '';
		}
		if (data.text_type === undefined) {
			const err3 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'text_type' },
				message: "must have required property '" + 'text_type' + "'"
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.text_content === undefined) {
			const err4 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'text_content' },
				message: "must have required property '" + 'text_content' + "'"
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		if (data.font_size === undefined) {
			const err5 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'font_size' },
				message: "must have required property '" + 'font_size' + "'"
			};
			if (vErrors === null) {
				vErrors = [err5];
			} else {
				vErrors.push(err5);
			}
			errors++;
		}
		if (data.text_decoration === undefined) {
			const err6 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'text_decoration' },
				message: "must have required property '" + 'text_decoration' + "'"
			};
			if (vErrors === null) {
				vErrors = [err6];
			} else {
				vErrors.push(err6);
			}
			errors++;
		}
		if (data.text_align === undefined) {
			const err7 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'text_align' },
				message: "must have required property '" + 'text_align' + "'"
			};
			if (vErrors === null) {
				vErrors = [err7];
			} else {
				vErrors.push(err7);
			}
			errors++;
		}
		if (data.text_shadow === undefined) {
			const err8 = {
				instancePath,
				schemaPath: '#/definitions/supports_text_props/required',
				keyword: 'required',
				params: { missingProperty: 'text_shadow' },
				message: "must have required property '" + 'text_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err8];
			} else {
				vErrors.push(err8);
			}
			errors++;
		}
		let data1 = data.text_type;
		if (!(data1 === 'any' || data1 === 'time')) {
			const err9 = {
				instancePath: instancePath + '/text_type',
				schemaPath: '#/definitions/supports_text_props/properties/text_type/enum',
				keyword: 'enum',
				params: { allowedValues: schema24.properties.text_type.enum },
				message: 'must be equal to one of the allowed values'
			};
			if (vErrors === null) {
				vErrors = [err9];
			} else {
				vErrors.push(err9);
			}
			errors++;
		}
		if (typeof data.text_content !== 'string') {
			const err10 = {
				instancePath: instancePath + '/text_content',
				schemaPath: '#/definitions/supports_text_props/properties/text_content/type',
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
		let data3 = data.font_size;
		if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
			const err11 = {
				instancePath: instancePath + '/font_size',
				schemaPath: '#/definitions/supports_text_props/properties/font_size/type',
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
			if (data3 < 1 || isNaN(data3)) {
				const err12 = {
					instancePath: instancePath + '/font_size',
					schemaPath: '#/definitions/supports_text_props/properties/font_size/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 1 },
					message: 'must be >= 1'
				};
				if (vErrors === null) {
					vErrors = [err12];
				} else {
					vErrors.push(err12);
				}
				errors++;
			}
		}
		let data4 = data.text_decoration;
		if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
			if (data4.italic === undefined) {
				data4.italic = false;
			}
			if (data4.bold === undefined) {
				data4.bold = false;
			}
			if (data4.underline === undefined) {
				data4.underline = false;
			}
			if (data4.overline === undefined) {
				data4.overline = false;
			}
			if (data4.line_through === undefined) {
				data4.line_through = false;
			}
			if (data4.italic === undefined) {
				const err13 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/definitions/supports_text_props/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'italic' },
					message: "must have required property '" + 'italic' + "'"
				};
				if (vErrors === null) {
					vErrors = [err13];
				} else {
					vErrors.push(err13);
				}
				errors++;
			}
			if (data4.bold === undefined) {
				const err14 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/definitions/supports_text_props/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'bold' },
					message: "must have required property '" + 'bold' + "'"
				};
				if (vErrors === null) {
					vErrors = [err14];
				} else {
					vErrors.push(err14);
				}
				errors++;
			}
			if (data4.underline === undefined) {
				const err15 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/definitions/supports_text_props/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'underline' },
					message: "must have required property '" + 'underline' + "'"
				};
				if (vErrors === null) {
					vErrors = [err15];
				} else {
					vErrors.push(err15);
				}
				errors++;
			}
			if (data4.overline === undefined) {
				const err16 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/definitions/supports_text_props/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'overline' },
					message: "must have required property '" + 'overline' + "'"
				};
				if (vErrors === null) {
					vErrors = [err16];
				} else {
					vErrors.push(err16);
				}
				errors++;
			}
			if (data4.line_through === undefined) {
				const err17 = {
					instancePath: instancePath + '/text_decoration',
					schemaPath: '#/definitions/supports_text_props/properties/text_decoration/required',
					keyword: 'required',
					params: { missingProperty: 'line_through' },
					message: "must have required property '" + 'line_through' + "'"
				};
				if (vErrors === null) {
					vErrors = [err17];
				} else {
					vErrors.push(err17);
				}
				errors++;
			}
			if (typeof data4.italic !== 'boolean') {
				const err18 = {
					instancePath: instancePath + '/text_decoration/italic',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_decoration/properties/italic/type',
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
			if (typeof data4.bold !== 'boolean') {
				const err19 = {
					instancePath: instancePath + '/text_decoration/bold',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_decoration/properties/bold/type',
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
			if (typeof data4.underline !== 'boolean') {
				const err20 = {
					instancePath: instancePath + '/text_decoration/underline',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_decoration/properties/underline/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err20];
				} else {
					vErrors.push(err20);
				}
				errors++;
			}
			if (typeof data4.overline !== 'boolean') {
				const err21 = {
					instancePath: instancePath + '/text_decoration/overline',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_decoration/properties/overline/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
				};
				if (vErrors === null) {
					vErrors = [err21];
				} else {
					vErrors.push(err21);
				}
				errors++;
			}
			if (typeof data4.line_through !== 'boolean') {
				const err22 = {
					instancePath: instancePath + '/text_decoration/line_through',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_decoration/properties/line_through/type',
					keyword: 'type',
					params: { type: 'boolean' },
					message: 'must be boolean'
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
				instancePath: instancePath + '/text_decoration',
				schemaPath: '#/definitions/supports_text_props/properties/text_decoration/type',
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
		let data10 = data.text_align;
		if (data10 && typeof data10 == 'object' && !Array.isArray(data10)) {
			if (data10.horizontal === undefined) {
				data10.horizontal = 'left';
			}
			if (data10.horizontal === undefined) {
				const err24 = {
					instancePath: instancePath + '/text_align',
					schemaPath: '#/definitions/supports_text_props/properties/text_align/required',
					keyword: 'required',
					params: { missingProperty: 'horizontal' },
					message: "must have required property '" + 'horizontal' + "'"
				};
				if (vErrors === null) {
					vErrors = [err24];
				} else {
					vErrors.push(err24);
				}
				errors++;
			}
			let data11 = data10.horizontal;
			if (!(data11 === 'left' || data11 === 'center' || data11 === 'right')) {
				const err25 = {
					instancePath: instancePath + '/text_align/horizontal',
					schemaPath:
						'#/definitions/supports_text_props/properties/text_align/properties/horizontal/enum',
					keyword: 'enum',
					params: { allowedValues: schema24.properties.text_align.properties.horizontal.enum },
					message: 'must be equal to one of the allowed values'
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
				instancePath: instancePath + '/text_align',
				schemaPath: '#/definitions/supports_text_props/properties/text_align/type',
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
		if (typeof data.text_shadow !== 'string') {
			const err27 = {
				instancePath: instancePath + '/text_shadow',
				schemaPath: '#/definitions/supports_text_props/properties/text_shadow/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err27];
			} else {
				vErrors.push(err27);
			}
			errors++;
		}
	} else {
		const err28 = {
			instancePath,
			schemaPath: '#/definitions/supports_text_props/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err28];
		} else {
			vErrors.push(err28);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.color === undefined) {
			data.color = '#ffffff';
		}
		if (data.color === undefined) {
			const err29 = {
				instancePath,
				schemaPath: '#/definitions/supports_color/required',
				keyword: 'required',
				params: { missingProperty: 'color' },
				message: "must have required property '" + 'color' + "'"
			};
			if (vErrors === null) {
				vErrors = [err29];
			} else {
				vErrors.push(err29);
			}
			errors++;
		}
		if (typeof data.color !== 'string') {
			const err30 = {
				instancePath: instancePath + '/color',
				schemaPath: '#/definitions/supports_color/properties/color/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err30];
			} else {
				vErrors.push(err30);
			}
			errors++;
		}
	} else {
		const err31 = {
			instancePath,
			schemaPath: '#/definitions/supports_color/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err31];
		} else {
			vErrors.push(err31);
		}
		errors++;
	}
	validate21.errors = vErrors;
	return errors === 0;
}
const schema26 = {
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
		{ $ref: '#/definitions/supports_box_shadow' },
		{ $ref: '#/definitions/supports_timer_inner_spacing' }
	]
};
const schema28 = {
	type: 'object',
	properties: { border_thickness: { type: 'integer', minimum: 0, default: 0 } },
	required: ['border_thickness']
};
const schema31 = {
	type: 'object',
	properties: { timer_inner_spacing: { type: 'integer', minimum: 0, default: 0 } },
	required: ['timer_inner_spacing']
};
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
			data.border_thickness = 0;
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
			data.border_radius = '';
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
		if (typeof data.border_radius !== 'string') {
			const err11 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
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
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.box_shadow === undefined) {
			data.box_shadow = '';
		}
		if (data.box_shadow === undefined) {
			const err13 = {
				instancePath,
				schemaPath: '#/definitions/supports_box_shadow/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadow' },
				message: "must have required property '" + 'box_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		if (typeof data.box_shadow !== 'string') {
			const err14 = {
				instancePath: instancePath + '/box_shadow',
				schemaPath: '#/definitions/supports_box_shadow/properties/box_shadow/type',
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
	} else {
		const err15 = {
			instancePath,
			schemaPath: '#/definitions/supports_box_shadow/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.timer_inner_spacing === undefined) {
			data.timer_inner_spacing = 0;
		}
		if (data.timer_inner_spacing === undefined) {
			const err16 = {
				instancePath,
				schemaPath: '#/definitions/supports_timer_inner_spacing/required',
				keyword: 'required',
				params: { missingProperty: 'timer_inner_spacing' },
				message: "must have required property '" + 'timer_inner_spacing' + "'"
			};
			if (vErrors === null) {
				vErrors = [err16];
			} else {
				vErrors.push(err16);
			}
			errors++;
		}
		let data5 = data.timer_inner_spacing;
		if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
			const err17 = {
				instancePath: instancePath + '/timer_inner_spacing',
				schemaPath:
					'#/definitions/supports_timer_inner_spacing/properties/timer_inner_spacing/type',
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
		if (typeof data5 == 'number' && isFinite(data5)) {
			if (data5 < 0 || isNaN(data5)) {
				const err18 = {
					instancePath: instancePath + '/timer_inner_spacing',
					schemaPath:
						'#/definitions/supports_timer_inner_spacing/properties/timer_inner_spacing/minimum',
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
	} else {
		const err19 = {
			instancePath,
			schemaPath: '#/definitions/supports_timer_inner_spacing/type',
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
	validate24.errors = vErrors;
	return errors === 0;
}
const schema32 = {
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
		{ $ref: '#/definitions/supports_box_shadow' }
	]
};
function validate27(
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
			data.border_thickness = 0;
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
			data.border_radius = '';
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
		if (typeof data.border_radius !== 'string') {
			const err11 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
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
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.box_shadow === undefined) {
			data.box_shadow = '';
		}
		if (data.box_shadow === undefined) {
			const err13 = {
				instancePath,
				schemaPath: '#/definitions/supports_box_shadow/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadow' },
				message: "must have required property '" + 'box_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err13];
			} else {
				vErrors.push(err13);
			}
			errors++;
		}
		if (typeof data.box_shadow !== 'string') {
			const err14 = {
				instancePath: instancePath + '/box_shadow',
				schemaPath: '#/definitions/supports_box_shadow/properties/box_shadow/type',
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
	} else {
		const err15 = {
			instancePath,
			schemaPath: '#/definitions/supports_box_shadow/type',
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
	validate27.errors = vErrors;
	return errors === 0;
}
const schema37 = {
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
		{ $ref: '#/definitions/supports_box_shadow' }
	]
};
const schema38 = {
	type: 'object',
	properties: {
		visualizer_points_count: { type: 'integer', minimum: 1, default: 1 },
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
			default: 0
		}
	},
	required: [
		'visualizer_points_count',
		'visualizer_analyzer_range',
		'visualization_smoothing_type',
		'visualization_smoothing_factor'
	]
};
const schema39 = {
	type: 'object',
	properties: { visualizer_bar_thickness: { type: 'integer', minimum: 0, default: 0 } },
	required: ['visualizer_bar_thickness']
};
function validate30(
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
			data.visualizer_points_count = 1;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0;
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
				params: { allowedValues: schema38.properties.visualization_smoothing_type.enum },
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
			data.visualizer_bar_thickness = 0;
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
			data.border_radius = '';
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
		if (typeof data.border_radius !== 'string') {
			const err26 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
			};
			if (vErrors === null) {
				vErrors = [err26];
			} else {
				vErrors.push(err26);
			}
			errors++;
		}
	} else {
		const err27 = {
			instancePath,
			schemaPath: '#/definitions/supports_border_radius/type',
			keyword: 'type',
			params: { type: 'object' },
			message: 'must be object'
		};
		if (vErrors === null) {
			vErrors = [err27];
		} else {
			vErrors.push(err27);
		}
		errors++;
	}
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.box_shadow === undefined) {
			data.box_shadow = '';
		}
		if (data.box_shadow === undefined) {
			const err28 = {
				instancePath,
				schemaPath: '#/definitions/supports_box_shadow/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadow' },
				message: "must have required property '" + 'box_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err28];
			} else {
				vErrors.push(err28);
			}
			errors++;
		}
		if (typeof data.box_shadow !== 'string') {
			const err29 = {
				instancePath: instancePath + '/box_shadow',
				schemaPath: '#/definitions/supports_box_shadow/properties/box_shadow/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
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
			instancePath,
			schemaPath: '#/definitions/supports_box_shadow/type',
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
	validate30.errors = vErrors;
	return errors === 0;
}
const schema43 = {
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
function validate33(
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
			data.visualizer_points_count = 1;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0;
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
				params: { allowedValues: schema38.properties.visualization_smoothing_type.enum },
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
	validate33.errors = vErrors;
	return errors === 0;
}
const schema46 = {
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
		{ $ref: '#/definitions/supports_box_shadow' },
		{ $ref: '#/definitions/supports_visualizer_bar_props' },
		{ $ref: '#/definitions/supports_visualizer_circular_props' }
	]
};
const schema52 = {
	type: 'object',
	properties: { visualizer_radius: { type: 'integer', minimum: 0, default: 0 } },
	required: ['visualizer_radius']
};
function validate36(
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
			data.visualizer_points_count = 1;
		}
		if (data.visualizer_analyzer_range === undefined) {
			data.visualizer_analyzer_range = [0, 1023];
		}
		if (data.visualization_smoothing_type === undefined) {
			data.visualization_smoothing_type = 'proportional_decrease';
		}
		if (data.visualization_smoothing_factor === undefined) {
			data.visualization_smoothing_factor = 0;
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
				params: { allowedValues: schema38.properties.visualization_smoothing_type.enum },
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
			data.border_radius = '';
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
		if (typeof data.border_radius !== 'string') {
			const err22 = {
				instancePath: instancePath + '/border_radius',
				schemaPath: '#/definitions/supports_border_radius/properties/border_radius/type',
				keyword: 'type',
				params: { type: 'string' },
				message: 'must be string'
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
			schemaPath: '#/definitions/supports_border_radius/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.box_shadow === undefined) {
			data.box_shadow = '';
		}
		if (data.box_shadow === undefined) {
			const err24 = {
				instancePath,
				schemaPath: '#/definitions/supports_box_shadow/required',
				keyword: 'required',
				params: { missingProperty: 'box_shadow' },
				message: "must have required property '" + 'box_shadow' + "'"
			};
			if (vErrors === null) {
				vErrors = [err24];
			} else {
				vErrors.push(err24);
			}
			errors++;
		}
		if (typeof data.box_shadow !== 'string') {
			const err25 = {
				instancePath: instancePath + '/box_shadow',
				schemaPath: '#/definitions/supports_box_shadow/properties/box_shadow/type',
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
			schemaPath: '#/definitions/supports_box_shadow/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_bar_thickness === undefined) {
			data.visualizer_bar_thickness = 0;
		}
		if (data.visualizer_bar_thickness === undefined) {
			const err27 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_bar_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_bar_thickness' },
				message: "must have required property '" + 'visualizer_bar_thickness' + "'"
			};
			if (vErrors === null) {
				vErrors = [err27];
			} else {
				vErrors.push(err27);
			}
			errors++;
		}
		let data9 = data.visualizer_bar_thickness;
		if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
			const err28 = {
				instancePath: instancePath + '/visualizer_bar_thickness',
				schemaPath:
					'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err28];
			} else {
				vErrors.push(err28);
			}
			errors++;
		}
		if (typeof data9 == 'number' && isFinite(data9)) {
			if (data9 < 0 || isNaN(data9)) {
				const err29 = {
					instancePath: instancePath + '/visualizer_bar_thickness',
					schemaPath:
						'#/definitions/supports_visualizer_bar_props/properties/visualizer_bar_thickness/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err29];
				} else {
					vErrors.push(err29);
				}
				errors++;
			}
		}
	} else {
		const err30 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_bar_props/type',
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
	if (data && typeof data == 'object' && !Array.isArray(data)) {
		if (data.visualizer_radius === undefined) {
			data.visualizer_radius = 0;
		}
		if (data.visualizer_radius === undefined) {
			const err31 = {
				instancePath,
				schemaPath: '#/definitions/supports_visualizer_circular_props/required',
				keyword: 'required',
				params: { missingProperty: 'visualizer_radius' },
				message: "must have required property '" + 'visualizer_radius' + "'"
			};
			if (vErrors === null) {
				vErrors = [err31];
			} else {
				vErrors.push(err31);
			}
			errors++;
		}
		let data10 = data.visualizer_radius;
		if (!(typeof data10 == 'number' && !(data10 % 1) && !isNaN(data10) && isFinite(data10))) {
			const err32 = {
				instancePath: instancePath + '/visualizer_radius',
				schemaPath:
					'#/definitions/supports_visualizer_circular_props/properties/visualizer_radius/type',
				keyword: 'type',
				params: { type: 'integer' },
				message: 'must be integer'
			};
			if (vErrors === null) {
				vErrors = [err32];
			} else {
				vErrors.push(err32);
			}
			errors++;
		}
		if (typeof data10 == 'number' && isFinite(data10)) {
			if (data10 < 0 || isNaN(data10)) {
				const err33 = {
					instancePath: instancePath + '/visualizer_radius',
					schemaPath:
						'#/definitions/supports_visualizer_circular_props/properties/visualizer_radius/minimum',
					keyword: 'minimum',
					params: { comparison: '>=', limit: 0 },
					message: 'must be >= 0'
				};
				if (vErrors === null) {
					vErrors = [err33];
				} else {
					vErrors.push(err33);
				}
				errors++;
			}
		}
	} else {
		const err34 = {
			instancePath,
			schemaPath: '#/definitions/supports_visualizer_circular_props/type',
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
	validate36.errors = vErrors;
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
		if (!validate16(data, { instancePath, parentData, parentDataProperty, rootData })) {
			vErrors = vErrors === null ? validate16.errors : vErrors.concat(validate16.errors);
			errors = vErrors.length;
		}
		var _valid0 = _errs2 === errors;
		valid0 = valid0 || _valid0;
		if (!valid0) {
			const _errs3 = errors;
			if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData })) {
				vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
				errors = vErrors.length;
			}
			var _valid0 = _errs3 === errors;
			valid0 = valid0 || _valid0;
			if (!valid0) {
				const _errs4 = errors;
				if (!validate24(data, { instancePath, parentData, parentDataProperty, rootData })) {
					vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
					errors = vErrors.length;
				}
				var _valid0 = _errs4 === errors;
				valid0 = valid0 || _valid0;
				if (!valid0) {
					const _errs5 = errors;
					if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData })) {
						vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
						errors = vErrors.length;
					}
					var _valid0 = _errs5 === errors;
					valid0 = valid0 || _valid0;
					if (!valid0) {
						const _errs6 = errors;
						if (!validate30(data, { instancePath, parentData, parentDataProperty, rootData })) {
							vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
							errors = vErrors.length;
						}
						var _valid0 = _errs6 === errors;
						valid0 = valid0 || _valid0;
						if (!valid0) {
							const _errs7 = errors;
							if (!validate33(data, { instancePath, parentData, parentDataProperty, rootData })) {
								vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
								errors = vErrors.length;
							}
							var _valid0 = _errs7 === errors;
							valid0 = valid0 || _valid0;
							if (!valid0) {
								const _errs8 = errors;
								if (!validate36(data, { instancePath, parentData, parentDataProperty, rootData })) {
									vErrors =
										vErrors === null ? validate36.errors : vErrors.concat(validate36.errors);
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
	if (!validate11(data, { instancePath, parentData, parentDataProperty, rootData })) {
		vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
		errors = vErrors.length;
	}
	validate10.errors = vErrors;
	return errors === 0;
}
