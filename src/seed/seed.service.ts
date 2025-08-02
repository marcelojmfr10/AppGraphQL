import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService
    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed() {
        if(this.isProd) {
            throw new UnauthorizedException('We cannot run SEED on Prod');
        }

        // limpiar la base de datos
        await this.deleteDatabase();

        // crear usuarios
        const user = await this.loadUsers();

        // crear items
        await this.loadItems(user);

        return true;
    }

    async deleteDatabase() {
        // borrar items
        await this.itemsRepository.createQueryBuilder().delete().where({}).execute();

        // borrar usuarios
        await this.usersRepository.createQueryBuilder().delete().where({}).execute();
    }

    async loadUsers(): Promise<User[]> {
        const users: User[] = [];

        for (const user of SEED_USERS ) {
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

}
