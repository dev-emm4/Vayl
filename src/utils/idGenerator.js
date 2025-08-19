class IdGenerator {
  generateId() {
    const random = Math.floor(Math.random() * 1000);
    const id = parseInt(random);
    return id;
  }
}

export default IdGenerator;
