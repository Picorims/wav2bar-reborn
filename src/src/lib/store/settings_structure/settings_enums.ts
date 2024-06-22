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

// see: https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums

export const ThemeOptions = {
    DEFAULT: "default",
    DARK: "dark",
    LIGHT: "light",
} as const;
export type ThemesType = typeof ThemeOptions[keyof typeof ThemeOptions];

export const LanguageOptions = {
    ENGLISH: "en",
} as const;
export type LanguagesType = typeof LanguageOptions[keyof typeof LanguageOptions];
