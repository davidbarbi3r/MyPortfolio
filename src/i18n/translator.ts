import { I18N } from '~/utils/config';

import { en } from './en';
import { fr } from './fr';

type Translations = any;

const { locales } = I18N;

interface NestedObject {
  [key: string]: NestedObject | string | NestedObject[];
}

function getValueFromPath(obj: NestedObject, path: string): NestedObject | string | NestedObject[] | undefined {
  const keys = path.split('.');
  let value: NestedObject | string | NestedObject[] = obj;

  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = value[key];
    } else {
      return undefined; // Key not found
    }
  }

  return value;
}

function getStringFromPath(obj: NestedObject, path: string): string | undefined {
  const value = getValueFromPath(obj, path);
  return typeof value === 'string' ? value : undefined;
}

function getNestedObjectFromPath(obj: NestedObject, path: string): NestedObject | undefined {
  const value = getValueFromPath(obj, path);
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
}

function getListFromPath(obj: NestedObject, path: string): NestedObject[] | undefined {
  const value = getValueFromPath(obj, path);
  return Array.isArray(value) ? value : undefined;
}

export function useTranslations(lang: keyof typeof locales) {
  let translations: Translations;

  switch (lang) {
    case 'en':
      translations = en;
      break;
    case 'fr':
      translations = fr;
      break;
    default:
      translations = en;
      break;
  }

  return {
    t: function (key: string) {
      const value = getStringFromPath(translations, key);

      if (value !== undefined) {
        return value;
      } else {
        throw new Error(`Translation key "${key}" not found in "${lang}" locale`);
      }
    },
    tObject: function (key: string) {
      const value = getNestedObjectFromPath(translations, key);

      if (value !== undefined) {
        return value;
      } else {
        throw new Error(`Nested translation key "${key}" not found in "${lang}" locale`);
      }
    },
    tList: function (key: string) {
      const value = getListFromPath(translations, key);

      if (value !== undefined) {
        return value;
      } else {
        throw new Error(`List translation key "${key}" not found in "${lang}" locale`);
      }
    },
  };
}
