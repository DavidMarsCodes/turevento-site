import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Contact } from 'app/main/apps/contacts/contact.model';

@Component({
    selector: 'contacts-contact-form-dialog',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ContactsContactFormDialogComponent {
    action: string;
    contact: Contact;
    contactForm: FormGroup;
    dialogTitle: string;
    checked = true;


    contactOptions: any[] = [
        {value: 'null', name: 'No contactado'},
        {value: 'phone', name: 'Por teléfono'},
        {value: 'email', name: 'Por email'}


    ]

    asisteOptions: any[] = [
        { value: 'null', name: 'En proceso' },
        { value: 'si', name: 'Confirmado' },
        { value: 'no', name: 'Cancelado' }


    ]
    /**
     * Constructor
     *
     * @param {MatDialogRef<ContactsContactFormDialogComponent>} matDialogRef
     * @param _data
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        public matDialogRef: MatDialogRef<ContactsContactFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder
    ) {
        // Set the defaults
        this.action = _data.action;

        if (this.action === 'edit') {
            this.dialogTitle = 'Editar invitado';
            this.contact = _data.contact;
        }
        else {
            this.dialogTitle = 'Nuevo Invitado';
            this.contact = new Contact({});
        }

        this.contactForm = this.createContactForm();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create contact form
     *
     * @returns {FormGroup}
     */
    createContactForm(): FormGroup
    {
    

        return this._formBuilder.group({
            id: [this.contact.id],
            name: [this.contact.name, [Validators.required]],
            lastname: [this.contact.lastname],
            company: [this.contact.company],
            jobtitle: [this.contact.jobtitle],
            email: [this.contact.email, Validators.email],
            asiste: [this.contact.asiste],
            contactado: [this.contact.contactado],
            phone: [this.contact.phone],
            address: [this.contact.address],
            birthday: [this.contact.birthday],
            notes: [this.contact.notes],
            street: [this.contact.street],
            city: [this.contact.city],
            country: [this.contact.country],
            phoneMobil: [this.contact.phoneMobil]
        });
    }
}
