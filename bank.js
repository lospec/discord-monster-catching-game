import { MonsterGameConfig } from "./bot";
import http from "http";

//TODO: Make the network requests actually work
export default class Bank {
    constructor() {
        this.options = {
            hostname: MonsterGameConfig.get('bank.hostname'),
            port: MonsterGameConfig.get('bank.port'),
        }
        this.remote = MonsterGameConfig.get('bank.remote');
        this.bankStore = new Store({ path: './_data/bank-data.json' });
    }
    async getBalance(id) {
        if (this.remote) {
            this.options.path = '/balance/' + id;
            this.options.method = 'GET';
            http.request(this.options, res => {
                if (res.statusCode == 200) {
                    return res.body;
                }
                else {
                    throw new Error('Balance with that user id does not exist');
                }
            });
        } else {
            return this.bankStore.get(id.toString());
        }
    }
    async setBalance(id, balance) {
        if (this.remote) {
            this.options.path = '/balance/' + id;
            this.options.method = 'PUT';
            http.request(this.options, res => {
                if (res.statusCode == 200) {
                    return res.body;
                }
            });
        } else {
            return this.bankStore.set(id.toString(), balance);
        }
    }
    async addBalance(id, balance) {
        if (this.remote) {
            this.options.path = '/balance/' + id;
            this.options.method = 'POST';
            http.request(this.options, res => {
                if (res.statusCode == 200) {
                    return res.body;
                }
                else {
                    throw new Error('Balance with that user id does not exist');
                }
            });
        } else {
            return this.bankStore.set(id.toString(), this.bankStore.get(id.toString()) + balance);
        }
    }

}