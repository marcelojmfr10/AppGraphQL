import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,
        @InjectRepository(List)
        private readonly listRepository: Repository<List>,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listService: ListsService,
        private readonly listItemService: ListItemService
    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed() {
        if (this.isProd) {
            throw new UnauthorizedException('We cannot run SEED on Prod');
        }

        // limpiar la base de datos
        await this.deleteDatabase();

        // crear usuarios
        const user = await this.loadUsers();

        // crear items
        await this.loadItems(user);

        // crear lists
        const list = await this.loadLists(user);

        // crear list items
        const items = await this.itemsService.findAll(user[0], {limit: 15, offset: 0}, {});
        await this.loadListItems(list, items);

        return true;
    }

    async deleteDatabase() {
        // borrar list items
        await this.listItemsRepository.createQueryBuilder().delete().where({}).execute();

        // borrar lists
        await this.listRepository.createQueryBuilder().delete().where({}).execute();

        // borrar items
        await this.itemsRepository.createQueryBuilder().delete().where({}).execute();

        // borrar usuarios
        await this.usersRepository.createQueryBuilder().delete().where({}).execute();
    }

    async loadUsers(): Promise<User[]> {
        const users: User[] = [];

        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user))
        }

        return users;
    }

    async loadItems(users: User[]): Promise<void> {
        const itemsPromises: Promise<Item>[] = [];

        for (const item of SEED_ITEMS) {
            const randomIndex = Math.floor(Math.random() * users.length);
            const user = users[randomIndex];
            itemsPromises.push(this.itemsService.create(item, user));
        }

        await Promise.all(itemsPromises);
    }

    async loadLists(users: User[]): Promise<List> {
        const itemsPromises: Promise<List>[] = [];

        for (const item of SEED_LISTS) {
            const randomIndex = Math.floor(Math.random() * users.length);
            const user = users[randomIndex];
            itemsPromises.push(this.listService.create(item, user));
        }

        await Promise.all(itemsPromises);

        return itemsPromises[0];
    }

    async loadListItems(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random()) === 1,
                listId: list.id,
                itemId: item.id
            });
        }
    }

}
