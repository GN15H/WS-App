export interface IUserMap {
  id: number;
  user_name: string;
  email: string;
}

interface IUser {
  id: number;
  username: string;
  email: string;
}

export class User {
  id: number;
  username: string;
  email: string;

  constructor({ id, username, email }: IUser) {
    this.id = id;
    this.email = email;
    this.username = username;
  }

  static fromMap({ id, user_name, email }: IUserMap): User {
    return new User({
      id: id,
      username: user_name,
      email: email
    })
  }
}
