import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Employee } from '../model/employee';
import { WorkData } from '../model/work-data';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  employeesRawData!: WorkData[];
  employeeSet = new Set();
  dataSource!: string[];

  constructor(
    private http: HttpClient
  ) { }

/**
 * get data from server
 */
  getWorkEntries() {
    return this.http.get<WorkData[]>("https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==")
  }
/**
 * transform data into array with names and hours, for displaying in table and pie chart
 */
  transformData(object: any) {
    let empArray: Employee[] = [];
    let arr: any[] = [];
    let arrName: any[] = [];
    let arrDuration: any[] = [];

    Object.keys(object).map(function (key) {
      arr.push({ [key]: object[key] })
    })

    for (let i = 0; i < arr.length; i++) {
      arrName = Object.entries(object).slice(0, 10).map(entry => entry[0]);
      arrDuration = Object.entries(object).slice(0).map(entry => entry[1]);
      if(arrName[i] !== undefined) {
        arr[i] = [arrName[i], arrDuration[i]]
        empArray.push(arr[i])
      } else {
        continue;
      }
    }
    return empArray
  }
  /**
   * create data set with employee names
   */
  createSetOfEmployees(employeesRawData: WorkData[]) {
    this.employeeSet = new Set(employeesRawData.map(emp =>
      emp.EmployeeName
    ));
    return this.employeeSet;
  }
  /**
   * calculate working hours 
   */
  calculateTime(endTime: string, startTime: string) {
    let duration = Math.abs(+new Date(startTime) - +new Date(endTime)) / 1000 / 60;
    return duration;
  }

}