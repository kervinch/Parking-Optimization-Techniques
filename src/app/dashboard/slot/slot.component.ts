import { Component, OnInit } from '@angular/core';
import { OrderComponent } from '../../order/order.component';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { SlotModel } from './slot.model';
import { OnDestroy } from '@angular/core';

interface Order {
  name: string;
  polNum: string;
  date: Date;
  timeIn: Date;
  timeOut: Date;
}

interface Slot {
  id: number;
  polNum: string;
  pos: string;
  block: string;
  time: number;
  isAvailable: boolean;
}

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})

export class SlotComponent implements OnInit {
  //back end logic, basically they're getters
  orderCollections: AngularFirestoreCollection<Order>;
  orders: Observable<Order[]>;

  slotCollections: AngularFirestoreCollection<Slot>;
  slots: Observable<Slot[]>;

  //tester: number = 8;
  tester: number = 9;
  list: any[];

  constructor(private afs: AngularFirestore) { }

  //to get available slots
  size$ = new Subject<string>();
  queryObservable = this.size$.switchMap(size =>
    this.afs.collection('slots', ref => ref.where('isAvailable', '==', false).orderBy('id').orderBy('time')).valueChanges()
    //this.afs.collection('slots', ref => ref.orderBy('id','asc')).valueChanges()
  );

  ngOnInit() {
    //get orders code
    this.orderCollections = this.afs.collection('orders');
    this.orders = this.orderCollections.valueChanges();

    //get slots code
    this.slotCollections = this.afs.collection('slots');
    this.slots = this.slotCollections.valueChanges();

    // subscribe to changes
    this.queryObservable.subscribe(queriedItems => {
      //console.log(queriedItems);
     //this.list = queriedItems; //put queriedItems( data ) into array so value can be access individually
     //console.log(queriedItems[1]);
     this.list = queriedItems;
     console.log(this.list);
    });

    //execute query
    this.size$.next();

    
  }

}
