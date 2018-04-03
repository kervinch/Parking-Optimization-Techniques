import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { DataSource } from '@angular/cdk/collections';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { dbService } from '../shared/dbService';
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
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.css']
})
export class CancelComponent implements OnInit, OnDestroy {

  subscriptionOne: Subscription;
  subscriptionTwo: Subscription;
  subscriptionRef: Subscription;


  isLoading: boolean = false;

  cancelForm: FormGroup;
  cancelDate: any;
  tempDate: any;
  availables: any[];
  toBeCanceled: any[];

  //properties
  xDate;
  xPolNum;

  displayedColumns = ['id', 'date','pos','time','isAvailable','polNum'];
  dataSource;

  falser: boolean = true;

  slotCollectionRef: AngularFirestoreCollection<Slot>;
  slots: any;

  met$ = new Subject<any>();
  queryObservableOne = this.met$.switchMap(met =>
    this.afs.collection('slots', ref => ref.where('date', '==', met).orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  exe$ = new Subject<any>();
  queryObservableTwo = this.exe$.switchMap(exe =>
    this.afs.collection('slots', ref => ref.where('date', '==', this.xDate).where('polNum', '==', this.xPolNum).orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  constructor(private service: dbService, private afs: AngularFirestore, public snackBar: MatSnackBar, public dbService: dbService) {
    this.slotCollectionRef = afs.collection('slots');
    this.slots = this.slotCollectionRef.snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    });
   }

  ngOnInit() {
    this.initForm();

    this.subscriptionOne = this.queryObservableOne.subscribe(queriedItems => {
      this.availables = queriedItems;
      this.isLoading = false;
      this.dbService.setProgressBar(this.isLoading);
      console.log(this.availables);
    });

    this.cancelForm.controls.date.valueChanges.subscribe(dat => {
      this.tempDate = dat;
      console.log(this.tempDate);
      try {
        this.xDate = new Date(this.toYear(this.tempDate), this.toMonth(this.tempDate), this.toDate(this.tempDate));
        this.met$.next(this.xDate);
        this.dataSource = new SlotsDataSource(this.service, this.afs, this);
        this.isLoading = true;
        this.dbService.setProgressBar(this.isLoading);
      } catch(e) {
        console.log("Date not selected yet.")
      }

    });

    this.subscriptionTwo = this.queryObservableTwo.subscribe(queriedItems => {
      //this.falser = true;
      this.toBeCanceled = queriedItems;
      console.log(queriedItems);
      if(this.toBeCanceled.length == 0) {
        console.log("Police number NOT found!");
        this.dbService.setProgressBar(this.isLoading);
        if (this.falser) {
          this.snackBar.open("Police number NOT found!", "Close", { duration: 2000 });
        }
      }
     else {
      try{
      let iterateFor = this.toBeCanceled.length;
      for(let i=0; i<iterateFor; i++) {
        this.slotCollectionRef.doc(this.toBeCanceled[i].key).update({
          id: this.toBeCanceled[i].data.id,
          isAvailable: true,
          polNum: '',
          pos: this.toBeCanceled[i].data.pos,
          time: this.toBeCanceled[i].data.time,
          date: this.toBeCanceled[i].data.date
        });
      }
      this.isLoading = false;
      this.dbService.setProgressBar(this.isLoading);
      this.snackBar.open("Booked slots successfully deleted.", "Close", { duration: 2000 });
      this.falser = false;
    } catch(e) {
      console.log(e);
      this.isLoading = false;
      this.dbService.setProgressBar(this.isLoading);
      this.snackBar.open("Something is wrong.", "Close", { duration: 2000 });
      console.log("Something is wrong.");
    }
  }
  
    });

  }

  ngOnDestroy() {
    this.subscriptionOne.unsubscribe();
    this.subscriptionTwo.unsubscribe();
  }

  private initForm() {
    this.cancelDate = '';
    this.xPolNum = '';

    this.cancelForm = new FormGroup({
      'date': new FormControl(this.cancelDate, Validators.required),
      'polNum': new FormControl(this.xPolNum, Validators.required),

    });
  }

  onSubmit() {
    this.falser = true;
    this.exe$.next();
  }

  onClear() {
    this.initForm();
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

export class SlotsDataSource extends DataSource<any> {
  constructor(private service: dbService, private afs: AngularFirestore, private cnComp: CancelComponent) {
    super();
    console.log(cnComp.xDate);
  }

  connect() {
    console.log(this.cnComp.xDate);
    return this.service.getCancelable(this.cnComp.xDate);
  }

  disconnect() {

  }
}
