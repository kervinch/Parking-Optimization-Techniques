import { Component, OnInit, Input } from '@angular/core';
import { dbService } from '../shared/dbService';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  showProgressBar = false;

  constructor(public dbService: dbService) { }

  ngOnInit() {
    this.dbService.isLoading.subscribe( data => this.showProgressBar = data );
  }

  ngOnDestroy() {
    this.dbService.isLoading.unsubscribe();
  }

}
