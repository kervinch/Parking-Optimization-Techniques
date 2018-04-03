import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { DataSource } from '@angular/cdk/collections';
import { dbService } from '../shared/dbService';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Pipe, PipeTransform } from '@angular/core';
import * as firebase from 'firebase';

interface Slot {
  id: number;
  isAvailable: boolean;
  polNum: string;
  pos: number;
  time: number;
  key?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading: boolean = false;
  selectedDate: any = new Date();
  dateNow: any;
  convertedDate: any = new Date();
  tempDate: number;
  
  dashboardForm: FormGroup;
  list: any[];

  defragSlots: any[];
  unavailables: any[];
  sortedUnavailables: any[] = [];
  keys: any[] = [];
  disableDefragmentation = true; //to control defragmentation button, to avoid double defragmentation to unintialized slots (defragSlots)
  disableInitialization = true; //to control intialization button, only enabled if date is selected

  displayedColumns = ['id', 'date','pos','time','isAvailable','polNum'];
  dataSource;
  arr: any[] = [];
  xDate;

  displayDefrag: any[];

  showSpinner = false;
  color = 'primary';
  mode = 'indeterminate';
  //value = 10;

  size$ = new Subject<string>();
  queryObservable = this.size$.switchMap(size => //remember to add .orderBy('date') later
    this.afs.collection('slots', ref => ref.where('date', '==', this.xDate).orderBy('id')).valueChanges()
  );

  /* to get selected date slots with ID (key)
  size$ = new Subject<string>();
  queryObservable = this.size$.switchMap(size =>
    this.afs.collection('slots', ref => ref.where('date', '==', this.xDate).orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );
  */

  gg$ = new Subject<string>();
  queryObservableTest = this.gg$.switchMap(gg => //remember to add .orderBy('date') later
    this.afs.collection('slots', ref => ref.orderBy('id')).valueChanges()
  ); //just to check total slots

  opt$ = new Subject<string>();
  queryObservableD = this.opt$.switchMap(opt =>
    this.afs.collection('defrag', ref => ref.where('date', '==', this.xDate).orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  final$ = new Subject<string>();
  queryObservableF = this.final$.switchMap(final =>
    this.afs.collection('defrag', ref => ref.where('date', '==', this.xDate).orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  slotCollectionRef: AngularFirestoreCollection<Slot>;
  coll: any;

  constructor(private afs: AngularFirestore, private slots: dbService, public snackBar: MatSnackBar) {
    this.slotCollectionRef = afs.collection('defrag');
    this.coll = this.slotCollectionRef.snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    });
  }

  ngOnInit() {
    setInterval(() => {
      this.dateNow = new Date();
    }, 1000);

    console.log("FIREBASE SERVER TIME " + firebase.database.ServerValue.TIMESTAMP.toString);

    this.queryObservableTest.subscribe(queriedValue => {
      console.log(queriedValue);
    });
    this.gg$.next(); //just to chceck total slots

    this.selectedDate = new Date();

    this.dashboardForm = new FormGroup({
      'selectedDate': new FormControl(this.selectedDate)
    });

    this.dashboardForm.controls.selectedDate.valueChanges.subscribe(dat => {

      console.log(dat);
      this.tempDate = dat;
      this.displayDefrag = [];

      try {

        this.convertedDate = new Date(this.toYear(this.tempDate), this.toMonth(this.tempDate), this.toDate(this.tempDate));
        this.xDate = this.convertedDate;

        try {
          this.showSpinner = true;
          this.isLoading = true;
          this.slots.setProgressBar(this.isLoading);
          
          this.size$.next(this.xDate);
          this.opt$.next(this.xDate); //move defrag slots to Global variable
          } catch(e) {
            console.log("Date not selected yet.");
          }

        this.dataSource = new SlotsDataSource(this.slots, this.afs, this);
        this.disableInitialization = false;
      } catch(e) {
        console.log("Please select a date.");
      }
      console.log(this.convertedDate);
      
    });

    this.queryObservable.subscribe(queriedItems => {
      this.arr = queriedItems;
      console.log(this.arr);
      this.showSpinner = false;
    });

    this.queryObservableD.subscribe(queriedItems => {
      this.defragSlots = queriedItems;
      this.isLoading = false;
      this.slots.setProgressBar(this.isLoading);
        //console.log(this.defragSlots);
    });

    this.queryObservableF.subscribe(queriedItems => {
      //this.defragSlots = queriedItems;
      this.displayDefrag = [];
      for(let i=0; i<this.defragSlots.length; i++) {
        this.displayDefrag.push(this.defragSlots[i].data);
      }
      this.isLoading = false;
      this.slots.setProgressBar(this.isLoading);
    });

  }

  initialize() {
    console.log(this.defragSlots);
    console.log(this.arr);
    let deto;
    try{ //defrag slots Initialization, happens every time u defrag
      for(let i=0; i<this.defragSlots.length; i++) {
        deto = new Date(this.arr[i].date); //create new date object to update it to 'date' field (which is of timestamp type)
        this.slotCollectionRef.doc(this.defragSlots[i].key).update({
          'date': deto,
          //might need to put divident, 1 for 20 min & 2 for 40 min
          'id': this.arr[i].id,
          'isAvailable': true,
          'polNum': '',
          'pos': this.arr[i].pos,
          'time': this.arr[i].time
        });
      }
      console.log("Defrag slots initialized.");
      this.snackBar.open("Defrag slots initialized.", "Close", { duration: 2000 });
    } catch(e) {
      console.log(e);
      this.snackBar.open("Please select a date before initializing.", "Close", { duration: 2000 });
    }
    this.disableDefragmentation = false;

  }

  defragmentation() {
    this.isLoading = true;
    this.slots.setProgressBar(this.isLoading);
    //Initialization
    this.sortedUnavailables = []; //key variable, initialize before defrag to avoid one defragmentation after the other problem
    this.keys = [];

    try{ //to update current deframentation slots, if any
      console.log(this.defragSlots);
    } catch(e) {
      console.log("No existing defragmentation slots.");
    }

    this.initialize();  

    //Get unavailable slots; isAvailable == false
    console.log(this.arr.filter( f => f.isAvailable == false)); //alrdy have this in control component
    this.unavailables = this.arr.filter(f => f.isAvailable == false);

    //get unique police numbers to filter in the next step
    let uniquePolNum = this.removeDuplicates(this.unavailables, 'polNum');
    console.log(uniquePolNum);

    //Sort unavailables in decreasing order of parking duration
      for(let i=0; i<uniquePolNum.length; i++) {
        let temp = this.unavailables.filter(f => f.polNum == uniquePolNum[i].polNum);
        let x = (temp[temp.length-1].time - temp[0].time) + 1;
        uniquePolNum[i].duration = x;
      }

      uniquePolNum.sort(function(a,b) {
        return parseInt(b.duration) - parseInt(a.duration);
      });
      console.log(uniquePolNum);

    //Push sorted uniquePolNum to sortedUnavailables to get decreasing duration slots!
    for(let i=0; i<uniquePolNum.length; i++) {
      this.sortedUnavailables.push(this.unavailables.filter(f => f.polNum == uniquePolNum[i].polNum));
    }

    console.log(this.sortedUnavailables);


    //RESERVATION DEFRAGMENTATION LOGIC BEGINS
    let posNum = 1;
    let counter = 0;
    let x = 0;
    let y = 0;
    let dummy;
    let passer = false;

    for(let i=0; i<this.sortedUnavailables.length; i++) {
      for(let posNum = 1; posNum<7; posNum++) {
        passer = false;
        console.log("posNUM: " + posNum);
        dummy = this.defragSlots.filter(f => f.data.pos == posNum);
        for(let j=0; j<this.sortedUnavailables[i].length; j++) {
          console.log("sortedUnavaialbles: " + this.sortedUnavailables[i].length);
          for(let k=0; k<10; k++) { //<10 TO USE WITH THE 60 SLOTS. OR 24 TO USE WITH 144 SLOTS #IMPORTANT
            console.log("k: " + k);
            console.log("dummy data time: " +dummy[k].data.time);
            console.log("sorted unavailables time: " + this.sortedUnavailables[i][j].time);
            if(dummy[k].data.isAvailable == true && dummy[k].data.time == this.sortedUnavailables[i][j].time) {
              console.log("match");
              counter++;
              console.log("counter+ " + counter);
              if(counter == this.sortedUnavailables[i].length) {
                console.log("inside inside");
                for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                  console.log("L: " + l + " K: " + k + " counter: " + counter + ", where K > counter");
                  dummy[l].data.isAvailable = false; //useless maybe
                  this.keys.push(dummy[l]);
                  this.keys[y].data.polNum = this.sortedUnavailables[i][j].polNum; //to put polnum into keys
                  y++;
                  x = this.defragSlots.findIndex(i => i.key == dummy[l].key);
                  this.defragSlots[x].data.isAvailable = false; //somewhat doesn't matter, i think
                }
                counter = 0; //reset counter
                console.log("success counter reset");
                passer = true;
                console.log("KEYS: " + this.keys);
                break; //doesn't matter even if doesn't exist
              }
              break;
            }else {
            }
          }
          console.log("outer ring");
        }
        counter = 0;
        console.log("counter reset");
        if(passer) {
          break;
        }
      }
    }

    console.log(this.keys); //defragmentation SHOULD be successful at this point
    //Put in police number

    //UPDATE this.keys to BITMAP / DB (firestore)
    for(let i=0; i<this.keys.length; i++) {
      this.slotCollectionRef.doc(this.keys[i].key).update({
        'isAvailable': false,
        'polNum': this.keys[i].data.polNum
      });
    }

    this.snackBar.open("Defragmentation successful.", "Close", { duration: 2000 });
    this.disableDefragmentation = true;

    this.final$.next(); 

    /* create 60 defrag slots
    try{
    for(let i=0; i<60; i++) { //Create 60 
    this.afs.collection('defrag').add({
      'date': this.arr[0].data.date,
      'id': this.arr[0].data.id,
      'isAvailable': true,
      'polNum': '',
      'pos': this.arr[0].data.pos,
      'time': this.arr[0].data.time
    });
  }
  console.log("Success adding defrags.");
} catch(e) {
  console.log("Can't add defrags yet.");
} */
  }

  createDefragSlots() { //CREATE SLOTS BEFORE DEFRAGMENTING FOR THE FIRST TIME
    console.log(this.arr);
    try{
      for(let i=0; i<60; i++) { //<144 to create 24 hr DEFRAG SLOTS. or 60 to create 10 hrs SLOT #IMPORTANT
      this.afs.collection('defrag').add({
        'date': this.arr[i].date,
        'id': this.arr[i].id,
        'isAvailable': true,
        'polNum': '',
        'pos': this.arr[i].pos,
        'time': this.arr[i].time
      });
      console.log(i);
    }
    console.log("Success adding defrags.");
  } catch(e) {
    console.log(e);
  }
}

  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
}

  simulate() {
    //console.log(this.defragSlots);
  }

  toDate(date: any) {
    return parseInt(date.substring(8,10));
  }

  toMonth(month: any) {
    return parseInt(month.substring(5,7))-1; //month start from 0; January is 0
  }

  toYear(year: any) {
    return parseInt(year.substring(0,4));
  }

  next() {
    this.selectedDate = new Date(this.toYear(this.tempDate), this.toMonth(this.tempDate), this.toDate(this.tempDate)+1);
  }

  }

export class SlotsDataSource extends DataSource<any> {
  constructor(private slots: dbService, private afs: AngularFirestore, private dbComp: DashboardComponent) {
    super();
    console.log(dbComp.convertedDate);
  }

  connect() {
    console.log(this.slots.getSlots(this.dbComp.convertedDate));
    return this.slots.getSlots(this.dbComp.convertedDate);
  }

  disconnect() {

  }
}

