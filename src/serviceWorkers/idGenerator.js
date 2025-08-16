class IdGenerator {
  generateId() {
    randomNumber = Math.floor(Math.random() * 2147483647) + 1;
    timeStamp = Date.now();
    id = parseInt(`${randomNumber}${timeStamp}`);

    return id;
  }
}

export default IdGenerator;
