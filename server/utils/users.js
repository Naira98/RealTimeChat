// [{
//     id: 1,
//     name: 'Naira',
//     room: 'Socket.io'
// }]

class User {
  constructor() {
    this.users = [];
  }

  addUser(id, name, room) {
    let user = { id, name, room };
    this.users.push(user);
    return user;
  }
  getUserList(room) {
    let users = this.users.filter((user) => user.room === room);
    let namesArray = users.map(user.name);
    return namesArray;
  }
  getUser(id) {
    return this.users.filter((user) => user.id === id);
  }
  removeUser(id) {
    let user = user.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== user.id);
    }
    return user;
  }
}

module.exports = { User };
