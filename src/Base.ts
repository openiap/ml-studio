export class Base {
    _id: string;
    _type: string = 'unknown';
    _acl: Ace[] = [];
    name: string;
    _name: string;
    _encrypt: string[] = [];

    _createdbyid: string;
    _createdby: string;
    _created: Date;
    _modifiedbyid: string;
    _modifiedby: string;
    _modified: Date;
    _version: number = 0;
    constructor() {
        Base.addRight(this, WellknownIds.admins, 'admins', [Rights.full_control]);
    }
    /**
     * Create new instance of object, using values from input object
     * @param  {T} o Base object
     * @returns T New object as Type
     */
    static assign<T>(source: T): T {
        return Object.assign(new Base(), source);
    }
    /**
     * Enumerate ACL for specefic ID
     * @param  {string} _id Id to search for
     * @param  {boolean=false} deny look for deny or allow permission
     * @returns Ace Ace if found, else null
     */
    static getRight(item: Base, _id: string, deny: boolean = false): Ace {
        let result: any;
        if (!item._acl) {
            item._acl = [];
        }
        item._acl.forEach((a, index) => {
            if (a._id === _id && (a.deny === deny || a.deny == null)) {
                result = item._acl[index];
            }
        });
        return result;
    }
    /**
     * Set right for specefic id, if exists
     * @param  {Ace} x
     * @returns void
     */
    static setRight(item: Base, x: Ace): void {
        if (!item._acl) {
            item._acl = [];
        }
        item._acl.forEach((a, index) => {
            if (a._id === x._id && (a.deny === x.deny || a.deny == null)) {
                item._acl[index] = x;
            }
        });
    }
    /**
     * Add/update right for user/role
     * @param  {string} _id user/role id
     * @param  {string} name Displayname for user/role
     * @param  {number[]} rights Right to set
     * @param  {boolean=false} deny Deny the right
     * @returns void
     */
    static addRight(item: Base, _id: string, name: string, rights: number[], deny: boolean = false): void {
        let right: Ace = Base.getRight(item, _id, deny);
        if (!right) {
            right = new Ace();
            Ace.resetnone(right);
            item._acl.push(right);
        }
        if (deny == true) right.deny = deny;
        right._id = _id;
        if (name != null && name != "") right.name = name;
        if (rights[0] === -1) {
            Ace.resetfullcontrol(right)
            // for (let i: number = 0; i < 1000; i++) {
            //     Ace.setBit(right, i);
            // }
        } else {
            rights.forEach((bit) => {
                try {
                    Ace.setBit(right, bit);
                } catch (error) {
                    throw error;
                }
            });
        }
        Base.setRight(item, right);
    }
    /**
     * Remove a right from user/role
     * @param  {string} _id user/role id
     * @param  {number[]=null} rights Right to revoke
     * @param  {boolean=false} deny Deny right
     * @returns void
     */
    static removeRight(item: Base, _id: string, rights: number[], deny: boolean = false): void {
        if (!item._acl) {
            item._acl = [];
        }
        const right: Ace = Base.getRight(item, _id, deny);
        if (!right) {
            return;
        }
        if (rights[0] === -1) {
            item._acl = item._acl.filter(x => x._id !== _id);
        } else {
            rights.forEach((bit) => {
                Ace.unsetBit(right, bit);
            });
        }
        Base.setRight(item, right);
    }
    static hasRight(item: Base, _id: string, bit: number, deny: boolean = false): boolean {
        const ace = Base.getRight(item, _id, deny);
        if (ace == null) return false;
        return Ace.isBitSet(ace, bit);
    }
}
export class Ace {
    // tslint:disable-next-line: variable-name
    public static ace_right_bits: number = 16;
    public static full_control: number = 65535;
    public deny: boolean = false;
    public _id: string;
    public name: string;
    // public rights: string = "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=";
    public rights: string | number = 65535;
    constructor() {
    }
    static resetfullcontrol(item: Ace) {
        if (typeof item.rights === "number") {
            // for (var i = 0; i < item.ace_right_bits; i++) {
            //     Ace.setBit(item, i + 1);
            // }
            item.rights = 65535;
        } else {
            item.rights = "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=";
        }
    }
    static resetnone(item: Ace) {
        if (typeof item.rights === "number") {
            item.rights = 0;
        } else {
            item.rights = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIA="
        }
    }
    static _base64ToArrayBuffer(base64): ArrayBuffer {
        let binarystring: string;
        try {
            binarystring = window.atob(base64);
        } catch (error) {
            throw error;
        }
        const len = binarystring.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            const ascii = binarystring.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes.buffer;
    }
    static _arrayBufferToBase64(arraybuffer): string {
        let binary = '';
        const bytes = new Uint8Array(arraybuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary);
    }
    static isBitSet(item: Ace, bit: number): boolean {
        bit--;
        // if rights is number
        let currentValue: number = item.rights as any;
        let mask: number = 1 << bit;
        if (bit == -2) {
            if (item.rights == Ace.full_control || item.rights == "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=") {
                return true;
            }
            for (var i = 0; i < Ace.ace_right_bits; i++) {
                if (!Ace.isBitSet(item, i)) {
                    return false;
                }
            }
        }
        if (typeof currentValue === "number") {
        } else {
            let rights = item.rights;
            // if (typeof rights === "string" || typeof rights === "object") {
            if (typeof rights === "object") {
                rights = JSON.stringify(item.rights);
            } else if (Array.isArray(rights)) {
                rights = JSON.stringify(item.rights);
            }
            const buf = Ace._base64ToArrayBuffer(rights);
            const view = new Uint8Array(buf);
            const octet = Math.floor(bit / 8);
            currentValue = view[octet];
            const _bit = (bit % 8);
            mask = Math.pow(2, _bit);
            // tslint:disable-next-line: no-bitwise
        }
        return (currentValue & mask) !== 0;
    }
    static setBit(item: Ace, bit: number) {
        bit--;
        let currentValue: number = item.rights as any;
        let mask: number = 1 << bit;
        if (typeof currentValue === "number") {
            // @ts-ignore
            item.rights |= mask;
            // item.rights = currentValue |= mask;
            // var test1 = this.isBitSet(item, bit + 1)
            // var test2 = this.isBitSet(item, bit)
        } else {
            let rights = item.rights;
            if (typeof rights === "object") {
                rights = JSON.stringify(item.rights);
            } else if (Array.isArray(rights)) {
                rights = JSON.stringify(item.rights);
            }
            const buf = Ace._base64ToArrayBuffer(rights);
            const view = new Uint8Array(buf);
            const octet = Math.floor(bit / 8);
            currentValue = view[octet];
            const _bit = (bit % 8);
            mask = Math.pow(2, _bit);
            // tslint:disable-next-line: no-bitwise
            const newValue = currentValue | mask;
            view[octet] = newValue;
            item.rights = Ace._arrayBufferToBase64(view);
        }
        return item.rights;
    }
    static unsetBit(item: Ace, bit: number) {
        bit--;
        let currentValue: number = item.rights as any;
        let mask: number = 1 << bit;
        if (typeof currentValue === "number") {
            // @ts-ignore
            item.rights = currentValue &= ~mask;
        } else {
            let rights = item.rights;
            if (typeof rights === "object") {
                rights = JSON.stringify(item.rights);
            }
            const buf = Ace._base64ToArrayBuffer(rights);
            const view = new Uint8Array(buf);
            const octet = Math.floor(bit / 8);
            currentValue = view[octet];
            const _bit = (bit % 8);
            mask = Math.pow(2, _bit);
            // tslint:disable-next-line: no-bitwise
            const newValue = currentValue &= ~mask;
            view[octet] = newValue;
            item.rights = Ace._arrayBufferToBase64(view);
        }
        return item.rights;
    }
    static toogleBit(item: Ace, bit: number) {
        if (Ace.isBitSet(item, bit)) {
            Ace.unsetBit(item, bit);
        } else {
            Ace.setBit(item, bit);
        }
    }
}
export class WellknownIds {
    static root: string = '59f1f6e6f0a22200126638d8';
  
    static admins: string = '5a1702fa245d9013697656fb';
    static users: string = '5a17f157c4815318c8536c21';
    static robots: string = '5ac0850ca538fee1ebdb996c';
    static customer_admins: string = '5a1702fa245d9013697656fc';
    static resellers: string = '5a1702fa245d9013697656fd';
  
    // tslint:disable-next-line: variable-name
    static nodered_users: string = '5a23f18a2e8987292ddbe061';
    // tslint:disable-next-line: variable-name
    static nodered_admins: string = '5a17f157c4815318c8536c20';
    // tslint:disable-next-line: variable-name
    static nodered_api_users: string = "5a17f157c4815318c8536c22";
    // tslint:disable-next-line: variable-name
    static filestore_users: string = '5b6ab63c8d4a64b7c47f4a8f';
    // tslint:disable-next-line: variable-name
    static filestore_admins: string = '5b6ab63c8d4a64b7c47f4a8e';
    // tslint:disable-next-line: variable-name
    static robot_users: string = '5aef0142f3683977b0aa3dd3';
    // tslint:disable-next-line: variable-name
    static robot_admins: string = '5aef0142f3683977b0aa3dd2';
    // tslint:disable-next-line: variable-name
    static personal_nodered_users: string = '5a23f18a2e8987292ddbe062';
    // tslint:disable-next-line: variable-name
    static robot_agent_users: string = '5f33c29d8fe78504bd259a04';
  }
  export class Rights {
    static create = 1;
    static read = 2;
    static update = 3;
    static delete = 4;
    static invoke = 5;
    // tslint:disable-next-line: variable-name
    static full_control = -1;
}
