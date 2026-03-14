/*
Wav2Bar - Free software for creating audio visualization (motion design) videos
Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

export class Atlas {
	private imageURLResolutionMethod: (path: string, objectId: string) => Promise<string>;

	constructor() {
		this.imageURLResolutionMethod = async () => {
			console.warn(
				'No image resolution method set for Atlas. Using fallback that returns an empty string.'
			);
			return '';
		};
	}

	setImageResolutionMethod(method: (path: string, objectId: string) => Promise<string>) {
		this.imageURLResolutionMethod = method;
	}

	async getImageURL(path: string, objectId: string): Promise<string> {
		return this.imageURLResolutionMethod(path, objectId);
	}
}
