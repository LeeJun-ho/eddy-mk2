import { Type, Platform, EntityProperty } from '@mikro-orm/core';

export class IsoDateTimeType extends Type<Date | undefined, string | undefined> {
  convertToDatabaseValue(value: Date | undefined): string | undefined {
    if (!value) return undefined;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }

  convertToJSValue(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    return new Date(value);
  }

  getColumnType(_prop: EntityProperty, _platform: Platform): string {
    return 'text';
  }
}
