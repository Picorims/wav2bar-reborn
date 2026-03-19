/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import type { UUIDv4 } from '$lib/types/common_types';
import { Container, Text, TextStyle } from 'pixi.js';
import { mutateBaseVOContainer, type VisualObjectRenderer } from './visual_object_renderer';
import type { SaveVO_Text } from '$lib/store/save_structure/save_latest';
import { TextTimeStringFormatter } from '../tick_units/text_time_string_formatter';
import type { TickUnit } from '../tick_units/tick_unit';
import { Log } from '$lib/log/logger';

export class VO_Text implements VisualObjectRenderer<SaveVO_Text> {
	private saveId: UUIDv4;
	private container: Container;
	private text: Text;
	private tickUnit: TextTimeStringFormatter;
	private type: 'any' | 'time' = 'any';

	constructor(saveId: UUIDv4) {
		this.saveId = saveId;
		this.container = new Container();
		this.text = new Text();
		this.tickUnit = new TextTimeStringFormatter();

		this.tickUnit.subscribe((data) => {
			if (this.type === 'time') {
				this.text.text = data;
			}
		});
	}

	getTickUnit() {
		return this.tickUnit as TickUnit<unknown>;
	}

	update(obj: SaveVO_Text) {
		this.container.removeChildren();
		mutateBaseVOContainer(obj, this.container);

		let shadow:
			| {
					color: string;
					blur: number;
					angle: number;
					distance: number;
			  }
			| undefined = undefined;

		if (typeof obj.text_shadows !== 'undefined' && obj.text_shadows.length > 0) {
			const textShadow = obj.text_shadows[0];
			const shadowDistance = Math.sqrt(textShadow.offset.x ** 2 + textShadow.offset.y ** 2);
			const shadowAngle = Math.atan2(textShadow.offset.y, textShadow.offset.x);
			shadow = {
				color: textShadow.color,
				blur: textShadow.blur_radius,
				angle: shadowAngle,
				distance: shadowDistance
			};
		}

		this.type = obj.text_type;
		Log.default.debug(this.type, 'this._type');

		let textContent = obj.text_content;
		if (this.type === 'time') {
			textContent = this.tickUnit.getDefaultValue();
		}

		// TODO: type, underline, overline, line through
		const text = new Text({
			text: textContent,

			style: new TextStyle({
				fill: obj.color,
				wordWrap: true,
				wordWrapWidth: obj.size.width,
				fontSize: obj.font_size,
				fontStyle: obj.text_decoration.italic ? 'italic' : 'normal',
				fontWeight: obj.text_decoration.bold ? 'bold' : 'normal',
				align: obj.text_align.horizontal,
				dropShadow: shadow
			})
		});

		if (text.style.align === 'center') {
			text.x = obj.size.width / 2 - text.width / 2;
		} else if (text.style.align === 'right') {
			text.x = obj.size.width - text.width;
		}

		this.container.addChild(text);

		this.text = text;
	}

	getContainer(): Container {
		return this.container;
	}
}
