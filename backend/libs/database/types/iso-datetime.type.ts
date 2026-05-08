import { Type, Platform, EntityProperty } from '@mikro-orm/core';

export class IsoDateTimeType extends Type<Date | undefined, string | undefined> {
  convertToDatabaseValue(value: Date | undefined): string | undefined {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value as string);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }

  convertToJSValue(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    return new Date(value);
  }

  getColumnType(_prop: EntityProperty, _platform: Platform): string {
    return 'text';
  }
}
