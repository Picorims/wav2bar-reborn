/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { vertex } from 'pixi-filters';
import { Color, Filter } from 'pixi.js';

const fragment = `
  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform vec4 uColor;

  void main(void) {
    vec4 color = texture(uTexture, vTextureCoord);
    finalColor = mix(vec4(uColor.xyz,0.0), uColor, 1.0 - color.w);
  }
`;

export function createInvertFillFilter(color: Color) {
	return Filter.from({
		gl: {
			vertex,
			fragment,
			name: 'invert'
		},
		resources: {
			invertUniforms: {
				uColor: { type: 'vec4<f32>', value: color.toArray() }
			}
		}
	});
}
