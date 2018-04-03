import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { dbService } from '../shared/dbService';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort, MatCheckbox } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import { query } from '@angular/core/src/animation/dsl';
import { FormGroup, FormControl } from '@angular/forms';

interface Slot {
  id: number;
  isAvailable: boolean;
  polNum: string;
  pos: number;
  time: number;
  key?: string;
}

interface Data {
  polNum: string;
  timeIn: number;
  timeOut: number;
  duration?: number;
}

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit {
  //30 test case
  //total time slot fitted / 9600
  /*
mockaroo.com to generate random data => polNum: timeIn: timeOut

rand1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(random(0,19),1)
rand2 = random(1,9999)
rand3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(random(0,19),1)
rand4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(random(0,19),1)
polNum= rand1 +' '+ rand2.to_s + ' ' + rand3+rand4                              fx

timeIn: 10 - 18,                                                                normal

timeOut: random(timeIn+1, 19)                                                   fx
  
API created: https://my.api.mockaroo.com/thesis.json?key=f8b75f80
  */
  displayedColumns = ['polNum', 'timeIn', 'timeOut', 'duration'];
  displayedColumns2 = ['algorithm', 'timeSlot', 'orderSlot', 'performance'];
  gg;
  dataSource;
  dataSource2;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  obj;
  obj1;
  obj2;
  obj3;
  objM1;

  data;
  firstfit: any[] = new Array();
  R1: any[] = new Array();
  R2: any[] = new Array();
  R3: any[] = new Array();
  R1Modified = new Array();
  R1Modified2 = new Array();
  R1Modified3 = new Array();
  R2Modified = new Array();

  newFirstfit: any[];
  newR1: any[] = [];
  newR2: any[] = [];
  newR3: any[] = [];
  newR1Modified: any[] = [];
  newR1Modified2: any[] = [];
  newR1Modified3: any[] = [];
  newR2Modified: any[] = [];

  checkboxFirstfit;
  checkboxR1;
  checkboxR2;
  checkboxR3;
  checkboxR1M;
  checkboxR1M2;
  checkboxR1M3;
  checkboxR2M;

  timeslotFirstfit;
  timeslotR1;
  timeslotR2;
  timeslotR3;
  timeslotR1Modified;
  timeslotR1Modified2;
  timeslotR1Modified3;
  timeslotR2Modified;

  dataTotalTimeSlot = 0;

  orderslotFirstfit;
  orderslotR1;
  orderslotR2;
  orderslotR3;
  orderslotR1Modified;
  orderslotR1Modified2;
  orderslotR1Modified3;
  orderslotR2Modified;

  performanceFirstfit;
  performanceR1;
  performanceR2;
  performanceR3;
  performanceR1Modified;
  performanceR1Modified2;
  performanceR1Modified3;
  performanceR2Modified;

  controlForm: FormGroup;
  selected: any;
  selectedDisplay;

  sortedUnavailables: any[] = [];

  firstRow = new Array();
  numberOfPos = new Array();

  ALGORITHM_RESULTS;

  colorArray = ['red','blue', 'green', 'black', 'cyan', 'crimson', 'purple', 'yellow'];
  randomColor = this.colorArray[Math.floor(Math.random() * this.colorArray.length)];

  slotCollectionRef: AngularFirestoreCollection<Slot>;
  slots: any;

  first$ = new Subject<string>();
  firstfitObservable = this.first$.switchMap(first => //remember to add .orderBy('date') later
    this.afs.collection('first-fit', ref => ref.orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  one$ = new Subject<string>();
  R1Observable = this.one$.switchMap(one => //remember to add .orderBy('date') later
    this.afs.collection('R1', ref => ref.orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  two$ = new Subject<string>();
  R2Observable = this.two$.switchMap(two => //remember to add .orderBy('date') later
    this.afs.collection('R2', ref => ref.orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );

  three$ = new Subject<string>();
  R3Observable = this.three$.switchMap(three => //remember to add .orderBy('date') later
    this.afs.collection('R3', ref => ref.orderBy('id')).snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    })
  );


  constructor(private afs: AngularFirestore, private service: dbService, public snackBar: MatSnackBar) {
    this.slotCollectionRef = afs.collection('first-fit');
    this.slots = this.slotCollectionRef.snapshotChanges().map(actions => {
      return actions.map(action => {
        const data = action.payload.doc.data() as Slot;
        const key = action.payload.doc.id;
        return { key, data };
      });
    });
   }



   getDuration() {
     console.log(this.data);
    for(let i=0; i<this.data.length; i++) {
      this.data[i].duration = (this.data[i].timeOut - this.data[i].timeIn) + 1; //because timeIn itself is included
    }

    this.gg = this.data;
    this.dataSource = new MatTableDataSource<Data>(this.gg);
    //this.dataSource.paginator = this.paginator; //if use mockaroo, use this

    //console.log(this.gg);
   }

   ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; //if offline random generator, use this
    this.dataSource.sort = this.sort;
   }

   createRandomData() {
     let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

     let policeNumber = letters.charAt(Math.floor(Math.random()*letters.length)) +
                        " " +
                        (Math.floor(Math.random() * 9999) + 1) +
                        " " +
                        letters.charAt(Math.floor(Math.random()*letters.length)) +
                        letters.charAt(Math.floor(Math.random()*letters.length));
    
     let randomIn = Math.floor((Math.random() * 48) + 1); //changed from 47 to 48 23 Mar

     let randomOut = Math.floor((Math.random() * (48-randomIn)) + randomIn); //was +1 before 14 March, can be put in Chptr4 ' Program Evolution'

     let obj = {"polNum": policeNumber, "timeIn": randomIn, "timeOut": randomOut};

     return obj;
   }

   createOfflineSlots() {
     let time;
     let pos;

    //firstfit
    let id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.firstfit.push(this.obj);  
        id++;
      }
    }
    console.log(this.firstfit);

    for(let i=1; i<201; i++) { //used to be 10; used to be 6; can 200
      this.numberOfPos.push(i);
    }

    //R1
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R1.push(this.obj);  
        id++;
      }
    }

    //R2
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R2.push(this.obj);  
        id++;
      }
    }

    //R3
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R3.push(this.obj);  
        id++;
      }
    }

    //R1modified
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R1Modified.push(this.obj);  
        id++;
      }
    }

    //R1modified2
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R1Modified2.push(this.obj);  
        id++;
      }
    }

    //R1modified3
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R1Modified3.push(this.obj);  
        id++;
      }
    }

    //R2modified
    id = 1;
    for(let i=0; i<200; i++) {
      for(let j=0; j<48; j++) {
        this.obj = {'key': '' , 'data': {'id': id, 'polNum': '', 'time': j+1, 'isAvailable': true, 'pos': i+1}};
        this.R2Modified.push(this.obj);  
        id++;
      }
    }
    
   }

   applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
    this.data = new Array(); //OFFLINE RANDOM
    for(let i=0; i<1000; i++) {
      this.data.push(this.createRandomData());
    }
    console.log(this.data);

    // KEY TO OFFLINE ANALYTICS
    this.createOfflineSlots();
    this.getDuration(); //for offline random generator; enable later

    //find total time slot from 1000 data
    for(let i=0; i<this.data.length; i++) {
      this.dataTotalTimeSlot = this.dataTotalTimeSlot + this.data[i].duration;
    }
    
    this.firstRow.push(" ");
    for(let i=0; i<48; i++) {
      this.firstRow.push(i+1);
    }
    //console.log(this.firstRow);

    /*console.log(this.firstfit);
    console.log(this.R1);
    console.log(this.R2);
    console.log(this.R3);
    console.log(this.R1Modified); */

    
    
    /*this.service.getData().subscribe( //get JSON from API, in service //perlu tulis di evolution?
      data => this.data = data,
      error => alert(error),
      () => this.getDuration()
    );*/

    //initial checkboxes, all is ticked
    this.checkboxFirstfit = true;
    this.checkboxR1 = true;
    this.checkboxR2 = true;
    this.checkboxR3 = true;
    this.checkboxR1M = true;
    this.checkboxR1M2 = true;
    this.checkboxR1M3 = true;
    this.checkboxR2M = true;

    this.firstfitObservable.subscribe(queriedValue => {
      this.firstfit = queriedValue;
      console.log(this.firstfit);
    });

    this.R1Observable.subscribe(queriedValue => {
      this.R1 = queriedValue;
      console.log(this.R1);
    });

    this.R2Observable.subscribe(queriedValue => {
      this.R2 = queriedValue;
      console.log(this.R2);
    });

    this.R3Observable.subscribe(queriedValue => {
      this.R3 = queriedValue;
      console.log(this.R3);
    });

    this.controlForm = new FormGroup({
      'selectedAlgorithm': new FormControl()
    });

    this.controlForm.controls.selectedAlgorithm.valueChanges.subscribe(dat => {
      console.log("Dat value: " + dat);
      switch(this.selected) {
        case 'firstfit':
          this.selectedDisplay = this.firstfit;
          break;
        case 'R1':
          this.selectedDisplay = this.R1;
          break;
        case 'R2':
          this.selectedDisplay = this.R2;
          break;
        case 'R3':
          this.selectedDisplay = this.R3;
          break;
        case 'R1Modified':
          this.selectedDisplay = this.R1Modified;
          break;
        case 'R1Modified2':
          this.selectedDisplay = this.R1Modified2;
          break;
        case 'R1Modified3':
          this.selectedDisplay = this.R1Modified3;
          break;
        case 'R2Modified':
          this.selectedDisplay = this.R2Modified;
          break;
          
      }

    });



    /*this.first$.next();
    this.one$.next();
    this.two$.next();
    this.three$.next();*/


  }

//simplex optimasi
//neural network
//kasih warna tiap order
//display slot terisi berapa
//display order yang diterima berapa

  triggerFirstfit() {
    console.log(this.data);
    console.log(this.firstfit);

    let t0 = performance.now();

    this.newFirstfit = new Array();
    let diff: any;
    let dummy;
    let passer = 0;
    let temp: any[] = new Array();
    let allower = false;

    for(let i=0; i<this.data.length; i++) { 
      diff = this.data[i].timeOut - this.data[i].timeIn; 
      for(let j=1; j<201; j++) {  
        dummy = this.firstfit.filter(f => f.data.pos == j); 
        for(let k=0; k<dummy.length; k++) { 
          if(dummy[k].data.time == this.data[i].timeIn && dummy[k].data.isAvailable == true) {  
            for(let l=0; l<(diff+1); l++) {
              if((this.data[i].timeIn+l) == dummy[k+l].data.time && dummy[k+l].data.isAvailable == true) {
                passer++;
              }
              if(passer == (diff+1)) {
                for(let m=0; m<(diff+1); m++) {
                  temp.push(this.firstfit.filter(f => f.data.pos == j && f.data.time == this.data[i].timeIn+m));
                  this.firstfit[this.firstfit.findIndex(f => f.data.pos == j && f.data.time == this.data[i].timeIn+m)].data.isAvailable = false;
                  this.firstfit[this.firstfit.findIndex(f => f.data.pos == j && f.data.time == this.data[i].timeIn+m)].data.polNum = this.data[i].polNum;
                  dummy[k+m].data.isAvailable = false;
                  dummy[k+m].data.polNum = this.data[i].polNum;
                  this.newFirstfit.push(dummy[k+m]);
                }
                passer = 0;
                allower = true;

                break;
              }
            }
            passer = 0;
            if(allower) {
              break;
            }
          }
          if(allower) {
            break;
          }
        }
        if(allower) {
          allower = false;
          break;
        }
      }
    }
// passer = 0;
    console.log(this.newFirstfit);
    //console.log(temp);
    this.timeslotFirstfit = this.newFirstfit.length;
    let tempSlot = new Array();
    for(let i=0; i<this.newFirstfit.length; i++) {
      tempSlot.push(this.newFirstfit[i].data);
    }
    let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
    console.log(uniquePolNum);
    this.orderslotFirstfit = uniquePolNum.length;

    let t1 = performance.now();
    this.performanceFirstfit = t1 - t0;
    console.log("Performance of the first-fit algorithm is: " + this.performanceFirstfit + "milliseconds.");

    console.log(this.R1);
    
  }

//find about big O & big theta

  triggerR1() { //can be modified; find the minimum difference between Sj and Fa; and (maybe) find minimum difference between the timeIn and timeOut of that particular condition
    let t0 = performance.now();
    this.newR1 = new Array();
    let tempArray = new Array();
    let R1Unavailables = new Array();
    let readyR1 = new Array();
    for(let i=0; i<this.data.length; i++) {
      tempArray.push(this.data[i]);
      tempArray[i].flag = false; //to mark, if this slot is compatible with other
    }

    tempArray.sort(function(a,b) { //sort according to finish times in ascending order
      return a.timeOut - b.timeOut;
    });

    console.log(tempArray);
    //let dumpArray = tempArray;
    let found = false;
    let iterate = true;

    R1Unavailables.push(tempArray[0]);
    tempArray[0].flag = true;

    while(iterate) {
      found = false;
    for(let i=1; i<tempArray.length; i++) {
      if(tempArray[i].timeIn > R1Unavailables[R1Unavailables.length-1].timeOut && tempArray[i].flag == false) {
        tempArray[i].flag = true;
        R1Unavailables.push(tempArray[i]);
        found = true;
        break;
      } 
    }
    if(!found) {
      let dumpArray = tempArray.filter(f => f.flag == false);
      try{
        tempArray[tempArray.findIndex(i => i.polNum == dumpArray[0].polNum)].flag = true;
        R1Unavailables.push(dumpArray[0]);
      }catch(e){ console.log(e);}

    }
    for(let i=0; i<tempArray.length; i++) {
      if(tempArray[i].flag == false) {
        iterate = true;
        break;
      } else if(tempArray[i].flag == true) {
        iterate = false;
      }
    }
  }

  console.log(R1Unavailables);

  //find duration of each order in data
  for(let i=0; i<R1Unavailables.length; i++) {
    R1Unavailables[i].duration = (R1Unavailables[i].timeOut - R1Unavailables[i].timeIn) + 1; //because timeIn itself is included
  }

  for(let i=0; i<R1Unavailables.length; i++) {
    readyR1.push([]);
    for(let j=0; j<R1Unavailables[i].duration; j++) {
      let obj = 
      {
        "isAvailable": false,
        "polNum": R1Unavailables[i].polNum,
        "time": R1Unavailables[i].timeIn+j
      }
      readyR1[i].push(obj); 
    }
  }

  console.log(readyR1);

//part2

    //RESERVATION DEFRAGMENTATION LOGIC BEGINS
    let posNum = 1;
    let counter = 0;
    let x = 0;
    let y = 0;
    let dummy;
    let passer = false;

    for(let i=0; i<readyR1.length; i++) {
      for(let posNum = 1; posNum<201; posNum++) {
        passer = false;
        dummy = this.R1.filter(f => f.data.pos == posNum);
        for(let j=0; j<readyR1[i].length; j++) {
          for(let k=0; k<48; k++) { //#IMPORTANT
            if(dummy[k].data.isAvailable == true && dummy[k].data.time == readyR1[i][j].time) {
              counter++;
              if(counter == readyR1[i].length) {
                for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                  dummy[l].data.isAvailable = false;
                  this.newR1.push(dummy[l]);
                  this.newR1[y].data.polNum = readyR1[i][j].polNum; //to put polnum into keys
                  y++;
                  //console.log(dummy[l]);
                  x = this.R1.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                  //x = this.R1.findIndex(i => i.key == dummy[l].key); compatible with online slots
                  this.R1[x].data.isAvailable = false; //somewhat doesn't matter, i think
                }
                counter = 0; //reset counter
                passer = true;
                break; //doesn't matter even if doesn't exist
              }
              break;
            }else {
            }
          }
        }
        counter = 0;
        if(passer) {
          break;
        }
      }
    }

    console.log(this.newR1); //defragmentation SHOULD be successful at this point
    let t1 = performance.now();
    this.performanceR1 = t1 - t0;
    console.log("Performance of the R1 algorithm is: " + this.performanceR1 + "milliseconds.");

    this.timeslotR1 = this.newR1.length; //time slots filled
    let tempSlot = new Array();
    for(let i=0; i<this.newR1.length; i++) {
      tempSlot.push(this.newR1[i].data);
    }
    let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
    console.log(uniquePolNum);
    this.orderslotR1 = uniquePolNum.length;
  }

  triggerR2() {
    let t0 = performance.now();
    //get from API
    //this.sortedUnavailables = []
    this.sortedUnavailables = new Array();
    let tempArray = new Array();

    //find duration of each order in data
    for(let i=0; i<this.data.length; i++) {
      tempArray.push(this.data[i]);
    }
    
    for(let i=0; i<tempArray.length; i++) {
      this.sortedUnavailables.push([]);
      for(let j=0; j<tempArray[i].duration; j++) {
        let obj = 
        {
          "isAvailable": false,
          "polNum": tempArray[i].polNum,
          "time": tempArray[i].timeIn+j
        }
        this.sortedUnavailables[i].push(obj); 
      }
    }

    console.log(this.sortedUnavailables);


this.sortedUnavailables.sort(function(a,b) { //sort according to length (duration of each order)
  return b.length - a.length;
});

/*this.sortedUnavailables.sort(function(a,b) { //sort according to length (duration of each order)
  return a.length - b.length;
});*/


console.log(this.sortedUnavailables);

    //RESERVATION DEFRAGMENTATION LOGIC BEGINS
    let posNum = 1;
    let counter = 0;
    let x = 0;
    let y = 0;
    let dummy;
    let passer = false;

    for(let i=0; i<this.sortedUnavailables.length; i++) {
      for(let posNum = 1; posNum<201; posNum++) {
        passer = false;
        dummy = this.R2.filter(f => f.data.pos == posNum);
        for(let j=0; j<this.sortedUnavailables[i].length; j++) {
          for(let k=0; k<48; k++) { //<10 TO USE WITH THE 60 SLOTS. OR 24 TO USE WITH 144 SLOTS #IMPORTANT
            if(dummy[k].data.isAvailable == true && dummy[k].data.time == this.sortedUnavailables[i][j].time) {
              counter++;
              if(counter == this.sortedUnavailables[i].length) {
                for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                  dummy[l].data.isAvailable = false; //useless maybe
                  this.newR2.push(dummy[l]);
                  this.newR2[y].data.polNum = this.sortedUnavailables[i][j].polNum; //to put polnum into keys
                  y++;
                  x = this.R2.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                  //x = this.R2.findIndex(i => i.key == dummy[l].key); compatible with online slots
                  this.R2[x].data.isAvailable = false; //somewhat doesn't matter, i think
                }
                counter = 0; //reset counter
                passer = true;
                break; //doesn't matter even if doesn't exist
              }
              break;
            }else {
            }
          }
        }
        counter = 0;
        if(passer) {
          break;
        }
      }
    }

    console.log(this.newR2); //defragmentation SHOULD be successful at this point
    let t1 = performance.now();
    this.performanceR2 = t1 - t0;
    console.log("Performance of the R2 algorithm is: " + this.performanceR2 + "milliseconds.");

    this.timeslotR2 = this.newR2.length; //time slots filled
    let tempSlot = new Array();
    for(let i=0; i<this.newR2.length; i++) {
      tempSlot.push(this.newR2[i].data);
    }
    let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
    console.log(uniquePolNum);
    this.orderslotR2 = uniquePolNum.length;

    //kadang hasil time slot fitted bisa beda tapi orders sama. ini karena order yang beda yang ditempatkan

  }

  createSlots() { //CREATE SLOTS BEFORE DEFRAGMENTING FOR THE FIRST TIME
    let id = 1;
    let pos = 1;
    let time = 10;
    try{
      for(let i=0; i<6; i++) {
        for(let j=0; j<10; j++) { //<144 to create 24 hr DEFRAG SLOTS. or 60 to create 10 hrs SLOT #IMPORTANT
          this.afs.collection('R3').add({ //collection is changeable
          'id': id,
          'isAvailable': true,
          'polNum': '',
          'pos': pos,
          'time': time
        });
        id++;
        time++;
      }
      time = 10;
      pos++;
    }
    console.log("Success adding first fits.");
  } catch(e) {
    console.log(e);
  }
}

triggerR3() {
  //console.log(this.R3.filter(f => f.data.time == 13 && f.data.isAvailable == true && f.data.pos == 2));

  console.log(this.R3);
  let t0 = performance.now();
  let freeSpaceVector = new Array();
  let freeSpaceCount = new Array();
  let storeId = new Array();
  let innerPasser = false;
  let passer = false;

  for(let i=0; i<200; i++) {
    freeSpaceCount.push(48);
  }

  console.log(freeSpaceCount);

  for(let i=0; i<this.data.length; i++) { //loop through random data
    for(let j=0; j<freeSpaceCount.length; j++) {  //loop through free space vector
      if(freeSpaceCount[j] >= this.data[i].duration) { //check if free space is enough for the next reservation
        let temp = this.R3.filter( f => f.data.pos == (j+1));
        storeId = new Array();
        passer = false;
        for(let k=0; k<temp.length; k++) {
          if(temp[k].data.time == this.data[i].timeIn && temp[k].data.isAvailable == true) {  //check if slot have contiguous free space
            //do sth
            for(let l=0; l<this.data[i].duration; l++) { //contiguous logic; loop through duration
              if(temp[k+l].data.time == (this.data[i].timeIn+l) && temp[k+l].data.isAvailable == true) {
                passer = true;
                storeId.push(temp[k+l]); //to update later
              } else {
                passer = false;
                storeId = new Array();
                break;
              }
            }
            if(passer) {
              let indexToChange;
              for(let m=0; m<storeId.length; m++) {
                indexToChange = this.R3.findIndex(i => i.data.id == storeId[m].data.id);
                this.R3[indexToChange].data.isAvailable = false;
                this.R3[indexToChange].data.polNum = this.data[i].polNum;
              }
              freeSpaceCount[j] = freeSpaceCount[j] - this.data[i].duration;
              break;
            }
          }
        }
      } else {
        console.log("Skip."); //search for next slot
      }
      if(passer) {
        passer = false;
        break;
      }
    }
  }

  
    for(let i=0; i<this.R3.length; i++) {
      if(this.R3[i].data.isAvailable == false) {
        this.newR3.push(this.R3[i]);
      }
    }

    console.log(this.newR3); //defragmentation SHOULD be successful at this point
    let t1 = performance.now();
    this.performanceR3 = t1 - t0;
    console.log("Performance of the R3 algorithm is: " + this.performanceR3 + "milliseconds.");

    this.timeslotR3 = this.newR3.length; //time slots filled
    let tempSlot = new Array();
    for(let i=0; i<this.newR3.length; i++) {
      tempSlot.push(this.newR3[i].data);
    }
    let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
    console.log(uniquePolNum);
    this.orderslotR3 = uniquePolNum.length;
  }

removeDuplicates(originalArray, prop) {
  let newArray = [];
  let lookupObject  = {};

  for(let i in originalArray) {
     lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(let i in lookupObject) {
      newArray.push(lookupObject[i]);
  }
   return newArray;
}

triggerR1Modified() {
    let t0 = performance.now();
    this.newR1Modified = new Array();
    let tempArray = new Array();
    let R1Unavailables = new Array();
    let readyR1 = new Array();
    let modifier = new Array();
    for(let i=0; i<this.data.length; i++) {
      tempArray.push(this.data[i]);
      tempArray[i].flag = false; //to mark, if this slot is compatible with other
    }

    tempArray.sort(function(a,b) { //sort according to finish times in ascending order
      return a.timeOut - b.timeOut;
    });

    console.log(tempArray);
    //let dumpArray = tempArray;
    let found = false;
    let iterate = true;

    R1Unavailables.push(tempArray[0]);
    tempArray[0].flag = true;

    while(iterate) {
      found = false;
      modifier = new Array();
    for(let i=1; i<tempArray.length; i++) {
      if(tempArray[i].timeIn > R1Unavailables[R1Unavailables.length-1].timeOut && tempArray[i].flag == false) {
        //tempArray[i].flag = true;
        //R1Unavailables.push(tempArray[i]);
        modifier.push(tempArray[i]);
        //found = true;
        //break;
      } 
    }

    try{
      modifier.sort(function(a,b) { //sort according to finish times in ascending order
        return a.timeIn - b.timeIn; //core logic: a.timeIn - b.timeIn , by timeIn asc; b.duration - a.duration , by duration desc
      });
      //console.log(modifier);
      tempArray[tempArray.findIndex(i => i.polNum == modifier[0].polNum)].flag = true;
      R1Unavailables.push(modifier[0]);
      found = true;
    }catch(e){ }

    if(!found) {
      let dumpArray = tempArray.filter(f => f.flag == false);
      //console.log(dumpArray);
      try{
        //console.log(tempArray.findIndex(i => i.polNum == dumpArray[0].polNum));
        tempArray[tempArray.findIndex(i => i.polNum == dumpArray[0].polNum)].flag = true;
        R1Unavailables.push(dumpArray[0]);
      }catch(e){ console.log(e);}

    }
    for(let i=0; i<tempArray.length; i++) {
      if(tempArray[i].flag == false) {
        iterate = true;
        break;
      } else if(tempArray[i].flag == true) {
        iterate = false;
      }
    }
  }

  console.log(R1Unavailables);

  //find duration of each order in data
  for(let i=0; i<R1Unavailables.length; i++) {
    R1Unavailables[i].duration = (R1Unavailables[i].timeOut - R1Unavailables[i].timeIn) + 1; //because timeIn itself is included
  }

  for(let i=0; i<R1Unavailables.length; i++) {
    readyR1.push([]);
    for(let j=0; j<R1Unavailables[i].duration; j++) {
      let obj = 
      {
        "isAvailable": false,
        "polNum": R1Unavailables[i].polNum,
        "time": R1Unavailables[i].timeIn+j
      }
      readyR1[i].push(obj); 
    }
  }

  console.log(readyR1);

//part2

    //RESERVATION DEFRAGMENTATION LOGIC BEGINS
    let posNum = 1;
    let counter = 0;
    let x = 0;
    let y = 0;
    let dummy;
    let passer = false;

    for(let i=0; i<readyR1.length; i++) {
      for(let posNum = 1; posNum<201; posNum++) {
        passer = false;
        dummy = this.R1Modified.filter(f => f.data.pos == posNum);
        for(let j=0; j<readyR1[i].length; j++) {
          for(let k=0; k<48; k++) { //<10 TO USE WITH THE 60 SLOTS. OR 24 TO USE WITH 144 SLOTS #IMPORTANT
            if(dummy[k].data.isAvailable == true && dummy[k].data.time == readyR1[i][j].time) {
              counter++;
              if(counter == readyR1[i].length) {
                for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                  dummy[l].data.isAvailable = false; //useless maybe
                  this.newR1Modified.push(dummy[l]);
                  this.newR1Modified[y].data.polNum = readyR1[i][j].polNum; //to put polnum into keys
                  y++;
                  //console.log(dummy[l]);
                  x = this.R1Modified.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                  //x = this.R1Modified.findIndex(i => i.key == dummy[l].key); compatible with online slots
                  this.R1Modified[x].data.isAvailable = false; //somewhat doesn't matter, i think
                }
                counter = 0; //reset counter
                passer = true;
                break; //doesn't matter even if doesn't exist
              }
              break;
            }else {
            }
          }
        }
        counter = 0;
        if(passer) {
          break;
        }
      }
    }

    console.log(this.newR1Modified); //defragmentation SHOULD be successful at this point
    let t1 = performance.now();
    this.performanceR1Modified = t1 - t0;
    console.log("Performance of the R1-Modified algorithm is: " + this.performanceR1Modified + "milliseconds.");

    this.timeslotR1Modified = this.newR1Modified.length; //time slots filled
    let tempSlot = new Array();
    for(let i=0; i<this.newR1Modified.length; i++) {
      tempSlot.push(this.newR1Modified[i].data);
    }
    let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
    console.log(uniquePolNum);
    this.orderslotR1Modified = uniquePolNum.length;

}

triggerR1Modified2() { //Get the largest duration to fill into the next
  let t0 = performance.now();
  this.newR1Modified2 = new Array();
  let tempArray = new Array();
  let R1Unavailables = new Array();
  let readyR1 = new Array();
  let modifier = new Array();
  for(let i=0; i<this.data.length; i++) {
    tempArray.push(this.data[i]);
    tempArray[i].flag = false; //to mark, if this slot is compatible with other
  }

  tempArray.sort(function(a,b) { //sort according to finish times in ascending order
    return a.timeOut - b.timeOut;
  });

  console.log(tempArray);
  //let dumpArray = tempArray;
  let found = false;
  let iterate = true;

  R1Unavailables.push(tempArray[0]);
  tempArray[0].flag = true;

  while(iterate) {
    found = false;
    modifier = new Array();
  for(let i=1; i<tempArray.length; i++) {
    if(tempArray[i].timeIn > R1Unavailables[R1Unavailables.length-1].timeOut && tempArray[i].flag == false) {
      //tempArray[i].flag = true;
      //R1Unavailables.push(tempArray[i]);
      modifier.push(tempArray[i]);
      //found = true;
      //break;
    } 
  }

  try{
    modifier.sort(function(a,b) { //sort according to finish times in ascending order
      return b.duration - a.duration; //core logic: a.timeIn - b.timeIn , by timeIn asc; b.duration - a.duration , by duration desc
    });
    //console.log(modifier);
    tempArray[tempArray.findIndex(i => i.polNum == modifier[0].polNum)].flag = true;
    R1Unavailables.push(modifier[0]);
    found = true;
  }catch(e){ }

  if(!found) {
    let dumpArray = tempArray.filter(f => f.flag == false);
    //console.log(dumpArray);
    try{
      //console.log(tempArray.findIndex(i => i.polNum == dumpArray[0].polNum));
      tempArray[tempArray.findIndex(i => i.polNum == dumpArray[0].polNum)].flag = true;
      R1Unavailables.push(dumpArray[0]);
    }catch(e){ console.log(e);}

  }
  for(let i=0; i<tempArray.length; i++) {
    if(tempArray[i].flag == false) {
      iterate = true;
      break;
    } else if(tempArray[i].flag == true) {
      iterate = false;
    }
  }
}

console.log(R1Unavailables);

//find duration of each order in data
for(let i=0; i<R1Unavailables.length; i++) {
  R1Unavailables[i].duration = (R1Unavailables[i].timeOut - R1Unavailables[i].timeIn) + 1; //because timeIn itself is included
}

for(let i=0; i<R1Unavailables.length; i++) {
  readyR1.push([]);
  for(let j=0; j<R1Unavailables[i].duration; j++) {
    let obj = 
    {
      "isAvailable": false,
      "polNum": R1Unavailables[i].polNum,
      "time": R1Unavailables[i].timeIn+j
    }
    readyR1[i].push(obj); 
  }
}

console.log(readyR1);

//part2

  //RESERVATION DEFRAGMENTATION LOGIC BEGINS
  let posNum = 1;
  let counter = 0;
  let x = 0;
  let y = 0;
  let dummy;
  let passer = false;

  for(let i=0; i<readyR1.length; i++) {
    for(let posNum = 1; posNum<201; posNum++) {
      passer = false;
      dummy = this.R1Modified2.filter(f => f.data.pos == posNum);
      for(let j=0; j<readyR1[i].length; j++) {
        for(let k=0; k<48; k++) { //<10 TO USE WITH THE 60 SLOTS. OR 24 TO USE WITH 144 SLOTS #IMPORTANT
          if(dummy[k].data.isAvailable == true && dummy[k].data.time == readyR1[i][j].time) {
            counter++;
            if(counter == readyR1[i].length) {
              for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                dummy[l].data.isAvailable = false; //useless maybe
                this.newR1Modified2.push(dummy[l]);
                this.newR1Modified2[y].data.polNum = readyR1[i][j].polNum; //to put polnum into keys
                y++;
                //console.log(dummy[l]);
                x = this.R1Modified2.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                //x = this.R1Modified2.findIndex(i => i.key == dummy[l].key); compatible with online slots
                this.R1Modified2[x].data.isAvailable = false; //somewhat doesn't matter, i think
              }
              counter = 0; //reset counter
              passer = true;
              break; //doesn't matter even if doesn't exist
            }
            break;
          }else {
          }
        }
      }
      counter = 0;
      if(passer) {
        break;
      }
    }
  }

  console.log(this.newR1Modified2); //defragmentation SHOULD be successful at this point
  let t1 = performance.now();
  this.performanceR1Modified2 = t1 - t0;
  console.log("Performance of the R1-Modified algorithm is: " + this.performanceR1Modified2 + "milliseconds.");

  this.timeslotR1Modified2 = this.newR1Modified2.length; //time slots filled
  let tempSlot = new Array();
  for(let i=0; i<this.newR1Modified2.length; i++) {
    tempSlot.push(this.newR1Modified2[i].data);
  }
  let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
  console.log(uniquePolNum);
  this.orderslotR1Modified2 = uniquePolNum.length;

}

triggerR1Modified3() { //sort reversed; according to finish times in Descending order
  let t0 = performance.now();
  this.newR1Modified3 = new Array();
  let tempArray = new Array();
  let R1Unavailables = new Array();
  let readyR1 = new Array();
  for(let i=0; i<this.data.length; i++) {
    tempArray.push(this.data[i]);
    tempArray[i].flag = false; //to mark, if this slot is compatible with other
  }

  tempArray.sort(function(a,b) { //sort according to finish times in ascending order (Modified here)
    return b.timeOut - a.timeOut;
  });

  console.log(tempArray);
  //let dumpArray = tempArray;
  let found = false;
  let iterate = true;

  R1Unavailables.push(tempArray[0]);
  tempArray[0].flag = true;

  while(iterate) {
    found = false;
  for(let i=1; i<tempArray.length; i++) {
    if(tempArray[i].timeIn > R1Unavailables[R1Unavailables.length-1].timeOut && tempArray[i].flag == false) {
      tempArray[i].flag = true;
      R1Unavailables.push(tempArray[i]);
      found = true;
      break;
    } 
  }
  if(!found) {
    let dumpArray = tempArray.filter(f => f.flag == false);
    try{
      tempArray[tempArray.findIndex(i => i.polNum == dumpArray[0].polNum)].flag = true;
      R1Unavailables.push(dumpArray[0]);
    }catch(e){ console.log(e);}

  }
  for(let i=0; i<tempArray.length; i++) {
    if(tempArray[i].flag == false) {
      iterate = true;
      break;
    } else if(tempArray[i].flag == true) {
      iterate = false;
    }
  }
}

console.log(R1Unavailables);

//find duration of each order in data
for(let i=0; i<R1Unavailables.length; i++) {
  R1Unavailables[i].duration = (R1Unavailables[i].timeOut - R1Unavailables[i].timeIn) + 1; //because timeIn itself is included
}

for(let i=0; i<R1Unavailables.length; i++) {
  readyR1.push([]);
  for(let j=0; j<R1Unavailables[i].duration; j++) {
    let obj = 
    {
      "isAvailable": false,
      "polNum": R1Unavailables[i].polNum,
      "time": R1Unavailables[i].timeIn+j
    }
    readyR1[i].push(obj); 
  }
}

console.log(readyR1);

//part2

  //RESERVATION DEFRAGMENTATION LOGIC BEGINS
  let posNum = 1;
  let counter = 0;
  let x = 0;
  let y = 0;
  let dummy;
  let passer = false;

  for(let i=0; i<readyR1.length; i++) {
    for(let posNum = 1; posNum<201; posNum++) {
      passer = false;
      dummy = this.R1Modified3.filter(f => f.data.pos == posNum);
      for(let j=0; j<readyR1[i].length; j++) {
        for(let k=0; k<48; k++) { //#IMPORTANT
          if(dummy[k].data.isAvailable == true && dummy[k].data.time == readyR1[i][j].time) {
            counter++;
            if(counter == readyR1[i].length) {
              for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                dummy[l].data.isAvailable = false;
                this.newR1Modified3.push(dummy[l]);
                this.newR1Modified3[y].data.polNum = readyR1[i][j].polNum; //to put polnum into keys
                y++;
                //console.log(dummy[l]);
                x = this.R1Modified3.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                //x = this.R1.findIndex(i => i.key == dummy[l].key); compatible with online slots
                this.R1Modified3[x].data.isAvailable = false; //somewhat doesn't matter, i think
              }
              counter = 0; //reset counter
              passer = true;
              break; //doesn't matter even if doesn't exist
            }
            break;
          }else {
          }
        }
      }
      counter = 0;
      if(passer) {
        break;
      }
    }
  }

  console.log(this.newR1Modified3); //defragmentation SHOULD be successful at this point
  let t1 = performance.now();
  this.performanceR1Modified3 = t1 - t0;
  console.log("Performance of the R1 algorithm is: " + this.performanceR1Modified3 + "milliseconds.");

  this.timeslotR1Modified3 = this.newR1Modified3.length; //time slots filled
  let tempSlot = new Array();
  for(let i=0; i<this.newR1Modified3.length; i++) {
    tempSlot.push(this.newR1Modified3[i].data);
  }
  let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
  console.log(uniquePolNum);
  this.orderslotR1Modified3 = uniquePolNum.length;
}



triggerR2Modified() {
  let t0 = performance.now();
  //get from API
  //this.sortedUnavailables = []
  this.sortedUnavailables = new Array();
  let tempArray = new Array();

  //find duration of each order in data
  for(let i=0; i<this.data.length; i++) {
    tempArray.push(this.data[i]);
  }
  
  for(let i=0; i<tempArray.length; i++) {
    this.sortedUnavailables.push([]);
    for(let j=0; j<tempArray[i].duration; j++) {
      let obj = 
      {
        "isAvailable": false,
        "polNum": tempArray[i].polNum,
        "time": tempArray[i].timeIn+j
      }
      this.sortedUnavailables[i].push(obj); 
    }
  }

  console.log(this.sortedUnavailables);


/*this.sortedUnavailables.sort(function(a,b) { //sort according to length (duration of each order) descending
return b.length - a.length;
});*/

this.sortedUnavailables.sort(function(a,b) { //sort according to length (duration of each order) ascending
  return a.length - b.length;
  });

//this.sortedUnavailables = this.insertionSort(this.sortedUnavailables);

console.log(this.sortedUnavailables);

  //RESERVATION DEFRAGMENTATION LOGIC BEGINS
  let posNum = 1;
  let counter = 0;
  let x = 0;
  let y = 0;
  let dummy;
  let passer = false;

  for(let i=0; i<this.sortedUnavailables.length; i++) {
    for(let posNum = 1; posNum<201; posNum++) {
      passer = false;
      dummy = this.R2Modified.filter(f => f.data.pos == posNum);
      for(let j=0; j<this.sortedUnavailables[i].length; j++) {
        for(let k=0; k<48; k++) { //<10 TO USE WITH THE 60 SLOTS. OR 24 TO USE WITH 144 SLOTS #IMPORTANT
          if(dummy[k].data.isAvailable == true && dummy[k].data.time == this.sortedUnavailables[i][j].time) {
            counter++;
            if(counter == this.sortedUnavailables[i].length) {
              for(let l = (k-counter)+1; l<(k+1); l++) { //idk why +1 tbh but it works
                dummy[l].data.isAvailable = false; //useless maybe
                this.newR2Modified.push(dummy[l]);
                this.newR2Modified[y].data.polNum = this.sortedUnavailables[i][j].polNum; //to put polnum into keys
                y++;
                x = this.R2Modified.findIndex(i => i.data.id == dummy[l].data.id); //compatible with offline slots
                //x = this.R2.findIndex(i => i.key == dummy[l].key); compatible with online slots
                this.R2Modified[x].data.isAvailable = false; //somewhat doesn't matter, i think
              }
              counter = 0; //reset counter
              passer = true;
              break; //doesn't matter even if doesn't exist
            }
            break;
          }else {
          }
        }
      }
      counter = 0;
      if(passer) {
        break;
      }
    }
  }

  console.log(this.newR2Modified); //defragmentation SHOULD be successful at this point
  let t1 = performance.now();
  this.performanceR2Modified = t1 - t0;
  console.log("Performance of the R2-Modified algorithm is: " + this.performanceR2Modified + "milliseconds.");

  this.timeslotR2Modified = this.newR2Modified.length; //time slots filled
  let tempSlot = new Array();
  for(let i=0; i<this.newR2Modified.length; i++) {
    tempSlot.push(this.newR2Modified[i].data);
  }
  let uniquePolNum = this.removeDuplicates(tempSlot, 'polNum');
  console.log(uniquePolNum);
  this.orderslotR2Modified = uniquePolNum.length;

}

triggerAll() {
  
  if(this.checkboxFirstfit) { this.triggerFirstfit(); }
  if(this.checkboxR1) { this.triggerR1(); }
  if(this.checkboxR2) { this.triggerR2(); }
  if(this.checkboxR3) { this.triggerR3(); }
  if(this.checkboxR1M) { this.triggerR1Modified(); }
  if(this.checkboxR1M2) { this.triggerR1Modified2(); }
  if(this.checkboxR1M3) { this.triggerR1Modified3(); }
  if(this.checkboxR2M) { this.triggerR2Modified(); }


  this.ALGORITHM_RESULTS = [
    {algorithm: 'First Fit', timeSlot: this.timeslotFirstfit, orderSlot: this.orderslotFirstfit, performance: this.performanceFirstfit},
    {algorithm: 'R1', timeSlot: this.timeslotR1, orderSlot: this.orderslotR1, performance: this.performanceR1},
    {algorithm: 'R2', timeSlot: this.timeslotR2, orderSlot: this.orderslotR2, performance: this.performanceR2},
    {algorithm: 'R3', timeSlot: this.timeslotR3, orderSlot: this.orderslotR3, performance: this.performanceR3},
    {algorithm: 'R1 Modified', timeSlot: this.timeslotR1Modified, orderSlot: this.orderslotR1Modified, performance: this.performanceR1Modified},
    {algorithm: 'R1 Modified 2', timeSlot: this.timeslotR1Modified2, orderSlot: this.orderslotR1Modified2, performance: this.performanceR1Modified2},
    {algorithm: 'R1 Modified 3', timeSlot: this.timeslotR1Modified3, orderSlot: this.orderslotR1Modified3, performance: this.performanceR1Modified3},
    {algorithm: 'R2 Modified', timeSlot: this.timeslotR2Modified, orderSlot: this.orderslotR2Modified, performance: this.performanceR2Modified},
  ] //maybe add total time occupancy: timeSlot/totalduration & total order occupancy: orderSlot/1000

  this.dataSource2 = this.ALGORITHM_RESULTS;
  this.dataSource2 = new MatTableDataSource<Data>(this.ALGORITHM_RESULTS);

  

}

//SORT ALGORITHMS EXPERIMENT
 insertionSort(array) {
  for(var i = 0; i < array.length; i++) {
    var temp = array[i];
    var j = i - 1;
    while (j >= 0 && array[j].length > temp.length) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = temp;
  }
  return array;
}

}
