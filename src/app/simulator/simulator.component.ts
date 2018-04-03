import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { setInterval } from 'timers';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { dbService } from '../shared/dbService';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';

interface Slot {
  id: number;
  isAvailable: boolean;
  polNum: string;
  pos: number;
  time: number;
  key?: string;
}

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit, OnDestroy {
  slotSubscription: Subscription;
  isLoading: boolean = false;

  passer: boolean = false;

  simulatorForm: FormGroup;

  dateNow: any;
  tempDate;
  hoursNow: any;
  xDate: any;
  convertedDate: any;

  simulatorDate: any;
  simulatorTime: any;
  simulatorMultiplier: any;
  simulatorDefragmented: any;

  //form variables
  timeList: any[] = ['Real-Time', 10,11,12,13,14,15,16,17,18,19];
  multipliers: any[] = ['1x', '2x', '3x'];
  defragmented: boolean = false;

  //arr_a1: any[] = [{ 'block': 'A', 'pos': 1, 'polNum': 'B2812KER' }] ;

  displayArray: any[];

  defragArray: any[] = [];
  defragDate: any;

  defragCollectionRef: AngularFirestoreCollection<Slot>;
  coll: any;

  slotCollectionRef: AngularFirestoreCollection<Slot>;
  collSlot: any;

  observableLength;

  constructor(private afs: AngularFirestore, private service: dbService, public snackBar: MatSnackBar) { }

  cars: Observable<Slot>;
  secondDoubler;

  initForm() {
    this.simulatorDate = '';
    this.simulatorTime = '';
    this.simulatorMultiplier = '';
    this.simulatorDefragmented = '';

    this.simulatorForm = new FormGroup({
      'date': new FormControl(this.simulatorDate, Validators.required),
      'time': new FormControl(this.simulatorTime),
      'multiplier': new FormControl(this.simulatorMultiplier),
      'defragmented': new FormControl(this.simulatorDefragmented)
    });
  }

  onSubmit() {
    this.passer = true;
    this.isLoading = true;
    this.service.setProgressBar(this.isLoading);
    console.log(this.defragmented);

    if(this.defragmented) {

    this.defragCollectionRef = this.afs.collection('defrag', ref => ref.where('date', '==', this.xDate).orderBy('id')); //still need to tweak this
    this.coll = this.defragCollectionRef.snapshotChanges().map(actions => { //make it so according to date selected
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    });

    this.slotSubscription = this.coll.subscribe(result => {
      console.log("Observable length: " + result.length);
      if(this.passer) {
      if(result.length == 60) {
        this.snackBar.open("Running defragmented simulation...", "Close", { duration: 2000 });
      }
      if(result.length < 60) {
        this.snackBar.open("No defragmentation for this date.", "Close", { duration: 2000 });
      }
    }
      this.passer = false;
      this.isLoading = false;
      this.service.setProgressBar(this.isLoading);
    });

  } else if(!this.defragmented) {

    this.slotCollectionRef = this.afs.collection('slots', ref => ref.where('date', '==', this.xDate).orderBy('id'));
    this.coll = this.slotCollectionRef.snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data }; 
      });
    });

    this.slotSubscription = this.coll.subscribe(result => { //unsubscribe after leaving simulator component! find out how.
      console.log("Observable length: " + result.length);
      if(this.passer) {
      if(result.length == 60) {
        this.snackBar.open("Running simulation...", "Close", { duration: 2000 }); //BUGS when initializing/defrag slots in Dashboard component After coming to simulator component
        console.log("something wrong with the snackbar flow !!");
      }
      if(result.length < 60) {
        this.snackBar.open("No reservation for this date yet.", "Close", { duration: 2000 });
      }
    }
      this.passer = false;
      this.isLoading = false;
      this.service.setProgressBar(this.isLoading);
    });


}

  }

  ngOnDestroy() {
    this.slotSubscription = new Subscription(() => console.log("formality"));
    this.slotSubscription.unsubscribe();
  }

  ngOnInit() {
    this.initForm();
    this.displayArray = [];
    this.tempDate = new Date();
    this.dateNow = new Date();

    let temp: any[];
    let alphabet;

    this.simulatorForm.controls.date.valueChanges.subscribe(dat => {
      console.log(dat);
      try {
        this.convertedDate = new Date(this.toYear(dat), this.toMonth(dat), this.toDate(dat));
        this.xDate = this.convertedDate;
        console.log(this.xDate);
        this.defragDate = new Date(this.xDate);
      } catch (e) {
        console.log(e);
      }
    });

    setInterval(() => {
      this.dateNow = new Date(); 
      this.hoursNow = this.dateNow.getHours();
      if(this.hoursNow < 10 || this.hoursNow > 19) {
        this.hoursNow = 19; //to prevent misprinting (2 becomes 12, 0 becomes 10 and so on)
      }
    }, 1000);

    //to avoid crash when simulator Comp is destroyed. (ngOnDestroy have to destroy something)
    this.slotSubscription = new Subscription(() => console.log("formality"));
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

}
