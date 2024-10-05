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

import type { UUIDv4 } from '$lib/types/common_types';
import { Container, Text, TextStyle } from 'pixi.js';
import type { VisualObjectRenderer } from './visual_object_renderer';
import type { SaveVO_Text } from '$lib/store/save_structure/save_latest';
import { parseCSSTextShadow } from '$lib/string';
import { TextTimeStringFormatter } from '../tick_units/text_time_string_formatter';
import type { TickUnit } from '../tick_units/tick_unit';
import { Log } from '$lib/log/logger';

export class VO_Text implements VisualObjectRenderer<SaveVO_Text> {
	private _saveId: UUIDv4;
	private _container: Container;
	private _text: Text;
	private _tickUnit: TextTimeStringFormatter;
	private _type: "any" | "time" = "any";

	constructor(saveId: UUIDv4) {
		this._saveId = saveId;
		this._container = new Container();
		this._text = new Text();
		this._tickUnit = new TextTimeStringFormatter();

		this._tickUnit.subscribe((data) => {
			if (this._type === "time") {
				this._text.text = data;
			}
		});
	}

	getTickUnit() {
		return this._tickUnit as TickUnit<unknown>;
	}

	update(obj: SaveVO_Text): Container {
		const textShadow = parseCSSTextShadow(obj.text_shadow);

		const container = new Container({
			zIndex: obj.layer,
			x: obj.coordinates.x,
			y: obj.coordinates.y,
			angle: obj.rotation // angle is in degrees
		});
		const shadowDistance = Math.sqrt(textShadow.offsetX ** 2 + textShadow.offsetY ** 2);
		const shadowAngle = Math.atan2(textShadow.offsetY, textShadow.offsetX);

		this._type = obj.text_type;
		Log.default.debug(this._type, "this._type");
		
		let textContent = obj.text_content;
		if (this._type === "time") {
			textContent = this._tickUnit.getDefaultValue();
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
				dropShadow: {
					color: textShadow.color,
					blur: textShadow.blurRadius,
					angle: shadowAngle,
					distance: shadowDistance
				},
			})
		});

		if (text.style.align === 'center') {
			text.x = obj.size.width / 2 - text.width / 2;
		} else if (text.style.align === 'right') {
			text.x = obj.size.width - text.width;
		}

		container.addChild(text);

		this._container = container;
		this._text = text;
		return this._container;
	}
	getContainer(): Container {
		return this._container;
	}
}
