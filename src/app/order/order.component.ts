import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { OrderModel } from './order.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { Subject } from 'rxjs/Subject';
import { firestore } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { $ } from 'protractor';
import { MatSnackBar } from '@angular/material';
import { dbService } from '../shared/dbService';

interface Order {
  name: string;
  polNum: string;
  date: Date;
  timeIn: number;
  timeOut: number;
}

interface Slot {
  id: number;
  isAvailable: boolean;
  polNum: string;
  pos: number;
  time: number;
  key?: string;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {

  subscriptionPol: Subscription;
  subscriptionTwo: Subscription;

  isLoading: boolean = false;
  //Declarations (form group & back end setup)
  orderForm: FormGroup;
  orderCollections: AngularFirestoreCollection<Order>;
  orders: Observable<Order[]>;

  showSpinner = false;
  color = 'primary';
  mode = 'indeterminate';

  falser: boolean = true;


  //bunch of properties
  name: string;
  polNum: string;
  date: any;
  timeIn: number;
  timeOut: number;
  
  success: boolean = false;
  isLegit: boolean = false;

   //fill this with available slots array
  list: any[];
  arr: any[];
  tempo: Slot;
  timeOutArr: any[] = new Array();

  //used for querying available date-slot
  xDate: any;
  availables: any[];
  passer:boolean = true;
  removedList: any[];
  newDate: any;

   //to get available slots
  size$ = new Subject<string>();
  queryObservable = this.size$.switchMap(size => //remember to add .orderBy('date') later
    this.afs.collection('slots', ref => ref.where('isAvailable', '==', true).orderBy('date').orderBy('id').orderBy('time')).valueChanges()
  );

  opt$ = new Subject<any>();
  queryObservableTwo = this.opt$.switchMap(opt => //PROBLEM IS HERE .where('date', '==', opt)
    this.afs.collection('slots', ref => ref.where('isAvailable', '==', true).where('date', '==', this.xDate).where('time', '>=', opt)).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  met$ = new Subject<any>();
  queryObservableThree = this.met$.switchMap(met =>
    this.afs.collection('slots', ref => ref.where('date', '==', met)).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  tes$ = new Subject<any>();
  queryObservableTimeIn = this.tes$.switchMap(tes => //remember to add .orderBy('date') later
  this.afs.collection('slots', ref => ref.where('date', '==', tes).where('isAvailable', '==', true).orderBy('id')).valueChanges()
);

  pol$ = new Subject<string>();
  queryObservablePol = this.pol$.switchMap(pol => //remember to add .orderBy('date') later
    this.afs.collection('slots', ref => ref.where('date', '==', pol).orderBy('id')).valueChanges()
  );

  tempDate: number;

  generateSlots(date: Date) {

    console.log(this.tempDate);

  }

  beta: any;
  key: string;
  switcher: boolean = true;

  timeOutMinSetter(value: any) {
    console.log("Check In Value:  " + value);
    this.timeOutArr = new Array(); //initialize again so it doesn't stack up
    if (this.timeIn != undefined) {
    let x: number;
    try{
    x = this.removedList.findIndex(i => i.time == this.timeIn) + 1; //+1 because the minimum timeOut is timeIn+1
    for(let i=x; i<this.removedList.length; i++) {
      this.timeOutArr.push(this.removedList[i].time);
    } 
    console.log(this.timeOutArr); //check timeOut list
    } catch(e) {
      console.log(e);
    }
  }
  }

  onSubmit() {
    //for debug purposes
    console.log(this.orderForm);
    console.log(this.orders);
    console.log(this.name);
    console.log(this.timeIn);
    console.log(this.timeOut);
    console.log(this.polNum);
    
    //Convert ? Date to string, then convert to integer to get individual date, month, year; then input to fn
    console.log(this.date);
    this.switcher = true;
    this.naiveSwitch = true;
    
    this.newDate = new Date(this.toYear(this.date), this.toMonth(this.date),this.toDate(this.date)); //Convert date input from form to firestore storable format, timestamp
    this.pol$.next(this.newDate);

    this.opt$.next(this.timeIn); //execute query (naive) [queryObservableTwo]
  
    this.success = true;
    this.initForm();
}

  slotCollectionRef: AngularFirestoreCollection<Slot>;
  slots: any;

  constructor(private afs: AngularFirestore, public snackBar: MatSnackBar, public dbService: dbService) {
    this.slotCollectionRef = afs.collection('slots');
    this.slots = this.slotCollectionRef.snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    });
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

  updateAvailability(id: string) {
   this.slotCollectionRef.doc(id).update({ isAvailable : false });
  }

  updatePolNum(id: string, poln: string) {
    this.slotCollectionRef.doc(id).update({ polNum : poln });
  }

  updateDate(id: string, dat: Date) {
    this.slotCollectionRef.doc(id).update({ date : dat });
  }

  private initForm() {
    //bunch of declarations
    let orderName = '';
    let orderPolNum = '';
    let orderDate = '';
    let orderTimeIn;
    let orderTimeOut;
    let name = '';

    this.success = false;

    //create form group & validators
    this.orderForm = new FormGroup({
      'name': new FormControl(orderName, Validators.required),
      'polNum': new FormControl(orderPolNum, Validators.required),
      'date': new FormControl(orderDate, Validators.required),
      'timeIn': new FormControl(orderTimeIn, Validators.required),
      'timeOut': new FormControl(orderTimeOut, Validators.required)
    });
  }

  naiveSwitch: boolean;
  newBook: any[];

  ngOnDestroy() {
    this.subscriptionTwo.unsubscribe();
    this.subscriptionPol.unsubscribe();
  }

  ngOnInit() {
    //initialize form
    console.log(this.slots);
    this.initForm();

    //get order from backend code
    this.orderCollections = this.afs.collection('orders');
    this.orders = this.orderCollections.valueChanges();

    //subscribe to available slots and put it to list
    this.queryObservable.subscribe(queriedItems => {
    this.list = queriedItems;
    console.log(this.list);
    });
    //this.size$.next();

     this.subscriptionTwo = this.queryObservableTwo.subscribe(queriedItems => {
      console.log(queriedItems); //debug
      let sortedArr: any[];
      sortedArr = queriedItems.sort((a,b) => a.data.id < b.data.id ? -1 : a.data.id > b.data.id ? 1 : 0);
      console.log(sortedArr);
      
      //NAIVE APPROACH LOGIC - Some pretty complex IF condition; to choose slots with the same pos
      //ALRDY WORKING! But, it iterates x times where x is the number of TIME SLOTS booked. So error message is displayed although Naive approach alrd works totally!
      this.newBook = new Array();
      let diff = this.timeOut - this.timeIn;
      let allower: boolean = false; 
      if (this.naiveSwitch) {
      for(let i=1; i<7; i++) {
        for(let j=0; j<sortedArr.length; j++) {
          //if(sortedArr[j].data.pos == i) { //might good for performance if enables though
            allower = false;
             for(let k=0; k<(diff+1); k++) {
              if(sortedArr[j+k].data.time == this.timeIn+k && sortedArr[j+k].data.pos == i) {
                allower = true;
              } else {
                allower = false;
                this.naiveSwitch = false;
                break;
              }
             }
             if(allower) {
               for(let l=0; l<(diff+1); l++) {
                this.newBook.push(sortedArr[j+l]);
               }
               this.isLegit = true;
               this.naiveSwitch = false;
               break;
             }
             //}
        }
        if(allower) {
          break;
        }
      }
    }

      console.log(this.newBook); //check if NAIV APPROACH WORKS

      this.newDate = new Date(this.toYear(this.date), this.toMonth(this.date),this.toDate(this.date)); //Convert date input from form to firestore storable format, timestamp
      console.log("Unqiue Pol Num? : " + this.isUniquePolNum);

      if(this.isUniquePolNum) {

      if(this.newBook.length > 0) {
        this.switcher = true;
      if(this.switcher) { //execute NAIVE APPROACH
        try {
          for(let i=0; i<this.newBook.length; i++) {
            this.key = this.newBook[i].key;
            this.updateAvailability(this.key);
            this.updatePolNum(this.key, this.polNum);
            this.newDate = new Date(this.toYear(this.date), this.toMonth(this.date),this.toDate(this.date)); //Convert date input from form to firestore storable format, timestamp
            this.updateDate(this.key, this.newDate);
          }
          this.pol$.next(this.newDate);
          
          console.log("Slot successfully booked!");
          this.snackBar.open("Slot successfully booked!", "Close", { duration: 3000 });
          this.falser = false;
        } catch(e) {
          console.log(e);
        }
        this.switcher = false;
        this.newBook = new Array();
      }
    } else {
      if(this.falser) { 
        this.switcher = false;
        this.newBook = new Array();
        this.snackBar.open("Cannot book parking slots with some skipped times.", "Close", { duration: 3000 });
        console.log("Cannot book parking slots with some skipped times.");
        this.falser = false;
      }
    }
  } else {
    this.snackBar.open("Cannot book parking slots with existing police number. (duplicate)", "Close", { duration: 3000 });
    //console.log("Cannot book parking slots with some skipped times.");
  }

    //add user's order to back end IF data is legit
    if(this.isLegit) { //NOTE: QUERY BELOW DOESN'T INPUT NAME FOR SOME REASON
      this.afs.collection('orders').add({'name': this.name, 'polNum': this.polNum, 'date': this.newDate, 'timeIn': this.timeIn, 'timeOut': this.timeOut});
      this.isLegit = false;
    } else {
      console.log("User input not stored because data isn't legit.");
    }

    } 
    );

     
     this.queryObservableTimeIn.subscribe(queriedItems => {
      let uniqueArray = queriedItems;
      console.log(queriedItems);
      uniqueArray = this.removeDuplicates(uniqueArray, 'time');
      this.removedList = uniqueArray;
      console.log(this.removedList);
    });

     this.queryObservableThree.subscribe(queriedItems=> {
      this.availables = queriedItems;
      console.log(this.xDate);
      if(this.passer) {

      console.log(this.availables);
      console.log(this.availables.length);
      //generate whole parking slot for selected date
      if(this.availables.length < 60) {
        let ider = 1;
        let poser = 0;
        //gonna need a double for loop
        console.log("PLEASE WAIT FOR 5 SEC WHILE WE ARE WRITING SLOTS TO DB.")
        for(let i=0; i<6; i++) {
        let timer = 10; //change value of timer used to be 10 #IMPORTANT
        poser++;
          for(let j=0; j<10; j++) { //<10 for 60 slots. 24 for 144 slots #IMPORTANT
        this.afs.collection('slots').add({
          'date': this.xDate, //might need to add divident, 1,2. 1 for 20 min, 2 for 40min.
          'id': ider++,
          'isAvailable': true,
          'polNum': '',
          'pos': poser,
          'time': timer++
        });
      }
      }
      }
      this.passer = false;
    } //passer
    //this.showSpinner = false; no longer use progress spinner
    this.isLoading = false;
    this.dbService.setProgressBar(this.isLoading);
     });

    //subscribe to date changes live
    this.orderForm.controls.date.valueChanges.subscribe(dat => {
      this.tempDate = dat;
      console.log(this.tempDate);
      try{
        this.xDate = new Date(this.toYear(this.tempDate), this.toMonth(this.tempDate), this.toDate(this.tempDate));
        console.log(this.xDate);
        this.met$.next(this.xDate);
        this.tes$.next(this.xDate); 
        //this.showSpinner = true; no longer use progress spinner
        this.isLoading = true;
        this.dbService.setProgressBar(this.isLoading);

      } catch (e) {
        console.log("Date not selected yet");
      }
    });

    this.subscriptionPol = this.queryObservablePol.subscribe(queriedItems => {
      console.log(queriedItems);
      this.polTemp = queriedItems;
      console.log(this.polNum);
      //this.isUniquePolNum = true;
      for(let i=0; i<queriedItems.length; i++) {
        if(this.polNum.toUpperCase() == this.polTemp[i].polNum.toUpperCase()) { //.toUpperCase() is needed to make it case-not-sensitive
          this.isUniquePolNum = false;
          break;
        } else {
          this.isUniquePolNum = true;
          //break;
        }
      }
    });

  }

  isUniquePolNum: boolean;
  polTemp: any[];

  truer() {
    this.passer = true;
  }

  onClear() {
    this.initForm();
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

}
