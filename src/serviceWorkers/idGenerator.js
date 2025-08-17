class IdGenerator {
  generateId() {
    const randomNumber = Math.floor(Math.random() * 2147483647) + 1;
    const timeStamp = Date.now();
    const id = parseInt(`${randomNumber}${timeStamp}`);

    return id;
  }
}

export default IdGenerator;
