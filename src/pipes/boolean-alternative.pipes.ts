import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toAlt'})
export class BooleanAlternativePipe implements PipeTransform {
  transform(value) {
    return value ? 'O' : 'X';
  }
}

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push({value: value[key]});
    }
    return keys;
  }
}