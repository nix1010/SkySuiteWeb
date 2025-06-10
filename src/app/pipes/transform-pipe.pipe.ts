import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'transformPipe'})
export class TransformPipe implements PipeTransform {
  transform(input: any, functionToApply: (input: any, ...args: any[]) => any, ...args: any[]): any {
    return functionToApply(input, ...args);
  }
}
