import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";


@ObjectType() // lo que respondemos en los querys
export class AuthResponse {

    @Field(() => String)
    token: string;

    @Field(() => User)
    user: User;

}