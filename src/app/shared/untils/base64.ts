import { AnyJson } from '@shared/interfaces/common';
import { Base64 } from 'js-base64';

export type CodeJsonType = 'encode' | 'decode'

export function codeJson(source: AnyJson, type:CodeJsonType = 'encode'): AnyJson {
  const result = {};
  for (const attr in source) {
    if (source.hasOwnProperty(attr)) {
      result[Base64[type](attr)] = Base64[type](source[attr]);
    }
  }
  return result;
}
