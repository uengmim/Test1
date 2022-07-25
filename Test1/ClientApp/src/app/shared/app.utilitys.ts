import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'gridCellData' })
export class GridCellDataPipe implements PipeTransform {
  transform(gridData: any): any {
    return gridData.data;
  }
}  
