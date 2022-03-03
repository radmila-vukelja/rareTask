import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/model/employee';
import { EmployeesService } from 'src/app/services/employees.service';
import { WorkData } from 'src/app/model/work-data';
import { ChartOptions, ChartType } from 'chart.js';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employeesRawData!: WorkData[];
  employeeSet = new Set();
  employees!: Employee[];
  displayedColumns: string[] = ['EmployeeName', 'Duration']
  dataSource!: string[];

  pieChartType: ChartType = 'pie';
  lowHours = false;

  pieChartData = {
    labels: [''],
    datasets: [{
      label: 'My First Dataset',
      data: [0],
      hoverOffset: 8
    }]
  };

  pieChartOptions: ChartOptions = {
    responsive: false,
  };
  constructor(
    private employeesService: EmployeesService
  ) {

  }

  ngOnInit(): void {
    this.getData();
  }

  /**
   * get server data and populate table and pie chart with transformed data
   */

  getData() {
    this.employeesService.getWorkEntries().subscribe(
      data => {
        this.employeesRawData = data;
        this.dataSource = this.aggregateRawEmployeeData(this.employeesRawData);
        this.pieChartData.labels = this.getChartLabel(this.dataSource);
        this.pieChartData.datasets[0].data = this.getChartData(this.dataSource);
      },
      error => {
        console.log(error)
      })

  }
    /**
     * create data set with employee names
     * converted into object each element of employeeSet 
     * loop through all raw data from server
     * for every entry of employee [i] where DeletedOn = null, add calculated hours by substracting start time from endtime 
     */
  aggregateRawEmployeeData(employeesRawData: WorkData[]) {

    this.employeeSet = this.employeesService.createSetOfEmployees(this.employeesRawData);

    let object: any = {};
    this.employeeSet.forEach(element => {
      object[element + ''] = 0;
    })

    for (let i of employeesRawData) {
      if (object[i.DeletedOn] == null) { //if entry contains a value for DeletedOn attr, skip that entry
        continue;
      }
      object[i.EmployeeName] += this.employeesService.calculateTime(i.EndTimeUtc, i.StarTimeUtc)
    }
    for (let i in object) {
      object[i] = Math.round(object[i] / 60);
    }
    object = this.employeesService.transformData(object);
    return object
  }

  /**
   * get data for populating pie chart, from previously transformed data
   */

  getChartData(dataSource: any) {
    let data: any[] = []
    for (let i = 0; i < dataSource.length; i++) {
      data.push(dataSource[i][1])
    }
    return data;
  }

  getChartLabel(dataSource: any) {
    let lab: string[] = [];
    for (let i = 0; i < dataSource.length; i++) {
      lab.push(dataSource[i][0])
    }
    return lab
  }

}
