import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class dbService {

    public isLoading = new Subject<boolean>();

    constructor(private afs: AngularFirestore, private _http: HttpClient) {}

    getSlots(date: any) {
        console.log("Fetching data from service");
        return this.afs.collection('slots', ref => ref.where('date', '==', date).orderBy('id')).valueChanges();
    }

    getCancelable(date: any) {
        console.log("Fetching cancelable slots from service.");
        return this.afs.collection('slots', ref => ref.where('date', '==', date).where('isAvailable', '==', false).orderBy('id')).valueChanges();
    }

    setProgressBar(data: boolean) {
        this.isLoading.next(data);
    }

    getData() {
        return this._http.get('https://my.api.mockaroo.com/thesis.json?key=f8b75f80').map(res => res);
    }
}