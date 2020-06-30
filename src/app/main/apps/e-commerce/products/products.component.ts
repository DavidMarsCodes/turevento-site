import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';

import { EcommerceProductsService } from 'app/main/apps/e-commerce/products/products.service';
import { takeUntil } from 'rxjs/internal/operators';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatSnackBar, MatDialog } from '@angular/material';
import { WebsocketService } from 'app/services/websocket.service';


@Component({
    selector     : 'e-commerce-products',
    templateUrl  : './products.component.html',
    styleUrls    : ['./products.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class EcommerceProductsComponent implements OnInit, OnDestroy
{
    dataSource: FilesDataSource | null;
    displayedColumns = [ 'eventName', 'category', 'price', 'active', 'buttons'];
    eventExist: boolean = true;


    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    @ViewChild('filter', {static: true})
    filter: ElementRef;

    @ViewChild(MatSort, {static: true})
    sort: MatSort;

    // Private
    private _unsubscribeAll: Subject<any>;


    
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    

    constructor(
        public _ecommerceProductsService: EcommerceProductsService,
        private _matSnackBar: MatSnackBar,
        public _matDialog: MatDialog,
        

    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        
        this.dataSource = new FilesDataSource(this._ecommerceProductsService, this.paginator, this.sort);

        if(this._ecommerceProductsService.products.length > 0) {



            this.eventExist = true

        }
        else {
            this.eventExist = false

         
            

        }

        fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(150),
            distinctUntilChanged()
        )
        .subscribe(() => {

         
            if ( !this.dataSource )
            {
                return;
            }
            this.dataSource.filter = this.filter.nativeElement.value;
        });



            
    }


    eventDelete(product){


        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false,
            
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Seguro que desea eliminarlo?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {

        

                this._ecommerceProductsService.deleteEvent(product)

                
                .then(x => {
        
                           
                    this._matSnackBar.open('Evento eliminado', 'OK', {
                        verticalPosition: 'top',
                        duration        : 3000
                    });
                })
                
            }
            this.confirmDialogRef = null;
        });


}

ngOnDestroy(): void
{
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
}
}

export class FilesDataSource extends DataSource<any>
{
    private _filterChange = new BehaviorSubject('');
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {EcommerceProductsService} _ecommerceProductsService
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private _ecommerceProductsService: EcommerceProductsService,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();

        this.filteredData = this._ecommerceProductsService.products;
    }

    
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    // Filter
    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this._ecommerceProductsService.onProductsChanged,
            this._matPaginator.page,
            this._filterChange,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this._ecommerceProductsService.products.slice();

                        data = this.filterData(data);

                        this.filteredData = [...data];

                        data = this.sortData(data);

                        // Grab the page's slice of data.
                        const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                        return data.splice(startIndex, this._matPaginator.pageSize);
                    }
                ));
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter data
     *
     * @param data
     * @returns {any}
     */
    filterData(data): any
    {
        if ( !this.filter )
        {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[]
    {
        if ( !this._matSort.active || this._matSort.direction === '' )
        {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch ( this._matSort.active )
            {
                case 'id':
                    [propertyA, propertyB] = [a.id, b.id];
                    break;
                case 'eventName':
                    [propertyA, propertyB] = [a.eventName, b.eventName];
                    break;
                case 'categories':
                    [propertyA, propertyB] = [a.categories[0], b.categories[0]];
                    break;
                case 'price':
                    [propertyA, propertyB] = [a.priceTaxIncl, b.priceTaxIncl];
                    break;
                case 'quantity':
                    [propertyA, propertyB] = [a.quantity, b.quantity];
                    break;
                case 'active':
                    [propertyA, propertyB] = [a.active, b.active];
                    break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }


    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}





