/*
	Wav2Bar - Free software for creating audio visualization (motion design) videos
	Copyright (c) 2025 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

	This Source Code Form is subject to the terms of the Mozilla Public
	License, v. 2.0. If a copy of the MPL was not distributed with this
	file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import { describe, expect, it } from 'vitest';
import {
	DEFAULT_ERROR_MESSAGE,
	extractErrorMessage,
	filenameWithExtensionFromPath
} from './string';

describe('string', () => {
	describe('filenameWithExtensionFromPath', () => {
		it('extracts filename from Unix-style path', () => {
			const test = '/home/user/documents/file.txt';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('file.txt');
		});
		it('extracts filename from Windows-style path', () => {
			const test = 'C:\\Users\\User\\Documents\\file.txt';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('file.txt');
		});
		it('extracts filename from mixed-style path', () => {
			const test = 'C:\\Users\\User\\Documents/file.txt';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('file.txt');
		});
		it('extracts filename from path without directories', () => {
			const test = 'file.txt';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('file.txt');
		});
		it('extracts filename from path with multiple dots', () => {
			const test = '/home/user/documents/archive.tar.gz';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('archive.tar.gz');
		});

		// edge cases
		it('returns empty string for path ending with a slash', () => {
			const test = '/home/user/documents/';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('');
		});
		it('returns empty string for empty path', () => {
			const test = '';
			const result = filenameWithExtensionFromPath(test);
			expect(result).to.equal('');
		});
	});
	describe('extractErrorMessage', () => {
		it('extracts message from Error object', () => {
			const error = new Error('Something went wrong');
			const result = extractErrorMessage(error);
			expect(result).to.equal('Something went wrong');
		});
		it('returns string if input is a string', () => {
			const error = 'An error occurred';
			const result = extractErrorMessage(error);
			expect(result).to.equal('An error occurred');
		});
		it('returns default message for unknown error type', () => {
			const error = { code: 500 };
			const result = extractErrorMessage(error);
			expect(result).to.equal(DEFAULT_ERROR_MESSAGE);
		});
	});
});
